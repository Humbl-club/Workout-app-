import React, { useState, useCallback, useEffect } from 'react';
import { PlanDay, WorkoutLog, LoggedExercise, WorkoutPlan, DailyRoutine, UserProfile, WorkoutSession } from './types';
import { useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from './convex/_generated/api';
import { Id } from './convex/_generated/dataModel';
import Onboarding from './components/PlanImporter';
import SessionTracker from './components/SessionTracker';
import PreWorkoutScreen from './components/PreWorkoutScreen';
import Chatbot from './components/Chatbot';
import Navbar from './components/layout/Navbar';
import { ZapIcon } from './components/icons';
import HomePage from './pages/HomePage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import GoalTrackingPage from './pages/GoalTrackingPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import BuddiesPage from './pages/BuddiesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import useWorkoutLogs from './hooks/useWorkoutLogs';
import useWorkoutPlan from './hooks/useWorkoutPlan';
import useUserProfile from './hooks/useUserProfile';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import FullScreenLoader from './components/layout/FullScreenLoader';
import ToastContainer, { notify } from './components/layout/Toast';
import { useTheme } from './hooks/useTheme';
import { useAnalytics, analytics, EventTypes } from './services/analyticsService';
import { trackUserLogin } from './services/locationService';
import { ariaAnnouncer } from './services/ariaAnnouncer';
import ErrorBoundary from './components/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import OfflineIndicator from './components/OfflineIndicator';
import { useExercisePreload } from './hooks/useExercisePreload';

// Storage key for tracking if user has seen the landing page
const LANDING_SEEN_KEY = 'rebld:seen_landing';
const LOCATION_TRACKED_KEY = 'rebld:location_tracked';


type Page = 'home' | 'goals' | 'buddies' | 'plan' | 'profile' | 'admin';
// Extended to support WorkoutSession for 2x daily training
type SessionType = PlanDay | DailyRoutine | WorkoutSession;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Announce page changes for screen readers
  useEffect(() => {
    const pageNames: Record<Page, string> = {
      home: 'Home',
      goals: 'Goals',
      buddies: 'Buddies',
      plan: 'Plan',
      profile: 'Profile',
      admin: 'Admin Dashboard',
    };
    ariaAnnouncer.announcePage(pageNames[currentPage]);
  }, [currentPage]);
  const { user, isLoaded: clerkLoaded } = useUser();
  const { theme, toggleTheme } = useTheme();

  // Initialize analytics
  useAnalytics(user?.id || null);

  // Initialize ARIA announcer for accessibility
  useEffect(() => {
    ariaAnnouncer.init();
    return () => {
      ariaAnnouncer.destroy();
    };
  }, []);

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    enabled: true, // Can be disabled for iPhone-only mode
    shortcuts: [
      {
        key: 'k',
        meta: true,
        ctrl: true,
        action: () => setIsChatOpen(true),
        description: 'Open AI Chatbot',
        category: 'general',
      },
      {
        key: 'n',
        meta: true,
        ctrl: true,
        action: () => {
          if (activePlan?.weeklyPlan?.[0]) {
            handleStartSession(activePlan.weeklyPlan[0]);
          }
        },
        description: 'Start New Workout',
        category: 'workout',
      },
    ],
  });

  // NOTE: Exercise preloader DISABLED - was making 4000+ unnecessary API calls
  // Explanations are fetched on-demand when user taps an exercise
  // useExercisePreload({
  //   enabled: false,
  //   userId: user?.id || null,
  // });

  const {
    activePlan,
    allPlans,
    addPlan,
    deletePlan,
    updatePlan,
    setActivePlan,
    planLoaded
  } = useWorkoutPlan();
  const { logs, addLog, logsLoaded } = useWorkoutLogs();
  const { userProfile, updateUserProfile, profileLoaded } = useUserProfile();

  // Ensure user code is generated on login
  const ensureUserCodeMutation = useMutation(api.userCodeMutations.ensureUserCode);
  const updateLocationMutation = useMutation(api.healthMetrics.updateLocationData);
  const updateDeviceMutation = useMutation(api.healthMetrics.updateDeviceData);
  const deleteLogMutation = useMutation(api.mutations.deleteWorkoutLog);

  // Track user location and device on first login (once per session)
  useEffect(() => {
    if (user?.id && clerkLoaded) {
      // Generate user code
      ensureUserCodeMutation({ userId: user.id }).catch(() => {
        // Silent fail, will try again next time
      });

      // Track location (once per session to avoid rate limits)
      const sessionKey = `${LOCATION_TRACKED_KEY}_${user.id}`;
      const alreadyTracked = sessionStorage.getItem(sessionKey);

      if (!alreadyTracked) {
        trackUserLogin()
          .then(({ locationData, deviceData }) => {
            // Update location data
            if (locationData.country || locationData.timezone) {
              updateLocationMutation({
                userId: user.id,
                ...locationData,
              }).catch(console.error);
            }

            // Update device data
            updateDeviceMutation({
              userId: user.id,
              ...deviceData,
            }).catch(console.error);

            // Mark as tracked for this session
            sessionStorage.setItem(sessionKey, 'true');
          })
          .catch((error) => {
            console.error('Location tracking failed:', error);
          });
      }
    }
  }, [user?.id, clerkLoaded, ensureUserCodeMutation, updateLocationMutation, updateDeviceMutation]);

  // Admin dashboard URL handler
  useEffect(() => {
    // Check URL for admin access (#admin or /admin path)
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (hash === '#admin' || path.endsWith('/admin')) {
      setCurrentPage('admin');
    }

    // Listen for hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [activeSession, setActiveSession] = useState<PlanDay | null>(null);
  const [pendingSession, setPendingSession] = useState<PlanDay | null>(null); // For PreWorkoutScreen
  const [sessionToSummarize, setSessionToSummarize] = useState<WorkoutLog | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');

  // State for landing page flow
  const [showAuth, setShowAuth] = useState(() => {
    // Check if user has seen landing page before
    return localStorage.getItem(LANDING_SEEN_KEY) === 'true';
  });

  const handleStartSession = useCallback((session: SessionType) => {
    // Normalize different session types into a PlanDay so SessionTracker can handle it
    let normalizedSession: PlanDay;
    const today = new Date();
    const dow = today.getDay() === 0 ? 7 : today.getDay();

    // Case 1: DailyRoutine - has exercises array, no blocks
    if ('exercises' in session && !('blocks' in session)) {
      normalizedSession = {
        day_of_week: dow,
        focus: session.focus || 'Daily Routine',
        notes: session.notes,
        blocks: [
          {
            type: 'single',
            title: 'Daily Routine',
            exercises: session.exercises,
          },
        ],
      };
    }
    // Case 2: WorkoutSession (2x daily) - has session_name and time_of_day, no day_of_week
    else if ('session_name' in session && 'time_of_day' in session && !('day_of_week' in session)) {
      const workoutSession = session as WorkoutSession;
      normalizedSession = {
        day_of_week: dow,
        focus: workoutSession.session_name || (workoutSession.time_of_day === 'morning' ? 'AM Session' : 'PM Session'),
        notes: `${workoutSession.time_of_day === 'morning' ? '☀️ Morning' : '🌙 Evening'} session`,
        blocks: workoutSession.blocks || [],
      };
    }
    // Case 3: Already a valid PlanDay
    else {
      normalizedSession = session as PlanDay;
    }
    // Show PreWorkoutScreen first instead of jumping straight into session
    setPendingSession(normalizedSession);
  }, []);

  // Called when user confirms start from PreWorkoutScreen
  const handleConfirmStart = useCallback(() => {
    if (pendingSession) {
      setActiveSession(pendingSession);
      setPendingSession(null);

      // Track workout started
      if (user?.id) {
        analytics.track(EventTypes.WORKOUT_STARTED, {
          planId: activePlan?.id,
          dayOfWeek: pendingSession.day_of_week,
          focus: pendingSession.focus,
          blockCount: pendingSession.blocks?.length || 0,
        });
      }
    }
  }, [pendingSession, user?.id, activePlan?.id]);

  // Called when user cancels from PreWorkoutScreen
  const handleCancelPreWorkout = useCallback(() => {
    setPendingSession(null);
  }, []);

  // Quick start - bypass PreWorkoutScreen and go straight to workout
  const handleQuickStartSession = useCallback((session: SessionType) => {
    let normalizedSession: PlanDay;
    const today = new Date();
    const dow = today.getDay() === 0 ? 7 : today.getDay();

    // Case 1: DailyRoutine with routine_name
    if ('routine_name' in session) {
      normalizedSession = {
        day_of_week: dow,
        focus: (session as any).routine_name,
        blocks: (session as any).blocks || [],
        notes: 'Daily Routine',
      };
    }
    // Case 2: DailyRoutine - has exercises, no blocks
    else if ('exercises' in session && !('blocks' in session)) {
      normalizedSession = {
        day_of_week: dow,
        focus: session.focus || 'Daily Routine',
        notes: session.notes,
        blocks: [{ type: 'single', title: 'Daily Routine', exercises: session.exercises }],
      };
    }
    // Case 3: WorkoutSession (2x daily) - has session_name and time_of_day
    else if ('session_name' in session && 'time_of_day' in session && !('day_of_week' in session)) {
      const workoutSession = session as WorkoutSession;
      normalizedSession = {
        day_of_week: dow,
        focus: workoutSession.session_name || (workoutSession.time_of_day === 'morning' ? 'AM Session' : 'PM Session'),
        notes: `${workoutSession.time_of_day === 'morning' ? '☀️ Morning' : '🌙 Evening'} session`,
        blocks: workoutSession.blocks || [],
      };
    }
    // Case 4: Already a valid PlanDay
    else {
      normalizedSession = session as PlanDay;
    }

    // Skip PreWorkoutScreen, go directly to active session
    setActiveSession(normalizedSession);

    // Track workout started
    if (user?.id) {
      analytics.track(EventTypes.WORKOUT_STARTED, {
        planId: activePlan?.id,
        dayOfWeek: normalizedSession.day_of_week,
        focus: normalizedSession.focus,
        blockCount: normalizedSession.blocks?.length || 0,
        quickStart: true, // Flag to indicate this was a quick start
      });
    }
  }, [user?.id, activePlan?.id]);

  const updateStreakMutation = useMutation(api.achievementMutations.updateStreak);

  const handleFinishSession = useCallback((sessionLog: { focus: string, exercises: LoggedExercise[], durationMinutes: number }) => {
    addLog({
      focus: sessionLog.focus,
      exercises: sessionLog.exercises,
      durationMinutes: sessionLog.durationMinutes,
    });

    // Track workout completed
    if (user?.id) {
      const totalSets = sessionLog.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
      analytics.track(EventTypes.WORKOUT_COMPLETED, {
        focus: sessionLog.focus,
        exerciseCount: sessionLog.exercises.length,
        totalSets,
        durationMinutes: sessionLog.durationMinutes,
        completionRate: 100, // Completed since they finished
      });
    }

    // Update streak and check achievements
    if (user?.id) {
      updateStreakMutation({
        userId: user.id,
        workoutDate: new Date().toISOString()
      }).then((result) => {
        if (result.achievementsUnlocked.length > 0) {
          // Track achievement unlocked
          result.achievementsUnlocked.forEach((achievement: any) => {
            analytics.track(EventTypes.ACHIEVEMENT_UNLOCKED, {
              achievementType: achievement.type,
              achievementTier: achievement.tier,
              achievementName: achievement.displayName,
            });
          });

          // Show achievement unlock notification
          notify({
            type: 'success',
            message: 'Achievement unlocked!'
          });
        }
      }).catch(() => {
        // Silent fail - streak tracking is not critical
      });
    }

    setSessionToSummarize({
        ...sessionLog,
        date: new Date().toISOString()
    });
    setActiveSession(null);
  }, [addLog, user, updateStreakMutation]);

  const handleCancelSession = useCallback(() => {
    // Track workout abandoned
    if (user?.id && activeSession) {
      analytics.track(EventTypes.WORKOUT_ABANDONED, {
        focus: activeSession.focus,
        dayOfWeek: activeSession.day_of_week,
      });
    }
    setActiveSession(null);
  }, [user?.id, activeSession]);

  const handleDeleteActivePlan = useCallback(async () => {
    if (activePlan?.id) {
      try {
        await deletePlan(activePlan.id as any);
        notify({ type: 'success', message: 'Plan deleted successfully' });
        setCurrentPage('home');
      } catch (error) {
        console.error('Error deleting plan:', error);
        notify({ type: 'error', message: 'Failed to delete plan. Please try again.' });
      }
    }
  }, [deletePlan, activePlan]);
  
  const handlePlanUpdate = (updatedPlan: WorkoutPlan) => {
    updatePlan(updatedPlan);
  };
  
  const handlePlanGenerated = useCallback(async (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => {
      // Navigate to home immediately - don't wait for save to complete
      setCurrentPage('home');

      // If plan is empty (error case), we're already navigating home
      if (!plan || !plan.name || !plan.weeklyPlan) {
        // Track plan generation failure
        if (user?.id) {
          analytics.track(EventTypes.PLAN_GENERATION_FAILED, {
            reason: 'Empty plan returned',
          });
        }
        return;
      }

      try {
        // Save plan in background - Convex will update activePlan query automatically
        await addPlan(plan);

        // Track successful plan generation
        if (user?.id) {
          analytics.track(EventTypes.PLAN_ACCEPTED, {
            planName: plan.name,
            daysInWeek: plan.weeklyPlan.length,
            hasDailyRoutine: !!plan.dailyRoutine,
          });
        }
      } catch (error) {
        console.error("Failed to save plan:", error);
        notify({ type: 'error', message: 'Failed to save your plan. Please try generating again.' });

        // Track save failure
        if (user?.id) {
          analytics.trackError(EventTypes.PLAN_GENERATION_FAILED, error as Error, {
            reason: 'Save failed',
          });
        }
      }
  }, [addPlan, user?.id]);

  const handleCreateNewPlan = useCallback(async () => {
    // Delete active plan to trigger onboarding flow
    if (activePlan?.id) {
      if (confirm('Create a new plan? This will replace your current workout plan.')) {
        try {
          await deletePlan(activePlan.id as Id<"workoutPlans">);
          setCurrentPage('home'); // Navigate to home where onboarding will show
        } catch (error) {
          console.error('Error deleting plan:', error);
          notify({ type: 'error', message: 'Failed to delete plan. Please try again.' });
        }
      }
    }
  }, [activePlan, deletePlan]);

  const handleOpenChatWithMessage = useCallback((message: string) => {
    setInitialChatMessage(message);
    setIsChatOpen(true);
  }, []);
  
  const handleChatClose = useCallback(() => {
      setIsChatOpen(false);
      setInitialChatMessage('');
  }, []);

  const todayDayOfWeek = new Date().getDay();
  const dayIndexForGemini = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;

  const renderPage = () => {
    if (sessionToSummarize) {
      return <SessionSummaryPage
                sessionLog={sessionToSummarize}
                onDone={() => setSessionToSummarize(null)}
             />;
    }

    if (activeSession) {
      return (
        <ErrorBoundary componentName="SessionTracker">
          <SessionTracker
            session={activeSession}
            onFinish={handleFinishSession}
            onCancel={handleCancelSession}
            allLogs={logs || []}
            onOpenChatWithMessage={handleOpenChatWithMessage}
          />
        </ErrorBoundary>
      );
    }

    // Show PreWorkoutScreen before starting workout
    if (pendingSession) {
      return <PreWorkoutScreen
        session={pendingSession}
        recentLogs={logs || []}
        onStart={handleConfirmStart}
        onCancel={handleCancelPreWorkout}
      />;
    }

    // Show onboarding only if no active plan exists
    // After plan creation, we navigate immediately, and Convex will update activePlan automatically
    if (!activePlan) {
        return <Onboarding onPlanGenerated={handlePlanGenerated} />
    }

    switch (currentPage) {
      case 'home':
        return (
          <ErrorBoundary componentName="HomePage">
            <HomePage
              plan={activePlan}
              onStartSession={handleStartSession}
              onQuickStartSession={handleQuickStartSession}
              onOpenChat={() => setIsChatOpen(true)}
              userProfile={userProfile}
              onRefreshPlan={handleRefreshPlan}
            />
          </ErrorBoundary>
        );
      case 'goals':
        return (
          <ErrorBoundary componentName="GoalTrackingPage">
            <GoalTrackingPage logs={logs || []} plan={activePlan} userGoals={userProfile?.goals} onDeleteLog={handleDeleteLog} />
          </ErrorBoundary>
        );
      case 'buddies':
        return (
          <ErrorBoundary componentName="BuddiesPage">
            <BuddiesPage />
          </ErrorBoundary>
        );
      case 'admin':
        return (
          <ErrorBoundary componentName="AdminDashboardPage">
            <AdminDashboardPage />
          </ErrorBoundary>
        );
      case 'plan':
        return (
          <ErrorBoundary componentName="PlanPage">
            <PlanPage activePlan={activePlan} onStartSession={handleStartSession} />
          </ErrorBoundary>
        );
      case 'profile':
        return (
          <ErrorBoundary componentName="ProfilePage">
            <ProfilePage logs={logs || []} userProfile={userProfile} onUpdateProfile={updateUserProfile} onCreateNewPlan={handleCreateNewPlan} theme={theme} onToggleTheme={toggleTheme} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary componentName="HomePage">
            <HomePage
              plan={activePlan}
              onStartSession={handleStartSession}
              onQuickStartSession={handleQuickStartSession}
              onOpenChat={() => setIsChatOpen(true)}
            />
          </ErrorBoundary>
        );
    }
  };

  // Pull-to-refresh handler (Convex queries auto-refresh, just provide feedback)
  const handleRefreshPlan = useCallback(async () => {
    // Convex will automatically re-fetch, just add small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  // Delete workout log handler
  const handleDeleteLog = useCallback(async (logId: string) => {
    try {
      await deleteLogMutation({ logId: logId as any });
      notify({ type: 'success', message: 'Workout log deleted' });
    } catch (error) {
      console.error('Failed to delete log:', error);
      notify({ type: 'error', message: 'Failed to delete log' });
      throw error;
    }
  }, [deleteLogMutation]);

  const handleGetStarted = useCallback(() => {
    localStorage.setItem(LANDING_SEEN_KEY, 'true');
    setShowAuth(true);
  }, []);

  const handleSignIn = useCallback(() => {
    localStorage.setItem(LANDING_SEEN_KEY, 'true');
    setShowAuth(true);
  }, []);

  if (!clerkLoaded || (user && (!logsLoaded || !planLoaded || !profileLoaded))) {
      return <FullScreenLoader />;
  }

  // Not logged in flow: Landing → Auth
  if (!user) {
      if (!showAuth) {
        return <LandingPage onGetStarted={handleGetStarted} onSignIn={handleSignIn} />;
      }
      return <AuthPage />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Offline Indicator */}
      <OfflineIndicator />

      <div className="min-h-screen w-full flex flex-col items-center selection:bg-[var(--accent-light)] selection:text-[var(--accent)] overflow-y-auto">
        {renderPage()}
      </div>

      {!activeSession && !pendingSession && !sessionToSummarize && (
        <>
            {activePlan && (
                <>
                    <Navbar 
                        currentPage={currentPage} 
                        onNavigate={setCurrentPage}
                        onToggleTheme={toggleTheme}
                        theme={theme}
                    />
                    {/* Floating Chat Button - positioned above floating navbar */}
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 w-11 h-11 bg-[var(--accent)] text-white rounded-[14px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] focus:ring-[var(--accent)] transition-all hover:opacity-90 active:scale-95 z-30"
                        style={{ boxShadow: '0 3px 16px rgba(0,0,0,0.12)' }}
                        aria-label="Open AI Assistant"
                    >
                        <ZapIcon className="h-[18px] w-[18px]" />
                    </button>
                </>
            )}
        </>
      )}

      <Chatbot
        isOpen={isChatOpen}
        onClose={handleChatClose}
        plan={activePlan}
        onPlanUpdate={handlePlanUpdate}
        initialMessage={initialChatMessage}
        dayOfWeek={dayIndexForGemini}
      />
      <ToastContainer />
    </div>
  );
}
