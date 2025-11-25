import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatMessage, WorkoutPlan, PlanExercise, PlanDay, WorkoutBlock } from '../types';
import { initializeChatSession, simpleGenerate, isWorkoutRelated } from '../services/geminiService';
import { XMarkIcon, SendIcon, SparklesIcon, LogoIcon, XCircleIcon } from './icons';
import { Chat, Part } from '@google/genai';
import { notify } from './layout/Toast';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { hasExceededLimit, getLimitMessage, getRemainingUsage } from '../lib/rateLimiter';
import useUserProfile from '../hooks/useUserProfile';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkoutPlan | null;
  onPlanUpdate: (updatedPlan: WorkoutPlan) => void;
  initialMessage?: string;
  dayOfWeek: number;
}

export default function Chatbot({ isOpen, onClose, plan, onPlanUpdate, initialMessage, dayOfWeek }: ChatbotProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { userProfile } = useUserProfile();
  const incrementChatUsageMutation = useMutation(api.mutations.incrementChatUsage);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialMessageSet = useRef(false);
  const [sessionReady, setSessionReady] = useState(false);


  useEffect(() => {
    if (isOpen) {
      if (plan && !chatRef.current) {
        try {
          chatRef.current = initializeChatSession(plan, dayOfWeek);
          setSessionReady(true);
          if (messages.length === 0) {
            setMessages([
              { role: 'model', text: t('chat.hello') }
            ]);
          }
        } catch (e: any) {
          console.error('Chat initialization failed:', e);
          setSessionReady(false);
          if (messages.length === 0) {
            setMessages([
              { role: 'model', text: t('chat.hello') }
            ]);
          }
        }
      }
      if (initialMessage && !initialMessageSet.current) {
        setInput(initialMessage);
        initialMessageSet.current = true;
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      chatRef.current = null;
      initialMessageSet.current = false;
      setSessionReady(false);
      setInput('');
    }
  }, [isOpen, plan, initialMessage, messages.length, dayOfWeek]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFunctionCall = (functionCall: any): Part => {
    let updatedPlan = plan ? JSON.parse(JSON.stringify(plan)) : null; // Deep copy
    let functionResponseText = '';

    if (functionCall.name === 'substituteExercise' && updatedPlan) {
        const { day_of_week, original_exercise_name, new_exercise_name, new_exercise_metrics_template, rpe } = functionCall.args;
        
        const dayIndex = (updatedPlan.weeklyPlan || []).findIndex((d: PlanDay) => d.day_of_week === day_of_week);
        
        if (dayIndex !== -1) {
            const dayToUpdate = updatedPlan.weeklyPlan[dayIndex];
            let substituted = false;
            (dayToUpdate.blocks || []).forEach((block: WorkoutBlock) => {
                block.exercises = block.exercises.map((ex: PlanExercise) => {
                    if (ex.exercise_name === original_exercise_name) {
                        substituted = true;
                        return {
                            ...ex,
                            exercise_name: new_exercise_name,
                            metrics_template: new_exercise_metrics_template,
                            original_exercise_name: ex.exercise_name, // Store original name
                            rpe: rpe || ex.rpe,
                        };
                    }
                    return ex;
                });
            });

            if (substituted) {
              onPlanUpdate(updatedPlan);
              notify({ type: 'success', message: t('chat.exerciseReplaced', { original: original_exercise_name, new: new_exercise_name }) });
              functionResponseText = t('chat.exerciseSubstituted', { original: original_exercise_name, new: new_exercise_name });
            } else {
              functionResponseText = t('chat.exerciseNotFound', { exercise: original_exercise_name });
            }
        } else {
            functionResponseText = t('chat.dayNotFound', { day: day_of_week });
        }
    } else if (functionCall.name === 'addExercise' && updatedPlan) {
        const { day_of_week, category, new_exercise_name, new_exercise_metrics_template, rpe } = functionCall.args;
        
        const dayIndex = (updatedPlan.weeklyPlan || []).findIndex((d: PlanDay) => d.day_of_week === day_of_week);
        if (dayIndex !== -1) {
            const dayToUpdate = updatedPlan.weeklyPlan[dayIndex];
            const newExercise: PlanExercise = {
                exercise_name: new_exercise_name,
                metrics_template: new_exercise_metrics_template,
                rpe: rpe || null,
                category: category,
            };

            const newBlock: WorkoutBlock = {
                type: 'single',
                title: new_exercise_name,
                exercises: [newExercise]
            };

            if (!dayToUpdate.blocks) {
              dayToUpdate.blocks = [];
            }
            
            let blocks = [...(dayToUpdate.blocks || [])];

            if (category === 'warmup') {
                blocks.unshift(newBlock);
            } else if (category === 'cooldown') {
                blocks.push(newBlock);
            } else { // 'main'
                let lastWarmupIndex = -1;
                blocks.forEach((b, i) => {
                    if(b.exercises.some(ex => ex.category === 'warmup')) {
                        lastWarmupIndex = i;
                    }
                });
                blocks.splice(lastWarmupIndex + 1, 0, newBlock);
            }
            
            dayToUpdate.blocks = blocks;

            onPlanUpdate(updatedPlan);
            notify({ type: 'success', message: t('chat.exerciseAdded', { exercise: new_exercise_name, day: day_of_week }) });
            functionResponseText = t('chat.exerciseAddedMessage', { exercise: new_exercise_name });
        } else {
            functionResponseText = t('chat.dayNotFound', { day: day_of_week });
        }
    } else {
        functionResponseText = t('chat.planNotAvailable');
    }

    return {
        functionResponse: {
            name: functionCall.name,
            response: { result: functionResponseText },
        },
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check rate limits
    if (user?.id && userProfile) {
      const tier = userProfile.apiUsage?.tier || 'free';
      const usage = userProfile.apiUsage;

      if (usage && hasExceededLimit(usage, tier, 'chat')) {
        const remaining = getRemainingUsage(usage, tier);
        setError(getLimitMessage('chat', tier, remaining));
        return;
      }
    }

    // Removed strict validation - let AI handle topic filtering via system instruction
    // The AI's system prompt already enforces workout-only conversations

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      if (chatRef.current) {
        const result = await chatRef.current.sendMessageStream({ message: currentInput });

        let modelResponseText = '';
        let functionCall: any = null;
        
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        for await (const chunk of result) {
          if (chunk.functionCalls && chunk.functionCalls.length > 0) {
            functionCall = chunk.functionCalls[0];
          }
          if (chunk.text) {
            modelResponseText += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponseText;
                return newMessages;
            });
          }
        }
        
        if(modelResponseText.trim() === '' && functionCall) {
            setMessages(prev => prev.slice(0, -1));
        }

        if (functionCall) {
          const functionResponsePart = handleFunctionCall(functionCall);
          const secondResult = await chatRef.current.sendMessageStream({ message: [functionResponsePart] });

          let finalModelResponse = '';
          setMessages(prev => [...prev, { role: 'model', text: '' }]);

          for await (const chunk of secondResult) {
            if(chunk.text) {
              finalModelResponse += chunk.text;
               setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].text = finalModelResponse;
                  return newMessages;
              });
            }
          }
        }

        // Track chat message for rate limiting
        if (user?.id) {
          await incrementChatUsageMutation({ userId: user.id });
        }
      } else {
        // No session available; use simple generate
        const fallback = await simpleGenerate(currentInput, t('chat.fallbackPrompt'));
        setMessages(prev => [...prev, { role: 'model', text: fallback }]);

        // Track chat message for rate limiting
        if (user?.id) {
          await incrementChatUsageMutation({ userId: user.id });
        }
      }
    } catch (err) {
      const e = err as Error;
      console.error("Chatbot error:", e);
      const errorMessage = e.message || t('errors.unknownError');
      setError(errorMessage);
      setMessages(prev => {
          if(prev.length > 0 && prev[prev.length -1].role === 'model' && prev[prev.length -1].text === '') {
              return prev.slice(0,-1);
          }
          return prev;
      });
      setMessages(prev => [...prev, { role: 'model', text: t('chat.errorMessage', { error: errorMessage }) }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {isOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
        <div className="relative z-40 bg-[var(--surface)]/95 border border-[var(--border-card)] backdrop-blur-xl w-full max-w-lg h-[90vh] sm:h-[70vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col animate-fade-in-up-custom">
            <header className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary-light)] to-[var(--accent-light)] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-md">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('chat.assistantTitle')}</h2>
                        <p className="text-xs text-[var(--text-secondary)]">{t('chat.poweredBy')}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </header>

            {messages.length === 1 && (
              <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-secondary)]/30 shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      svg: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
                      label: 'Swap Exercise',
                      prompt: 'Help me swap an exercise'
                    },
                    {
                      svg: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
                      label: 'Add Exercise',
                      prompt: 'Add an exercise'
                    },
                    {
                      svg: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
                      label: 'Get Tips',
                      prompt: 'Give me tips'
                    },
                    {
                      svg: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
                      label: 'Adjust Plan',
                      prompt: 'Adjust my plan'
                    },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(action.prompt);
                        inputRef.current?.focus();
                      }}
                      className="p-3.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all text-left group active:scale-95"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] flex items-center justify-center mb-2 text-[var(--primary)] group-hover:scale-110 transition-transform">
                        {action.svg}
                      </div>
                      <p className="text-[13px] font-bold text-[var(--text-primary)]">{action.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shrink-0 shadow-sm">
                            <SparklesIcon className="w-5 h-5 text-white"/>
                          </div>
                        )}
                        <div className={`max-w-xs md:max-w-md p-3.5 rounded-2xl shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-br-lg'
                            : 'bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-bl-lg'
                        }`}>
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shrink-0 shadow-sm">
                          <SparklesIcon className="w-5 h-5 text-white"/>
                        </div>
                        <div className="max-w-xs md:max-w-md p-3.5 rounded-2xl bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-bl-lg shadow-sm">
                            <div className="flex items-center space-x-1">
                                <span className="h-2.5 w-2.5 bg-[var(--primary)] rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2.5 w-2.5 bg-[var(--primary)] rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2.5 w-2.5 bg-[var(--primary)] rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies - Show when AI asks a question */}
            {messages.length > 1 &&
             messages[messages.length - 1].role === 'model' &&
             (messages[messages.length - 1].text.includes('?') ||
              messages[messages.length - 1].text.toLowerCase().includes('why')) && (
              <div className="px-4 pb-2 shrink-0">
                <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-2">
                  Quick Replies
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Because of pain",
                    "Preference",
                    "Don't have equipment",
                    "Too difficult",
                    "Too easy",
                    "Want variation"
                  ].map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(reply);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-2 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[12px] font-bold text-[var(--text-primary)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all active:scale-95 shadow-sm"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
                <div className="p-4 pt-0">
                    <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] px-4 py-2 rounded-lg flex items-center text-sm" role="alert">
                        <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0"/>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <footer className="p-4 border-t-2 border-[var(--border)] shrink-0 bg-[var(--surface)]/50">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={plan ? t('chat.askAboutPlan') : t('chat.loading')}
                    disabled={isLoading || !plan}
                    className="w-full px-4 py-3 text-[14px] font-medium text-[var(--text-primary)] bg-[var(--surface)] rounded-full border-2 border-[var(--border)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none transition disabled:opacity-70 shadow-sm"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface)] focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
        </div>
    )}
    </>
  );
}
