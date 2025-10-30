import React, { useState, useCallback, useEffect } from 'react';
import { PlanDay, WorkoutLog, LoggedExercise, WorkoutPlan, DailyRoutine, UserProfile } from './types';
import Onboarding from './components/PlanImporter';
import SessionTracker from './components/SessionTracker';
import Chatbot from './components/Chatbot';
import { SparklesIcon } from './components/icons';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import PlanPage from './pages/PlanPage';
import LogbookPage from './pages/LogbookPage';
import DashboardPage from './pages/DashboardPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import useWorkoutLogs from './hooks/useWorkoutLogs';
import useWorkoutPlan from './hooks/useWorkoutPlan';
import useUserProfile from './hooks/useUserProfile';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import AuthPage from './pages/AuthPage';
import FullScreenLoader from './components/layout/FullScreenLoader';


type Page = 'home' | 'dashboard' | 'plan' | 'logbook';
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

  const [activeSession, setActiveSession] = useState<SessionType | null>(null);
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
    setActiveSession(session);
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
                    logs={logs || []}
                    userProfile={userProfile}
                    onUpdatePlan={handlePlanUpdate}
                    onUpdateUserProfile={updateUserProfile}
                    onStartSession={handleStartSession} 
                    onOpenChat={() => setIsChatOpen(true)} 
                />;
      case 'dashboard':
        return <DashboardPage logs={logs || []} plan={activePlan} />;
      case 'plan':
        return <PlanPage 
                    activePlan={activePlan}
                    allPlans={allPlans || []}
                    onSetActivePlan={setActivePlan}
                    onStartSession={handleStartSession} 
                    onDeletePlan={handleDeleteActivePlan} 
                    onPlanUpdate={handlePlanUpdate} 
                    onOpenChatWithMessage={handleOpenChatWithMessage} 
                />;
      case 'logbook':
        return <LogbookPage logs={logs || []} />;
      default:
        return <HomePage 
                    plan={activePlan} 
                    logs={logs || []}
                    userProfile={userProfile}
                    onUpdatePlan={handlePlanUpdate}
                    onUpdateUserProfile={updateUserProfile}
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
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-transparent -z-10">
        <div className="absolute inset-0 bg-radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(160,140,220,0.2),rgba(255,255,255,0))"></div>
      </div>
      <div className="min-h-screen w-full flex flex-col items-center pb-24 selection:bg-red-500/80 selection:text-white relative z-10">
        {renderPage()}
      </div>
      
      {!activeSession && !sessionToSummarize && (
        <>
            {currentPage !== 'home' && (
                <div className="fixed bottom-20 right-4 z-30 md:bottom-6 md:right-6">
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="relative p-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 transition-transform hover:scale-110 active:scale-100 animate-pulse-fab overflow-hidden"
                        aria-label="Open AI Chat"
                    >
                        <SparklesIcon className="h-7 w-7" />
                        <span className="absolute top-0 left-0 w-full h-full bg-white/20 animate-gleam"></span>
                    </button>
                </div>
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
    </div>
  );
}