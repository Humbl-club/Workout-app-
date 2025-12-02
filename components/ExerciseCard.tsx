import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlanExercise, LoggedSetSRW, LoggedSetDuration } from '../types';
import { CheckCircleIcon, RepeatIcon } from './icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

interface ExerciseCardProps {
  exercise: PlanExercise;
  mode: 'single' | 'superset-member';
  tracker?: React.ReactNode;
  completedSets?: (LoggedSetSRW | LoggedSetDuration)[];
  isInputsComplete?: boolean;
}

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
          <div className="h-px flex-1 bg-[var(--border-default)]"></div>
          <h4 className="text-xs font-bold text-[var(--text-tertiary)] tracking-widest uppercase">{title}</h4>
          <div className="h-px flex-1 bg-[var(--border-default)]"></div>
      </div>
  );
  
  const renderContent = () => {
      if (isCompleteForSession && mode === 'single') {
          return (
            <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-[var(--status-success-bg)] mx-auto"/>
                <p className="mt-2 font-semibold text-[var(--text-secondary)]">{t('exercise.complete')}</p>
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
    <Card className={cn("bg-[var(--surface-primary)] border-[var(--border-default)] rounded-3xl backdrop-blur-lg shadow-[var(--shadow-2xl)] p-6 flex-1 flex flex-col justify-between")}>
        <div className="space-y-4">
            <CardHeader className="p-0">
                <div className="flex items-center gap-2">
                    {mode === 'superset-member' && isInputsComplete && <CheckCircleIcon className="w-5 h-5 text-[var(--status-success-bg)] shrink-0"/>}
                    <CardTitle className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{exercise.exercise_name}</CardTitle>
                </div>
            </CardHeader>
            
            {/* Targets - Compact Inline Display */}
            <div className="bg-[var(--surface-secondary)] rounded-xl p-3 space-y-1.5">
                {getSetsRepsValue() && (
                    <div className="flex items-center gap-2 text-sm">
                        <RepeatIcon className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                        <span className="font-semibold text-[var(--text-primary)]">{getSetsRepsValue()}</span>
                    </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                    {mt?.rest_period_s && <span>Rest: {mt.rest_period_s}s</span>}
                    {mt?.one_rep_max_percentage && <span>{mt.one_rep_max_percentage}% 1RM</span>}
                    {rpe && <span>RPE {rpe}</span>}
                    {mt?.incline && <span>Incline: {mt.incline}</span>}
                    {mt?.speed && <span>Speed: {mt.speed}</span>}
                    {mt?.resistance && <span>Resistance: {mt.resistance}</span>}
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
                             <div key={index} className="flex items-center gap-2 bg-[var(--surface-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-default)]">
                                <CheckCircleIcon className="w-4 h-4 text-[var(--status-success-bg)]"/>
                                <span className="text-sm font-semibold text-[var(--text-secondary)]">{t('exercise.setNumber', { number: set.set })}</span>
                                <span className="text-sm text-[var(--text-primary)] font-mono font-semibold">
                                     {'weight' in set ? t('exercise.weightReps', { weight: set.weight, reps: set.reps }) + (set.rpe ? ` @${set.rpe}` : '') : `${set.duration_s}s`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
        
        {exercise.notes && (
            <CardContent className="text-center text-xs text-[var(--text-tertiary)] mt-4 pt-4 border-t border-[var(--border-subtle)] p-0">
                {exercise.notes}
            </CardContent>
        )}
    </Card>
  );
};

export default ExerciseCard;