import React, { useState } from 'react';
import { TrainingSplit, CardioPreferences } from '../../types';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   TRAINING SPLIT STEP - Phase 9.4 Page Redesign

   Onboarding step for selecting training frequency and type.
   Includes cardio preferences when applicable.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

interface TrainingSplitStepProps {
  value: TrainingSplit | null;
  onChange: (value: TrainingSplit) => void;
}

const sessionsOptions = [
  {
    value: '1' as const,
    label: 'Once Daily',
    description: 'Single focused training session',
  },
  {
    value: '2' as const,
    label: 'Twice Daily',
    description: 'AM/PM split for higher volume',
  },
];

const trainingTypeOptions = [
  {
    value: 'strength_only' as const,
    label: 'Strength Only',
    description: 'Pure resistance training focus',
    hasCardio: false,
  },
  {
    value: 'strength_plus_cardio' as const,
    label: 'Strength + Cardio',
    description: 'Separate strength and cardio sessions',
    hasCardio: true,
  },
  {
    value: 'combined' as const,
    label: 'Combined Sessions',
    description: 'Strength with cardio finishers',
    hasCardio: true,
  },
  {
    value: 'cardio_focused' as const,
    label: 'Cardio Focused',
    description: 'Endurance priority with maintenance lifting',
    hasCardio: true,
  },
];

