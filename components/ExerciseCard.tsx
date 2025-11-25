import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlanExercise, LoggedSetSRW, LoggedSetDuration } from '../types';
import { CheckCircleIcon, ClockIcon, RepeatIcon, ZapIcon, PercentIcon, TrendingUpIcon, SpeedometerIcon, CogIcon } from './icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

interface ExerciseCardProps {
  exercise: PlanExercise;
  mode: 'single' | 'superset-member';
  tracker?: React.ReactNode;
  completedSets?: (LoggedSetSRW | LoggedSetDuration)[];
  isInputsComplete?: boolean;
}

const InfoChip: React.FC<{ icon: React.ElementType; label: string; value: string | number | null | undefined }> = ({ icon: Icon, label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-center gap-2 bg-stone-900/50 p-2 rounded-lg border border-stone-700 shrink-0">
            <Icon className="w-5 h-5 text-red-400 shrink-0" />
            <div>
                <p className="text-xs font-semibold text-stone-400">{label}</p>
                <p className="text-sm font-bold text-white">{value}</p>
            </div>
        </div>
    );
};


const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
    exercise,
    mode,
    tracker,
    completedSets = [],
    isInputsComplete = false
}) => {
  const { t } = useTranslation();
  const { metrics_template: mt, rpe } = exercise;
  const totalSets = mt?.target_sets || 1;
  const isCompleteForSession = completedSets.length >= totalSets;
  
  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
      <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-stone-700"></div>
          <h4 className="text-xs font-bold text-stone-400 tracking-widest uppercase">{title}</h4>
          <div className="h-px flex-1 bg-stone-700"></div>
      </div>
  );
  
  const renderContent = () => {
      if (isCompleteForSession && mode === 'single') {
          return (
            <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto"/>
                <p className="mt-2 font-semibold text-stone-300">{t('exercise.complete')}</p>
            </div>
          )
      }
      return tracker;
  }

  const getSetsRepsValue = () => {
      if (!mt) return null;
      if (mt.target_sets && mt.target_reps) {
          return `${mt.target_sets} × ${mt.target_reps}`;
      }
      if (mt.type === 'sets_duration' && mt.target_sets && 'target_duration_s' in mt) {
          return `${mt.target_sets} × ${mt.target_duration_s}s`;
      }
      return null;
  }

  return (
    <Card className={cn("bg-stone-800/50 border-stone-700 rounded-3xl backdrop-blur-lg shadow-2xl p-6 flex-1 flex flex-col justify-between")}>
        <div className="space-y-4">
            <CardHeader className="p-0">
                <div className="flex items-center gap-2">
                    {mode === 'superset-member' && isInputsComplete && <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0"/>}
                    <CardTitle className="text-2xl font-bold text-white tracking-tight">{exercise.exercise_name}</CardTitle>
                </div>
            </CardHeader>
            
            <div>
                <SectionHeader title={t('exercise.targets')} />
                <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2 -mb-2 hide-scrollbar">
                    <InfoChip icon={RepeatIcon} label={t('exercise.setsAndReps')} value={getSetsRepsValue()} />
                    <InfoChip icon={ClockIcon} label={t('exercise.rest')} value={mt?.rest_period_s ? `${mt.rest_period_s}s` : null} />
                    <InfoChip icon={PercentIcon} label={t('exercise.oneRepMax')} value={mt?.one_rep_max_percentage} />
                    <InfoChip icon={ZapIcon} label={t('exercise.rpe')} value={rpe} />
                    <InfoChip icon={TrendingUpIcon} label={t('exercise.incline')} value={mt?.incline} />
                    <InfoChip icon={SpeedometerIcon} label={t('exercise.speed')} value={mt?.speed} />
                    <InfoChip icon={CogIcon} label={t('exercise.resistance')} value={mt?.resistance} />
                </div>
            </div>

            <div>
                 <SectionHeader title={t('exercise.logSet')} />
                 {renderContent()}
            </div>

            {completedSets.length > 0 && (
                 <div>
                    <SectionHeader title={t('exercise.completedSets')} />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {completedSets.map((set, index) => (
                             <div key={index} className="flex items-center gap-2 bg-stone-900/50 px-3 py-1.5 rounded-full border border-stone-700">
                                <CheckCircleIcon className="w-4 h-4 text-green-500"/>
                                <span className="text-sm font-semibold text-stone-300">{t('exercise.setNumber', { number: set.set })}</span>
                                <span className="text-sm text-stone-200 font-mono font-semibold">
                                     {'weight' in set ? t('exercise.weightReps', { weight: set.weight, reps: set.reps }) + (set.rpe ? ` @${set.rpe}` : '') : `${set.duration_s}s`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
        
        {exercise.notes && (
            <CardContent className="text-center text-xs text-stone-500 mt-4 pt-4 border-t border-stone-800 p-0">
                {exercise.notes}
            </CardContent>
        )}
    </Card>
  );
};

export default ExerciseCard;