import React, { useState } from 'react';
import { AuxiliaryRoutine, DailyHabit, SimpleExercise } from '../types';
import { ClockIcon, CalendarIcon, SparklesIcon, RefreshIcon, HeartIcon, FlameIcon, SunIcon, MoonIcon } from './icons';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface AuxiliaryRoutineDisplayProps {
  auxiliaryRoutines?: {
    mobility?: AuxiliaryRoutine[];
    stretching?: AuxiliaryRoutine[];
    activation?: AuxiliaryRoutine[];
    recovery?: AuxiliaryRoutine[];
    sportDrills?: AuxiliaryRoutine[];
  };
  dailyRoutines?: {
    morning?: DailyHabit[];
    preWorkout?: DailyHabit[];
    postWorkout?: DailyHabit[];
    evening?: DailyHabit[];
  };
}

export default function AuxiliaryRoutineDisplay({ auxiliaryRoutines, dailyRoutines }: AuxiliaryRoutineDisplayProps) {
  const [activeTab, setActiveTab] = useState<'auxiliary' | 'daily'>('auxiliary');
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

  // Count total routines
  const auxiliaryCount = Object.values(auxiliaryRoutines || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  const dailyCount = Object.values(dailyRoutines || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0);

  if (!auxiliaryCount && !dailyCount) {
    return null;
  }

  const getFrequencyBadge = (frequency: string) => {
    const frequencyMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      daily: { label: 'Daily', variant: 'default' },
      '3x_week': { label: '3x/Week', variant: 'secondary' },
      pre_workout: { label: 'Pre-Workout', variant: 'outline' },
      post_workout: { label: 'Post-Workout', variant: 'outline' },
      as_needed: { label: 'As Needed', variant: 'secondary' },
    };
    
    const config = frequencyMap[frequency] || { label: frequency, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return <SunIcon className="w-4 h-4" />;
      case 'evening':
        return <MoonIcon className="w-4 h-4" />;
      case 'pre_workout':
        return <FlameIcon className="w-4 h-4" />;
      case 'post_workout':
        return <RefreshIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const renderExercise = (exercise: SimpleExercise, index: number) => (
    <div key={index} className="flex items-center justify-between py-2 px-3 bg-stone-800/30 rounded">
      <span className="text-sm text-stone-200">{exercise.exercise_name}</span>
      <span className="text-xs text-stone-400">
        {exercise.duration_s ? `${exercise.duration_s}s` : exercise.reps || ''}
      </span>
    </div>
  );

  const renderAuxiliaryRoutine = (routine: AuxiliaryRoutine, type: string) => {
    const isExpanded = expandedRoutine === routine.id;
    
    return (
      <Card key={routine.id} className="mb-3">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setExpandedRoutine(isExpanded ? null : routine.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">{routine.name}</CardTitle>
              {getFrequencyBadge(routine.frequency)}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <ClockIcon className="w-3 h-3" />
              {routine.duration_minutes} min
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-2">
            {routine.notes && (
              <p className="text-sm text-stone-400 mb-3">{routine.notes}</p>
            )}
            {routine.exercises.map((exercise, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-stone-800/30 rounded">
                <span className="text-sm text-stone-200">{exercise.exercise_name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {exercise.category}
                  </Badge>
                  {exercise.notes && (
                    <span className="text-xs text-stone-500">{exercise.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderDailyHabit = (habit: DailyHabit, timeOfDay: string) => {
    const uniqueId = `${timeOfDay}-${habit.name}`;
    const isExpanded = expandedRoutine === uniqueId;
    
    return (
      <Card key={uniqueId} className="mb-3">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setExpandedRoutine(isExpanded ? null : uniqueId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTimeIcon(habit.time_of_day)}
              <CardTitle className="text-base">{habit.name}</CardTitle>
              {habit.mandatory && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <ClockIcon className="w-3 h-3" />
              {habit.duration_minutes} min
              {habit.reminder_time && (
                <>
                  <span className="text-stone-600">•</span>
                  <span>{habit.reminder_time}</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-2">
            {habit.exercises.map((exercise, idx) => renderExercise(exercise, idx))}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Additional Routines</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('auxiliary')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
              activeTab === 'auxiliary' 
                ? 'bg-red-500 text-white' 
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            Training ({auxiliaryCount})
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
              activeTab === 'daily' 
                ? 'bg-red-500 text-white' 
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            Daily ({dailyCount})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === 'auxiliary' && auxiliaryRoutines && (
          <>
            {auxiliaryRoutines.mobility && auxiliaryRoutines.mobility.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Mobility Work</h4>
                {auxiliaryRoutines.mobility.map(routine => renderAuxiliaryRoutine(routine, 'mobility'))}
              </div>
            )}
            {auxiliaryRoutines.stretching && auxiliaryRoutines.stretching.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Stretching</h4>
                {auxiliaryRoutines.stretching.map(routine => renderAuxiliaryRoutine(routine, 'stretching'))}
              </div>
            )}
            {auxiliaryRoutines.activation && auxiliaryRoutines.activation.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Activation</h4>
                {auxiliaryRoutines.activation.map(routine => renderAuxiliaryRoutine(routine, 'activation'))}
              </div>
            )}
            {auxiliaryRoutines.recovery && auxiliaryRoutines.recovery.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Recovery</h4>
                {auxiliaryRoutines.recovery.map(routine => renderAuxiliaryRoutine(routine, 'recovery'))}
              </div>
            )}
            {auxiliaryRoutines.sportDrills && auxiliaryRoutines.sportDrills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Sport Drills</h4>
                {auxiliaryRoutines.sportDrills.map(routine => renderAuxiliaryRoutine(routine, 'sportDrills'))}
              </div>
            )}
          </>
        )}

        {activeTab === 'daily' && dailyRoutines && (
          <>
            {dailyRoutines.morning && dailyRoutines.morning.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Morning Routine</h4>
                {dailyRoutines.morning.map(habit => renderDailyHabit(habit, 'morning'))}
              </div>
            )}
            {dailyRoutines.preWorkout && dailyRoutines.preWorkout.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Pre-Workout</h4>
                {dailyRoutines.preWorkout.map(habit => renderDailyHabit(habit, 'preWorkout'))}
              </div>
            )}
            {dailyRoutines.postWorkout && dailyRoutines.postWorkout.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Post-Workout</h4>
                {dailyRoutines.postWorkout.map(habit => renderDailyHabit(habit, 'postWorkout'))}
              </div>
            )}
            {dailyRoutines.evening && dailyRoutines.evening.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-400 mb-2">Evening Routine</h4>
                {dailyRoutines.evening.map(habit => renderDailyHabit(habit, 'evening'))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