const cardioTypeOptions = [
  { value: 'running', label: 'Running', emoji: '🏃' },
  { value: 'incline_walk', label: 'Incline Walk', emoji: '🚶' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'rowing', label: 'Rowing', emoji: '🚣' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊' },
  { value: 'elliptical', label: 'Elliptical', emoji: '⚡' },
  { value: 'stair_climber', label: 'Stair Climber', emoji: '🪜' },
  { value: 'hiking', label: 'Hiking', emoji: '🥾' },
];

const cardioDurationOptions = [
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

export default function TrainingSplitStep({ value, onChange }: TrainingSplitStepProps) {
  const showCardioPreferences = value?.training_type &&
    trainingTypeOptions.find(o => o.value === value.training_type)?.hasCardio;

  const handleSessionsChange = (sessions: '1' | '2') => {
    onChange({
      ...value,
      sessions_per_day: sessions,
      training_type: value?.training_type || 'strength_only',
    });
  };

  const handleTypeChange = (type: TrainingSplit['training_type']) => {
    // Reset cardio preferences if switching to strength_only
    const needsCardio = trainingTypeOptions.find(o => o.value === type)?.hasCardio;
    onChange({
      ...value,
      sessions_per_day: value?.sessions_per_day || '1',
      training_type: type,
      cardio_preferences: needsCardio ? (value?.cardio_preferences || { preferred_types: [] }) : undefined,
    });
  };

  const handleCardioTypeToggle = (cardioType: string) => {
    const currentTypes = value?.cardio_preferences?.preferred_types || [];
    const newTypes = currentTypes.includes(cardioType)
      ? currentTypes.filter(t => t !== cardioType)
      : [...currentTypes, cardioType];

    onChange({
      ...value!,
      cardio_preferences: {
        ...value?.cardio_preferences,
        preferred_types: newTypes,
        // Set favorite if first selection
        favorite_exercise: value?.cardio_preferences?.favorite_exercise ||
          (newTypes.length === 1 ? newTypes[0] : undefined),
      },
    });
  };

  const handleFavoriteChange = (favorite: string) => {
    onChange({
      ...value!,
      cardio_preferences: {
        ...value?.cardio_preferences,
        preferred_types: value?.cardio_preferences?.preferred_types || [],
        favorite_exercise: favorite,
      },
    });
  };

  const handleCardioDurationChange = (duration: number) => {
    onChange({
      ...value!,
      cardio_preferences: {
        ...value?.cardio_preferences,
        preferred_types: value?.cardio_preferences?.preferred_types || [],
        cardio_duration_minutes: duration,
      },
    });
  };

  return (
    <div className="space-y-[var(--space-8)]">
      {/* Sessions Per Day */}
      <div>
        <p
          className={cn(
            'text-[var(--text-2xs)]',
            'text-[var(--text-tertiary)]',
            'font-[var(--weight-bold)]',
            'uppercase tracking-[var(--tracking-wider)]',
            'mb-[var(--space-4)]'
          )}
        >
          Sessions Per Day
        </p>
        <div className="grid grid-cols-2 gap-[var(--space-3)]">
          {sessionsOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSessionsChange(option.value)}
              className={cn(
                'p-[var(--space-5)]',
                'rounded-[var(--radius-xl)]',
                'text-left',
                'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
                'min-h-[100px]',
                'flex flex-col justify-between',
                value?.sessions_per_day === option.value
                  ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
                  : cn(
                      'bg-[var(--surface-primary)]',
                      'border border-[var(--border-default)]',
                      'hover:border-[var(--brand-primary)]'
                    )
              )}
            >
              <span
                className={cn(
                  'text-[var(--text-2xl)]',
                  'font-[var(--weight-black)]',
                  value?.sessions_per_day === option.value
                    ? 'text-[var(--text-on-brand)]'
                    : 'text-[var(--text-primary)]'
                )}
              >
                {option.value}x
              </span>
              <div>
                <span
                  className={cn(
                    'text-[var(--text-sm)]',
                    'font-[var(--weight-bold)]',
                    'block',
                    value?.sessions_per_day === option.value
                      ? 'text-[var(--text-on-brand)]'
                      : 'text-[var(--text-primary)]'
                  )}
                >
                  {option.label}
                </span>
                <span
                  className={cn(
                    'text-[var(--text-xs)]',
                    value?.sessions_per_day === option.value
                      ? 'text-[var(--text-on-brand)]/70'
                      : 'text-[var(--text-tertiary)]'
                  )}
                >
                  {option.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Training Type */}
      <div>
        <p
          className={cn(
            'text-[var(--text-2xs)]',
            'text-[var(--text-tertiary)]',
            'font-[var(--weight-bold)]',
            'uppercase tracking-[var(--tracking-wider)]',
            'mb-[var(--space-4)]'
          )}
        >
          Training Type
        </p>
        <div className="space-y-[var(--space-3)]">
          {trainingTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTypeChange(option.value)}
              className={cn(
                'w-full',
                'p-[var(--space-5)]',
                'rounded-[var(--radius-xl)]',
                'text-left',
                'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
                'min-h-[var(--height-touch-min)]',
                'flex items-center',
                value?.training_type === option.value
                  ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
                  : cn(
                      'bg-[var(--surface-primary)]',
                      'border border-[var(--border-default)]',
                      'hover:border-[var(--brand-primary)]'
                    )
              )}
            >
              <div className="flex-1">
                <span
                  className={cn(
                    'text-[var(--text-base)]',
                    'font-[var(--weight-bold)]',
                    'block',
                    value?.training_type === option.value
                      ? 'text-[var(--text-on-brand)]'
                      : 'text-[var(--text-primary)]'
                  )}
                >
                  {option.label}
                </span>
                <span
                  className={cn(
                    'text-[var(--text-sm)]',
                    value?.training_type === option.value
                      ? 'text-[var(--text-on-brand)]/70'
                      : 'text-[var(--text-tertiary)]'
                  )}
                >
                  {option.description}
                </span>
              </div>
              {/* Selection indicator */}
              <div
                className={cn(
                  'w-6 h-6',
                  'rounded-full',
                  'border-2',
                  'flex items-center justify-center',
                  'shrink-0 ml-[var(--space-4)]',
                  'transition-all duration-[var(--duration-fast)]',
                  value?.training_type === option.value
                    ? 'border-[var(--text-on-brand)] bg-[var(--text-on-brand)]'
                    : 'border-[var(--border-default)]'
                )}
              >
                {value?.training_type === option.value && (
                  <div className="w-3 h-3 rounded-full bg-[var(--brand-primary)]" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cardio Preferences - Shows when training type includes cardio */}
      {showCardioPreferences && (
        <div className="space-y-[var(--space-6)]">
          {/* Cardio Types */}
          <div>
            <p
              className={cn(
                'text-[var(--text-2xs)]',
                'text-[var(--text-tertiary)]',
                'font-[var(--weight-bold)]',
                'uppercase tracking-[var(--tracking-wider)]',
                'mb-[var(--space-4)]'
              )}
            >
              Cardio Preferences
            </p>
            <div className="grid grid-cols-4 gap-[var(--space-2)]">
              {cardioTypeOptions.map((option) => {
                const isSelected = value?.cardio_preferences?.preferred_types?.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleCardioTypeToggle(option.value)}
                    className={cn(
                      'p-[var(--space-3)]',
                      'rounded-[var(--radius-lg)]',
                      'flex flex-col items-center justify-center',
                      'transition-all duration-[var(--duration-fast)]',
                      'min-h-[72px]',
                      isSelected
                        ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
                        : cn(
                            'bg-[var(--surface-primary)]',
                            'border border-[var(--border-default)]',
                            'active:border-[var(--brand-primary)]'
                          )
                    )}
                  >
                    <span className="text-xl mb-1">{option.emoji}</span>
                    <span
                      className={cn(
                        'text-[var(--text-2xs)]',
                        'font-[var(--weight-medium)]',
                        'text-center leading-tight',
                        isSelected ? 'text-[var(--text-on-brand)]' : 'text-[var(--text-secondary)]'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorite Cardio - Only show if multiple types selected */}
          {(value?.cardio_preferences?.preferred_types?.length || 0) > 1 && (
            <div>
              <p
                className={cn(
                  'text-[var(--text-2xs)]',
                  'text-[var(--text-tertiary)]',
                  'font-[var(--weight-bold)]',
                  'uppercase tracking-[var(--tracking-wider)]',
                  'mb-[var(--space-3)]'
                )}
              >
                Primary Cardio
              </p>
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {value?.cardio_preferences?.preferred_types?.map((type) => {
                  const option = cardioTypeOptions.find(o => o.value === type);
                  const isFavorite = value?.cardio_preferences?.favorite_exercise === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleFavoriteChange(type)}
                      className={cn(
                        'px-[var(--space-4)] py-[var(--space-2)]',
                        'rounded-full',
                        'flex items-center gap-[var(--space-2)]',
                        'transition-all duration-[var(--duration-fast)]',
                        isFavorite
                          ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
                          : cn(
                              'bg-[var(--surface-secondary)]',
                              'text-[var(--text-secondary)]',
                              'active:bg-[var(--surface-tertiary)]'
                            )
                      )}
                    >
                      <span>{option?.emoji}</span>
                      <span className="text-[var(--text-sm)] font-[var(--weight-medium)]">
                        {option?.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cardio Duration */}
          <div>
            <p
              className={cn(
                'text-[var(--text-2xs)]',
                'text-[var(--text-tertiary)]',
                'font-[var(--weight-bold)]',
                'uppercase tracking-[var(--tracking-wider)]',
                'mb-[var(--space-3)]'
              )}
            >
              Cardio Session Length
            </p>
            <div className="grid grid-cols-4 gap-[var(--space-2)]">
              {cardioDurationOptions.map((option) => {
                const isSelected = value?.cardio_preferences?.cardio_duration_minutes === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleCardioDurationChange(option.value)}
                    className={cn(
                      'py-[var(--space-3)]',
                      'rounded-[var(--radius-lg)]',
                      'text-center',
                      'transition-all duration-[var(--duration-fast)]',
                      isSelected
                        ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
                        : cn(
                            'bg-[var(--surface-primary)]',
                            'border border-[var(--border-default)]',
                            'active:border-[var(--brand-primary)]'
                          )
                    )}
                  >
                    <span
                      className={cn(
                        'text-[var(--text-sm)]',
                        'font-[var(--weight-bold)]',
                        isSelected ? 'text-[var(--text-on-brand)]' : 'text-[var(--text-primary)]'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      {value?.sessions_per_day === '2' && (
        <div
          className={cn(
            'p-[var(--space-4)]',
            'bg-[var(--surface-secondary)]',
            'rounded-[var(--radius-xl)]'
          )}
        >
          <p
            className={cn(
              'text-[var(--text-sm)]',
              'text-[var(--text-secondary)]',
              'leading-[var(--leading-relaxed)]'
            )}
          >
            Two-a-day training works best with adequate sleep (7-9 hours) and proper nutrition.
            Sessions should be separated by at least 6 hours.
          </p>
        </div>
      )}
    </div>
  );
}
