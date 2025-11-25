import React, { useState, useCallback, useEffect } from 'react';
import { PlanDay, WorkoutLog, LoggedExercise, WorkoutPlan, DailyRoutine, UserProfile } from './types';
import { useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from './convex/_generated/api';
import Onboarding from './components/PlanImporter';
import SessionTracker from './components/SessionTracker';
import Chatbot from './components/Chatbot';
import Navbar from './components/layout/Navbar';
import { ZapIcon } from './components/icons';
import HomePage from './pages/HomePage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import GoalTrackingPage from './pages/GoalTrackingPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import BuddiesPage from './pages/BuddiesPage';
import useWorkoutLogs from './hooks/useWorkoutLogs';
import useWorkoutPlan from './hooks/useWorkoutPlan';
import useUserProfile from './hooks/useUserProfile';
import AuthPage from './pages/AuthPage';
import FullScreenLoader from './components/layout/FullScreenLoader';
import ToastContainer from './components/layout/Toast';
import { useTheme } from './hooks/useTheme';


type Page = 'home' | 'goals' | 'buddies' | 'plan' | 'profile';
type SessionType = PlanDay | DailyRoutine;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { user, isLoaded: clerkLoaded } = useUser();
  const { theme, toggleTheme } = useTheme();

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

  useEffect(() => {
    if (user?.id) {
      ensureUserCodeMutation({ userId: user.id }).catch(() => {
        // Silent fail, will try again next time
      });
    }
  }, [user?.id, ensureUserCodeMutation]);

  const [activeSession, setActiveSession] = useState<PlanDay | null>(null);
  const [sessionToSummarize, setSessionToSummarize] = useState<WorkoutLog | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');

  const handleStartSession = useCallback((session: SessionType) => {
    // Normalize DailyRoutine into a PlanDay with a single block so SessionTracker can handle it
    if ('exercises' in session && !('blocks' in session)) {
      const today = new Date();
      const dow = today.getDay() === 0 ? 7 : today.getDay();
      const normalized: PlanDay = {
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
      setActiveSession(normalized);
    } else {
      setActiveSession(session as PlanDay);
    }
  }, []);

  const updateStreakMutation = useMutation(api.achievementMutations.updateStreak);

  const handleFinishSession = useCallback((sessionLog: { focus: string, exercises: LoggedExercise[], durationMinutes: number }) => {
    addLog({
      focus: sessionLog.focus,
      exercises: sessionLog.exercises,
      durationMinutes: sessionLog.durationMinutes,
    });

    // Update streak and check achievements
    if (user?.id) {
      updateStreakMutation({
        userId: user.id,
        workoutDate: new Date().toISOString()
      }).then((result) => {
        if (result.achievementsUnlocked.length > 0) {
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
    setActiveSession(null);
  }, []);

  const handleDeleteActivePlan = useCallback(async () => {
    if (activePlan?.id) {
      await deletePlan(activePlan.id as any);
      setCurrentPage('home');
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
        return;
      }
      
      try {
        // Save plan in background - Convex will update activePlan query automatically
        await addPlan(plan);
      } catch (error) {
        console.error("Failed to save plan:", error);
        // User is already on home page, they can try again if needed
      }
  }, [addPlan]);

  const handleCreateNewPlan = useCallback(async () => {
    // Delete active plan to trigger onboarding flow
    if (activePlan?.id) {
      if (confirm('Create a new plan? This will replace your current workout plan.')) {
        try {
          await deletePlan(activePlan.id);
          setCurrentPage('home'); // Navigate to home where onboarding will show
        } catch (error) {
          console.error('Error deleting plan:', error);
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
      return <SessionTracker
        session={activeSession}
        onFinish={handleFinishSession}
        onCancel={handleCancelSession}
        allLogs={logs || []}
        onOpenChatWithMessage={handleOpenChatWithMessage}
      />;
    }
    
    // Show onboarding only if no active plan exists
    // After plan creation, we navigate immediately, and Convex will update activePlan automatically
    if (!activePlan) {
        return <Onboarding onPlanGenerated={handlePlanGenerated} />
    }

    switch (currentPage) {
      case 'home':
        return <HomePage
                    plan={activePlan}
                    onStartSession={handleStartSession}
                    onOpenChat={() => setIsChatOpen(true)}
                    userProfile={userProfile}
                />;
      case 'goals':
        return <GoalTrackingPage logs={logs || []} plan={activePlan} userGoals={userProfile?.goals} />;
      case 'buddies':
        return <BuddiesPage />;
      case 'plan':
        return <PlanPage activePlan={activePlan} onStartSession={handleStartSession} />;
      case 'profile':
        return <ProfilePage logs={logs || []} userProfile={userProfile} onUpdateProfile={updateUserProfile} onCreateNewPlan={handleCreateNewPlan} />;
      default:
        return <HomePage
                    plan={activePlan}
                    onStartSession={handleStartSession}
                    onOpenChat={() => setIsChatOpen(true)}
                />;
    }
  };
  
  if (!clerkLoaded || (user && (!logsLoaded || !planLoaded || !profileLoaded))) {
      return <FullScreenLoader />;
  }
  
  if (!user) {
      return <AuthPage />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="min-h-screen w-full flex flex-col items-center selection:bg-[var(--accent-light)] selection:text-[var(--accent)] overflow-y-auto">
        {renderPage()}
      </div>

      {!activeSession && !sessionToSummarize && (
        <>
            {activePlan && (
                <>
                    <Navbar 
                        currentPage={currentPage} 
                        onNavigate={setCurrentPage}
                        onToggleTheme={toggleTheme}
                        theme={theme}
                    />
                    {/* Floating Chat Button */}
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 w-14 h-14 bg-[var(--accent)] text-white rounded-2xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] focus:ring-[var(--accent)] transition-all hover:opacity-90 active:scale-95 z-30 shadow-card"
                        aria-label="Open AI Chat"
                    >
                        <ZapIcon className="h-6 w-6" />
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
