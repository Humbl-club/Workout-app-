import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { ChatMessage, WorkoutPlan, PlanExercise, PlanDay, WorkoutBlock } from '../types';
import { initializeChatSession } from '../services/geminiService';
import { XMarkIcon, SendIcon, SparklesIcon, LogoIcon, XCircleIcon } from './icons';
import { Chat, Part } from '@google/genai';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkoutPlan | null;
  onPlanUpdate: (updatedPlan: WorkoutPlan) => void;
  initialMessage?: string;
  dayOfWeek: number;
}

export default function Chatbot({ isOpen, onClose, plan, onPlanUpdate, initialMessage, dayOfWeek }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialMessageSet = useRef(false);


  useEffect(() => {
    if (isOpen) {
      if (plan && !chatRef.current) {
          chatRef.current = initializeChatSession(plan, dayOfWeek);
           if (messages.length === 0) {
            setMessages([
              { role: 'model', text: 'Hello! I am your REBLD fitness assistant. How can I help you adapt your plan today?' }
            ]);
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
              functionResponseText = `OK. I've substituted ${original_exercise_name} with ${new_exercise_name}.`;
            } else {
              functionResponseText = `Error: I couldn't find the exercise ${original_exercise_name} to substitute.`;
            }
        } else {
            functionResponseText = `Error: I couldn't find day ${day_of_week} in the plan.`;
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
            functionResponseText = `OK. I've added ${new_exercise_name} to your plan.`;
        } else {
            functionResponseText = `Error: I couldn't find day ${day_of_week} in the plan.`;
        }
    } else {
        functionResponseText = "Function call could not be processed as the plan is not available.";
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
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
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

    } catch (err) {
      const e = err as Error;
      console.error("Chatbot error:", e);
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      setMessages(prev => {
          if(prev.length > 0 && prev[prev.length -1].role === 'model' && prev[prev.length -1].text === '') {
              return prev.slice(0,-1);
          }
          return prev;
      });
      setMessages(prev => [...prev, { role: 'model', text: `Sorry, something went wrong: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {isOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
        <div className="relative z-40 bg-stone-900/70 border border-stone-700 backdrop-blur-xl w-full max-w-lg h-[90vh] sm:h-[70vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col animate-fade-in-up-custom">
            <header className="flex items-center justify-between p-4 border-b border-stone-800 shrink-0">
                <div className="flex items-center gap-3">
                    <LogoIcon className="text-3xl" />
                    <div>
                        <h2 className="font-syne text-lg font-bold text-white">REBLD Assistant</h2>
                        <p className="text-xs text-stone-400">Powered by Gemini Pro</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:bg-stone-800 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0 border border-stone-700"><SparklesIcon className="w-5 h-5 text-stone-400"/></div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-red-500/80 text-white rounded-br-lg' : 'bg-stone-800 text-stone-200 rounded-bl-lg'}`}>
                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0 border border-stone-700"><SparklesIcon className="w-5 h-5 text-stone-400"/></div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-stone-800 text-stone-200 rounded-bl-lg">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-stone-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-stone-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-stone-500 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            
            {error && (
                <div className="p-4 pt-0">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg flex items-center text-sm" role="alert">
                        <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0"/>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <footer className="p-4 border-t border-stone-800 shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={plan ? "Ask me about your plan..." : "Loading..."}
                    disabled={isLoading || !plan}
                    className="w-full px-4 py-2 text-stone-100 bg-stone-800/50 rounded-full border border-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:opacity-70"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-red-500 disabled:bg-stone-600 disabled:cursor-not-allowed transition">
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