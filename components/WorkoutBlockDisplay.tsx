import React from 'react';
import { WorkoutBlock, PlanExercise } from '../types';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { 
  RepeatIcon, // For supersets
  TimerIcon, // For AMRAP
  ClockIcon, // For EMOM
  FlameIcon, // For intensity
  DumbbellIcon, // For strength
  HeartIcon, // For cardio
  SparklesIcon, // For special techniques
  TrophyIcon // For challenges
} from './icons';

interface WorkoutBlockDisplayProps {
  block: WorkoutBlock;
  blockIndex: number;
  onExerciseClick?: (exercise: PlanExercise) => void;
}

export default function WorkoutBlockDisplay({ block, blockIndex, onExerciseClick }: WorkoutBlockDisplayProps) {
  // Detect special block types
  const detectBlockCharacteristics = () => {
    const characteristics: string[] = [];
    const blockTitle = block.title?.toLowerCase() || '';
    const exercises = block.exercises || [];
    
    // Check block type
    if (block.type === 'superset') {
      characteristics.push('superset');
    } else if (block.type === 'amrap') {
      characteristics.push('amrap');
    }
    
    // Check for EMOM patterns
    if (blockTitle.includes('emom') || blockTitle.includes('every minute')) {
      characteristics.push('emom');
    }
    
    // Check for circuit training
    if (blockTitle.includes('circuit') || exercises.length > 4) {
      characteristics.push('circuit');
    }
    
    // Check for cardio
    const cardioKeywords = ['row', 'run', 'bike', 'swim', 'jump rope', 'ski'];
    if (exercises.some(ex => cardioKeywords.some(kw => ex.exercise_name.toLowerCase().includes(kw)))) {
      characteristics.push('cardio');
    }
    
    // Check for strength focus
    const strengthKeywords = ['squat', 'deadlift', 'press', 'bench', 'pull'];
    if (exercises.some(ex => strengthKeywords.some(kw => ex.exercise_name.toLowerCase().includes(kw)))) {
      characteristics.push('strength');
    }
    
    // Check for buy-in/cash-out
    if (blockTitle.includes('buy-in') || blockTitle.includes('buy in')) {
      characteristics.push('warmup');
    }
    if (blockTitle.includes('cash-out') || blockTitle.includes('cash out') || blockTitle.includes('finisher')) {
      characteristics.push('finisher');
    }
    
    // Check for ladder/pyramid
    if (blockTitle.includes('ladder') || blockTitle.includes('pyramid')) {
      characteristics.push('ladder');
    }
    
    return characteristics;
  };

  const getBlockIcon = () => {
    const characteristics = detectBlockCharacteristics();
    
    if (characteristics.includes('superset')) return <RepeatIcon className="w-5 h-5" />;
    if (characteristics.includes('amrap')) return <TimerIcon className="w-5 h-5" />;
    if (characteristics.includes('emom')) return <ClockIcon className="w-5 h-5" />;
    if (characteristics.includes('cardio')) return <HeartIcon className="w-5 h-5" />;
    if (characteristics.includes('strength')) return <DumbbellIcon className="w-5 h-5" />;
    if (characteristics.includes('finisher')) return <FlameIcon className="w-5 h-5" />;
    if (characteristics.includes('ladder')) return <TrophyIcon className="w-5 h-5" />;
    
    return <SparklesIcon className="w-5 h-5" />;
  };

  const getBlockBadges = () => {
    const badges: React.ReactNode[] = [];
    const characteristics = detectBlockCharacteristics();
    
    // Block type badges
    if (block.type === 'superset') {
      badges.push(
        <Badge key="superset" variant="secondary" className="text-xs">
          {block.rounds ? `${block.rounds} Rounds` : 'Superset'}
        </Badge>
      );
    }
    
    if (block.type === 'amrap') {
      badges.push(
        <Badge key="amrap" variant="destructive" className="text-xs">
          {block.duration_minutes ? `${block.duration_minutes} min AMRAP` : 'AMRAP'}
        </Badge>
      );
    }
    
    // Additional characteristic badges
    if (characteristics.includes('emom')) {
      badges.push(<Badge key="emom" variant="outline" className="text-xs">EMOM</Badge>);
    }
    
    if (characteristics.includes('circuit')) {
      badges.push(<Badge key="circuit" variant="secondary" className="text-xs">Circuit</Badge>);
    }
    
    if (characteristics.includes('finisher')) {
      badges.push(<Badge key="finisher" variant="destructive" className="text-xs">Finisher</Badge>);
    }
    
    return badges;
  };

  const formatExerciseDisplay = (exercise: PlanExercise) => {
    const metrics = exercise.metrics_template;
    let displayText = '';
    
    switch (metrics?.type) {
      case 'sets_reps_weight':
        if (metrics.reps_per_set && Array.isArray(metrics.reps_per_set)) {
          displayText = metrics.reps_per_set.join('-') + ' reps';
        } else {
          displayText = metrics.target_sets ? `${metrics.target_sets} × ${metrics.target_reps || '?'}` : '';
        }
        if (metrics.one_rep_max_percentage) {
          displayText += ` @ ${metrics.one_rep_max_percentage}`;
        }
        break;
        
      case 'sets_distance_rest':
        displayText = metrics.target_distance_m ? `${metrics.target_distance_m}m` : '';
        if (metrics.target_sets && metrics.target_sets > 1) {
          displayText = `${metrics.target_sets} × ${displayText}`;
        }
        break;
        
      case 'sets_duration':
        // Handle both field naming conventions
        const durationSec = metrics.target_duration_s || metrics.duration_seconds;
        displayText = durationSec ? `${durationSec}s` : '';
        if (metrics.target_sets && metrics.target_sets > 1) {
          displayText = `${metrics.target_sets} × ${displayText}`;
        }
        break;

      case 'duration_only':
        // Handle both field naming conventions
        const durationMin = metrics.target_duration_minutes || metrics.duration_minutes;
        if (durationMin) {
          displayText = `${durationMin} min`;
        } else if (metrics.target_duration_s) {
          displayText = `${metrics.target_duration_s}s`;
        }
        break;

      case 'distance_time':
        displayText = '';
        // Handle both field naming conventions
        const distKm = metrics.target_distance_km || metrics.distance_km;
        const distM = metrics.target_distance_m || metrics.distance_m;
        if (distKm) {
          displayText = `${distKm}km`;
        } else if (distM) {
          displayText = `${distM}m`;
        }
        break;
    }
    
    // Add RPE if present
    if (exercise.rpe) {
      displayText += ` RPE ${exercise.rpe}`;
    }
    
    // Add tempo if present
    if (metrics?.target_tempo) {
      displayText += ` Tempo: ${metrics.target_tempo}`;
    }
    
    return displayText;
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'warmup':
        return 'text-yellow-400';
      case 'main':
        return 'text-white';
      case 'cooldown':
        return 'text-blue-400';
      default:
        return 'text-stone-300';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getBlockIcon()}
            <CardTitle className="text-lg">
              {block.title || `Block ${blockIndex + 1}`}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {getBlockBadges()}
          </div>
        </div>
        {block.notes && (
          <p className="text-sm text-stone-400 mt-2">{block.notes}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {(block.exercises || []).map((exercise, idx) => (
            <div
              key={idx}
              className={`p-3 bg-stone-800/50 rounded-lg border border-stone-700 hover:border-stone-600 transition cursor-pointer ${
                block.type === 'superset' ? 'ml-4' : ''
              }`}
              onClick={() => onExerciseClick?.(exercise)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {block.type === 'superset' && (
                    <span className="text-sm font-bold text-stone-500">
                      {String.fromCharCode(65 + blockIndex)}{idx + 1}
                    </span>
                  )}
                  <h4 className={`font-semibold ${getCategoryColor(exercise.category)}`}>
                    {exercise.exercise_name}
                  </h4>
                  {exercise.category && exercise.category !== 'main' && (
                    <Badge variant="outline" className="text-xs">
                      {exercise.category}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-stone-400">
                  {formatExerciseDisplay(exercise)}
                </span>
              </div>
              
              {exercise.notes && (
                <p className="text-xs text-stone-500 mt-2">{exercise.notes}</p>
              )}
              
              {/* Rest timing for supersets */}
              {block.type === 'superset' && exercise.metrics_template?.rest_period_s !== undefined && (
                <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                  <ClockIcon className="w-3 h-3" />
                  <span>
                    {exercise.metrics_template.rest_period_s === 0 
                      ? 'No rest (move to next)' 
                      : `Rest ${exercise.metrics_template.rest_period_s}s`
                    }
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Special instructions for block types - using design system colors */}
        {block.type === 'amrap' && block.duration_minutes && (
          <div className="mt-4 p-3 bg-[var(--warning-light)] border border-[var(--warning)]/30 rounded-lg">
            <p className="text-sm text-[var(--warning)] font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
              Complete as many rounds as possible in {block.duration_minutes} minutes
            </p>
          </div>
        )}

        {block.type === 'superset' && block.rounds && (
          <div className="mt-4 p-3 bg-[var(--primary-light)] border border-[var(--primary)]/30 rounded-lg">
            <p className="text-sm text-[var(--primary)] font-medium">
              Complete all exercises in sequence, then rest. Repeat for {block.rounds} total rounds.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
