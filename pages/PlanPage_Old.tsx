import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { WorkoutPlan, PlanDay, PlanExercise, WorkoutBlock } from '../types';
import { CoffeeIcon, LogoIcon, TimerIcon, ArrowRightLeftIcon, XCircleIcon, CheckCircleIcon, ChevronDownIcon, PencilSquareIcon, TrashIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, PlusCircleIcon, RepeatIcon, ClockIcon, ZapIcon, PercentIcon, TrendingUpIcon, SpeedometerIcon, CogIcon, FlameIcon, CalendarIcon } from '../components/icons';
import { generateIcsContent } from '../services/calendarService';
import { notify } from '../components/layout/Toast';
import ExerciseEditModal from '../components/ExerciseEditModal';

interface PlanPageProps {
    activePlan: WorkoutPlan;
    allPlans: WorkoutPlan[];
    onSetActivePlan: (planId: string) => void;
    onStartSession: (session: PlanDay) => void;
    onDeletePlan: () => void;
    onPlanUpdate: (updatedPlan: WorkoutPlan) => void;
    onOpenChatWithMessage: (message: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ... (PlanSwitcher component remains the same)
const PlanSwitcher: React.FC<{ activePlan: WorkoutPlan, allPlans: WorkoutPlan[], onSetActivePlan: (id: string) => void, isEditing: boolean }> = ({ activePlan, allPlans, onSetActivePlan, isEditing }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} disabled={isEditing} className="flex items-center gap-2 group disabled:cursor-not-allowed">
                 <h1 className="font-syne text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition truncate max-w-[200px] sm:max-w-xs">{activePlan.name}</h1>
                 <ChevronDownIcon className={`w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-lg z-20 animate-fade-in" style={{ boxShadow: 'var(--shadow-lg)' }}>
                    <div className="p-2">
                         {allPlans.map(plan => (
                             <button
                                key={plan.id}
                                onClick={() => { onSetActivePlan(plan.id!); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between ${plan.id === activePlan.id ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'}`}
                             >
                                 <span className="font-semibold truncate">{plan.name}</span>
                                 {plan.id === activePlan.id && <CheckCircleIcon className="w-5 h-5" />}
                             </button>
                         ))}
                    </div>
                </div>
            )}
        </div>
    )
};


const MetricTag: React.FC<{ icon: React.ElementType; value: string | number | null | undefined }> = ({ icon: Icon, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-1.5 bg-[var(--surface-secondary)] px-2.5 py-1.5 rounded-md border border-[var(--border)]">
            <Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">{value}</span>
        </div>
    );
};

