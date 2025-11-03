import React, { useState, useCallback, useEffect } from 'react';
import { PlanDay, WorkoutLog, LoggedExercise, WorkoutPlan, DailyRoutine, UserProfile } from './types';
import Onboarding from './components/PlanImporter';
import SessionTracker from './components/SessionTracker';
import Chatbot from './components/Chatbot';
import { SparklesIcon } from './components/icons';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import GoalTrackingPage from './pages/GoalTrackingPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import useWorkoutLogs from './hooks/useWorkoutLogs';
import useWorkoutPlan from './hooks/useWorkoutPlan';
import useUserProfile from './hooks/useUserProfile';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import AuthPage from './pages/AuthPage';
import FullScreenLoader from './components/layout/FullScreenLoader';
import ToastContainer from './components/layout/Toast';


type Page = 'home' | 'goals' | 'plan' | 'profile';
type SessionType = PlanDay | DailyRoutine;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { 
    activePlan, 
    allPlans, 
    addPlan, 
    deletePlan, 
    updatePlan,
    setActivePlan,
    planLoaded 
  } = useWorkoutPlan(user?.uid);
  const { logs, addLog, logsLoaded } = useWorkoutLogs(user?.uid);
  const { userProfile, updateUserProfile, profileLoaded } = useUserProfile(user?.uid);

  const [activeSession, setActiveSession] = useState<PlanDay | null>(null);
  const [sessionToSummarize, setSessionToSummarize] = useState<WorkoutLog | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);


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

  const handleFinishSession = useCallback((sessionLog: { focus: string, exercises: LoggedExercise[], durationMinutes: number }) => {
    addLog({
      focus: sessionLog.focus,
      exercises: sessionLog.exercises,
      durationMinutes: sessionLog.durationMinutes,
    });
    setSessionToSummarize({
        ...sessionLog,
        date: new Date().toISOString()
    });
    setActiveSession(null);
  }, [addLog]);

  const handleCancelSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  const handleDeleteActivePlan = useCallback(async () => {
    if (activePlan?.id) {
      await deletePlan(activePlan.id);
      setCurrentPage('home');
    }
  }, [deletePlan, activePlan]);
  
  const handlePlanUpdate = (updatedPlan: WorkoutPlan) => {
    updatePlan(updatedPlan);
  };
  
  const handlePlanGenerated = useCallback(async (plan: WorkoutPlan) => {
      await addPlan(plan);
      setCurrentPage('home');
  }, [addPlan]);

  const handleCreateNewPlan = useCallback(() => {
    // Temporarily clear active plan to trigger onboarding
    setActivePlan('');
  }, [setActivePlan]);

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
      />;
    }
    
    if (!activePlan) {
        return <Onboarding onPlanGenerated={handlePlanGenerated} />
    }

    switch (currentPage) {
      case 'home':
        return <HomePage
                    plan={activePlan}
                    onStartSession={handleStartSession}
                    onOpenChat={() => setIsChatOpen(true)}
                />;
      case 'goals':
        return <GoalTrackingPage logs={logs || []} plan={activePlan} userGoals={userProfile?.goals} />;
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
  
  if (authLoading || (user && (!logsLoaded || !planLoaded || !profileLoaded))) {
      return <FullScreenLoader />;
  }
  
  if (!user) {
      return <AuthPage />;
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="min-h-screen w-full flex flex-col items-center selection:bg-[var(--accent-light)] selection:text-[var(--accent)]">
        {renderPage()}
      </div>

      {!activeSession && !sessionToSummarize && (
        <>
            {currentPage !== 'home' && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 p-3.5 bg-[var(--accent)] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:ring-[var(--accent)] transition-all hover:opacity-90 active:scale-95 z-30 w-14 h-14"
                    aria-label="Open AI Chat"
                    style={{ boxShadow: 'var(--glow-red)' }}
                >
                    <SparklesIcon className="h-7 w-7" />
                </button>
            )}
            {activePlan && <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />}
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