export default function PlanPage({ activePlan, allPlans, onSetActivePlan, onStartSession, onDeletePlan, onPlanUpdate, onOpenChatWithMessage }: PlanPageProps) {
  const todayDayOfWeek = new Date().getDay();
  const todayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState<WorkoutPlan>(activePlan);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Modal data needs to know which block it belongs to
  const [modalData, setModalData] = useState<{ exercise?: PlanExercise, blockIndex: number, category: 'warmup' | 'main' | 'cooldown' } | null>(null);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  // ... (Carousel related states and effects remain the same)
  const dayItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!isEditing) setEditedPlan(activePlan);
  }, [isEditing, activePlan]);
  
  const currentPlan = isEditing ? editedPlan : activePlan;
  const activeDayPlan = currentPlan.weeklyPlan?.[selectedDayIndex];
  
  // ... (Carousel useEffects remain the same)
    useEffect(() => {
    dayItemRefs.current = dayItemRefs.current.slice(0, currentPlan.weeklyPlan?.length || 0);
  }, [currentPlan.weeklyPlan]);
  
  const getCarouselCenterOffset = (index: number) => {
      const container = carouselRef.current;
      const selectedItem = dayItemRefs.current[index];

      if (container && selectedItem) {
        const containerWidth = container.offsetWidth;
        const itemLeft = selectedItem.offsetLeft;
        const itemWidth = selectedItem.offsetWidth;
        return (containerWidth / 2) - itemLeft - (itemWidth / 2);
      }
      return 0;
  };
  
  useEffect(() => {
      if (carouselRef.current) {
          const targetOffset = getCarouselCenterOffset(selectedDayIndex);
          carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
          carouselRef.current.style.transform = `translateX(${targetOffset}px)`;
      }
  }, [selectedDayIndex, currentPlan.weeklyPlan]);


  const updateDayInPlan = (dayIndex: number, updatedDay: PlanDay) => {
    const newPlan = { ...editedPlan };
    newPlan.weeklyPlan[dayIndex] = updatedDay;
    setEditedPlan(newPlan);
  };

  const moveBlock = (from: number, to: number) => {
    const day = { ...(editedPlan.weeklyPlan?.[selectedDayIndex] as PlanDay) };
    const blocks = [...(day.blocks || [])];
    if (to < 0 || to >= blocks.length) return;
    const [b] = blocks.splice(from, 1);
    blocks.splice(to, 0, b);
    day.blocks = blocks;
    updateDayInPlan(selectedDayIndex, day);
  };

  // ... (Editing functions need to be updated for the block structure)
  const handleSaveChanges = () => {
    onPlanUpdate(editedPlan);
    setIsEditing(false);
    notify({ type: 'success', message: 'Plan saved' });
  };

  const handleCancelChanges = () => {
    setIsEditing(false);
  };

  // ... (Touch gesture handlers remain the same)
   const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
      isDragging.current = true;
      startX.current = e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0);
      scrollLeft.current = carouselRef.current?.getBoundingClientRect().left || 0;
      if (carouselRef.current) carouselRef.current.style.transition = 'none';
      cancelAnimationFrame(animationFrame.current!);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
      if (!isDragging.current || !carouselRef.current) return;
      e.preventDefault();
      const x = e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0);
      const walk = (x - startX.current);
      const currentOffset = parseFloat(carouselRef.current.style.transform.replace('translateX(', '').replace('px)', '') || '0');
      velocity.current = walk;
      carouselRef.current.style.transform = `translateX(${currentOffset + walk}px)`;
  };

  const handleTouchEnd = () => {
      if (!isDragging.current || !carouselRef.current) return;
      isDragging.current = false;
      
      const currentOffset = parseFloat(carouselRef.current.style.transform.replace('translateX(', '').replace('px)', ''));
      let closestIndex = 0;
      let minDistance = Infinity;

      dayItemRefs.current.forEach((item, index) => {
          if(item) {
              const itemCenter = item.offsetLeft + item.offsetWidth / 2;
              const containerCenter = carouselRef.current!.parentElement!.offsetWidth / 2;
              const itemPosInContainer = itemCenter + currentOffset;
              const distance = Math.abs(containerCenter - itemPosInContainer);

              if (distance < minDistance) {
                  minDistance = distance;
                  closestIndex = index;
              }
          }
      });
      
      if(Math.abs(velocity.current) > 10) {
          if(velocity.current > 0 && selectedDayIndex > 0) {
             closestIndex = selectedDayIndex - 1;
          } else if (velocity.current < 0 && selectedDayIndex < dayItemRefs.current.length - 1) {
             closestIndex = selectedDayIndex + 1;
          }
      }
      
      setSelectedDayIndex(closestIndex);
      velocity.current = 0;
  };


  const renderExercise = (ex: PlanExercise, block: WorkoutBlock) => {
      const { metrics_template: mt, rpe } = ex;
      
      const repsDisplay = mt.reps_per_set ? mt.reps_per_set.join('/') : mt.target_reps;
      const sets = block.type === 'superset' ? block.rounds : mt.target_sets;
      let setsReps = sets && repsDisplay ? `${sets} × ${repsDisplay}` : '';

      const categoryIcon = ex.category === 'warmup' ? <FlameIcon className="w-4 h-4 text-orange-400" />
                          : ex.category === 'cooldown' ? <CoffeeIcon className="w-4 h-4 text-blue-400" />
                          : null;

      const categoryBadge = (
        <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
          ex.category === 'warmup' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
          ex.category === 'cooldown' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
          'bg-stone-700/50 text-stone-300 border border-stone-500/30'
        }`}>{ex.category.toUpperCase()}</span>
      );

      return (
          <div key={ex.exercise_name} className="flex items-start justify-between gap-4 py-3 group">
              <div className="flex-1">
                  <div className="flex items-center gap-2">
                      {categoryIcon}
                      <p className="font-bold text-stone-200">{ex.exercise_name}</p>
                      {categoryBadge}
                      {mt.has_drop_set && <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">DROP SET</span>}
                  </div>
                  <div className="flex items-center flex-wrap gap-2 mt-2 pl-6">
                      {setsReps && <MetricTag icon={RepeatIcon} value={setsReps} />}
                      {mt?.rest_period_s && <MetricTag icon={ClockIcon} value={`${mt.rest_period_s}s`} />}
                      {rpe && <MetricTag icon={ZapIcon} value={`@${rpe}`} />}
                      {/* ... other metric tags ... */}
                  </div>
                   {ex.notes && <p className="text-xs text-stone-400 mt-2 pl-6">{ex.notes}</p>}
              </div>
              {/* Editing controls would need to be updated to work with blocks */}
          </div>
      );
  }
  
  const handleExportCalendar = () => {
    try {
      const ics = generateIcsContent(currentPlan);
      const blob = new Blob([ics], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPlan.name.replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify({ type: 'success', message: 'Calendar file downloaded' });
    } catch (e) {
      console.error('ICS export failed', e);
      notify({ type: 'error', message: 'Failed to export calendar' });
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
      <header className="mb-8">
        <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-2">TRAINING PLAN</p>
            <PlanSwitcher activePlan={activePlan} allPlans={allPlans} onSetActivePlan={onSetActivePlan} isEditing={isEditing} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
            {isEditing ? (
                <>
                    <button onClick={handleCancelChanges} className="px-4 py-2.5 border border-[var(--border-strong)] text-[14px] font-semibold rounded-lg text-[var(--text-secondary)] bg-transparent hover:bg-[var(--surface-secondary)] transition">Cancel</button>
                    <button onClick={handleSaveChanges} className="px-4 py-2.5 border-none text-[14px] font-semibold rounded-lg text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition" style={{ boxShadow: 'var(--glow-red)' }}>Save Changes</button>
                </>
            ) : (
                <>
                    <button onClick={handleExportCalendar} title="Add to Calendar" className="px-4 py-2.5 border border-[var(--border-strong)] text-[13px] font-semibold rounded-lg text-[var(--text-secondary)] bg-transparent hover:bg-[var(--surface-secondary)] transition flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4"/> Calendar
                    </button>
                    <button onClick={() => setIsEditing(true)} title="Edit plan" className="px-4 py-2.5 border border-[var(--border-strong)] text-[13px] font-semibold rounded-lg text-[var(--text-secondary)] bg-transparent hover:bg-[var(--surface-secondary)] transition flex items-center gap-1.5">
                        <PencilSquareIcon className="w-4 h-4"/> Edit
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this plan? This cannot be undone.')) onDeletePlan() }} title="Delete plan" className="px-4 py-2.5 border border-[var(--error)] text-[13px] font-semibold rounded-lg text-[var(--error)] bg-transparent hover:bg-[var(--error)] hover:text-white transition flex items-center gap-1.5">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </>
            )}
        </div>
      </header>
      
      {/* Day Carousel remains the same */}
       <div 
         className="relative w-full overflow-hidden mb-6 h-24 flex items-center cursor-grab active:cursor-grabbing"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
       >
          <div ref={carouselRef} className="absolute top-0 left-0 flex items-center h-full gap-3 px-4">
            {(currentPlan.weeklyPlan || []).map((day, index) => (
              <button
                key={`${day.focus}-${index}-${day.day_of_week}`}
                ref={el => dayItemRefs.current[index] = el}
                onClick={() => !isDragging.current && setSelectedDayIndex(index)}
                title={`View ${FULL_WEEKDAYS[index]}`}
                className={`group shrink-0 transition-all duration-300 ease-in-out rounded-xl px-4 py-3 text-center shadow-lg w-28 h-[72px] flex flex-col justify-center ${
                  selectedDayIndex === index 
                  ? 'scale-105 opacity-100 bg-red-500 text-white' 
                  : 'scale-90 opacity-70 bg-stone-800/80 text-stone-200 border border-stone-700 hover:opacity-100 hover:border-stone-600'
                }`}
              >
                <span className="text-sm font-bold">{WEEKDAYS[index]}</span>
                <span className="text-xs mt-0.5 truncate">{day.focus}</span>
              </button>
            ))}
          </div>
        </div>

      <main className="min-h-[400px] relative pb-24">
          {activeDayPlan ? (
            <>
                <div className="mb-6">
                    <h2 className="font-syne text-3xl font-bold text-white tracking-tight">{activeDayPlan.focus}</h2>
                    <p className="text-stone-400">{FULL_WEEKDAYS[selectedDayIndex]}'s Workout</p>
                </div>
                
                { (activeDayPlan.blocks || []).length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center bg-stone-900/50 border border-stone-800 rounded-2xl shadow-lg">
                        <CoffeeIcon className="h-10 w-10 text-stone-500"/>
                        <h3 className="font-syne mt-6 text-2xl font-bold text-white">Rest Day</h3>
                        <p className="mt-2 text-stone-400">Enjoy your recovery.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                       {activeDayPlan.blocks.map((block, blockIndex) => (
                           <div key={blockIndex} className="bg-stone-900/50 p-4 rounded-2xl border border-stone-800 shadow-lg">
                               <h3 className="font-syne text-lg font-bold text-white border-b border-stone-800 pb-2 mb-2 flex items-center justify-between">
                                   {block.title || `Block ${blockIndex + 1}`}
                                   {block.type === 'superset' && <span className="text-sm text-stone-400 font-normal ml-2">({block.rounds} Rounds)</span>}
                                   {block.type === 'amrap' && <span className="text-sm text-stone-400 font-normal ml-2">({block.duration_minutes} min AMRAP)</span>}
                                   {isEditing && (
                                     <span className="ml-auto inline-flex items-center gap-2">
                                       <button onClick={() => moveBlock(blockIndex, blockIndex - 1)} className="p-1.5 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800/60" title="Move up">
                                         <ArrowUpCircleIcon className="w-5 h-5" />
                                       </button>
                                       <button onClick={() => moveBlock(blockIndex, blockIndex + 1)} className="p-1.5 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800/60" title="Move down">
                                         <ArrowDownCircleIcon className="w-5 h-5" />
                                       </button>
                                     </span>
                                   )}
                               </h3>
                               <div className="divide-y divide-stone-800">
                                   {block.exercises.map(ex => renderExercise(ex, block))}
                               </div>
                           </div>
                       ))}
                    </div>
                )}

                {!isEditing && (activeDayPlan.blocks || []).length > 0 && selectedDayIndex === todayIndex && (
                     <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] sm:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-10">
                        <button 
                            onClick={() => onStartSession(activeDayPlan)}
                            className="w-full inline-flex items-center justify-center pl-5 pr-6 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 transition-transform hover:scale-105"
                        >
                            <TimerIcon className="w-6 h-6 mr-2" />
                            Start Today's Session
                        </button>
                    </div>
                )}
            </>
          ) : (
             <div className="text-center py-20">...</div>
          )}
      </main>
      
      {/* The modal would need to be updated to handle blocks */}
    </div>
  );
}
