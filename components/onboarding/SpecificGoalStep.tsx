import React, { useState } from 'react';
import { SpecificGoal } from '../../types';
import { cn } from '../../lib/utils';
import { CalendarIcon, FlagIcon } from '../icons';

/* ═══════════════════════════════════════════════════════════════
   SPECIFIC GOAL STEP - Phase 9.4 Page Redesign

   Onboarding step for setting specific fitness events/goals.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

interface SpecificGoalStepProps {
  value: SpecificGoal | null;
  onChange: (value: SpecificGoal) => void;
}

const eventTypes = [
  { value: 'hyrox', label: 'Hyrox', description: 'Hybrid fitness race' },
  { value: 'marathon', label: 'Marathon', description: '42.2km endurance' },
  { value: 'half_marathon', label: 'Half Marathon', description: '21.1km endurance' },
  { value: 'triathlon', label: 'Triathlon', description: 'Swim, bike, run' },
  { value: 'powerlifting', label: 'Powerlifting Meet', description: 'Squat, bench, deadlift' },
  { value: 'bodybuilding', label: 'Bodybuilding Show', description: 'Physique competition' },
  { value: 'crossfit', label: 'CrossFit Competition', description: 'Functional fitness' },
  { value: 'spartan', label: 'Spartan Race', description: 'Obstacle course' },
  { value: 'custom', label: 'Other Event', description: 'Custom competition' },
];

const readinessLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function SpecificGoalStep({ value, onChange }: SpecificGoalStepProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateGoal = (updates: Partial<SpecificGoal>) => {
    onChange({
      event_type: value?.event_type ?? null,
      event_name: value?.event_name ?? null,
      target_date: value?.target_date ?? null,
      current_readiness: value?.current_readiness ?? null,
      description: value?.description ?? null,
      ...updates,
    });
  };

  // Calculate weeks until event
  const getWeeksUntilEvent = () => {
    if (!value?.target_date) return null;
    const target = new Date(value.target_date);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks > 0 ? diffWeeks : 0;
  };

  const weeksUntil = getWeeksUntilEvent();

  return (
    <div className="space-y-[var(--space-8)]">
      {/* Event Type Selection */}
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
          Event Type
        </p>
        <div className="grid grid-cols-3 gap-[var(--space-2)]">
          {eventTypes.map((event) => (
            <button
              key={event.value}
              onClick={() => updateGoal({ event_type: event.value })}
              className={cn(
                'p-[var(--space-3)]',
                'rounded-[var(--radius-xl)]',
                'text-center',
                'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
                'min-h-[80px]',
                'flex flex-col justify-center',
                value?.event_type === event.value
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
                  'text-[var(--text-sm)]',
                  'font-[var(--weight-bold)]',
                  'block',
                  value?.event_type === event.value
                    ? 'text-[var(--text-on-brand)]'
                    : 'text-[var(--text-primary)]'
                )}
              >
                {event.label}
              </span>
              <span
                className={cn(
                  'text-[var(--text-2xs)]',
                  'mt-[var(--space-1)]',
                  value?.event_type === event.value
                    ? 'text-[var(--text-on-brand)]/70'
                    : 'text-[var(--text-tertiary)]'
                )}
              >
                {event.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Event Name (optional) */}
      {value?.event_type && (
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
            Event Name <span className="font-[var(--weight-normal)]">(Optional)</span>
          </p>
          <input
            type="text"
            value={value.event_name || ''}
            onChange={(e) => updateGoal({ event_name: e.target.value || null })}
            placeholder="e.g., Hyrox Hamburg 2025"
            className={cn(
              'w-full',
              'h-[var(--height-input)]',
              'px-[var(--space-4)]',
              'bg-[var(--surface-primary)]',
              'border border-[var(--border-default)]',
              'rounded-[var(--radius-xl)]',
              'text-[var(--text-base)]',
              'font-[var(--weight-medium)]',
              'text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)]',
              'focus:border-[var(--brand-primary)]',
              'focus:ring-[3px] focus:ring-[var(--brand-primary)]/20',
              'focus:outline-none',
              'transition-all duration-[var(--duration-fast)]'
            )}
          />
        </div>
      )}

      {/* Target Date */}
      {value?.event_type && (
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
            Target Date
          </p>
          <div className="relative">
            <input
              type="date"
              value={value.target_date || ''}
              onChange={(e) => updateGoal({ target_date: e.target.value || null })}
              min={new Date().toISOString().split('T')[0]}
              className={cn(
                'w-full',
                'h-[var(--height-input)]',
                'px-[var(--space-4)] pr-12',
                'bg-[var(--surface-primary)]',
                'border border-[var(--border-default)]',
                'rounded-[var(--radius-xl)]',
                'text-[var(--text-base)]',
                'font-[var(--weight-medium)]',
                'text-[var(--text-primary)]',
                'focus:border-[var(--brand-primary)]',
                'focus:ring-[3px] focus:ring-[var(--brand-primary)]/20',
                'focus:outline-none',
                'transition-all duration-[var(--duration-fast)]',
                'appearance-none'
              )}
            />
            <CalendarIcon
              className={cn(
                'absolute right-[var(--space-4)] top-1/2 -translate-y-1/2',
                'w-5 h-5',
                'text-[var(--text-tertiary)]',
                'pointer-events-none'
              )}
            />
          </div>
          {weeksUntil !== null && weeksUntil > 0 && (
            <p
              className={cn(
                'text-[var(--text-sm)]',
                'text-[var(--brand-primary)]',
                'font-[var(--weight-medium)]',
                'mt-[var(--space-2)]'
              )}
            >
              {weeksUntil} weeks to prepare
            </p>
          )}
        </div>
      )}

      {/* Current Readiness */}
      {value?.event_type && (
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
            Current Readiness
          </p>
          <p
            className={cn(
              'text-[var(--text-sm)]',
              'text-[var(--text-secondary)]',
              'mb-[var(--space-4)]'
            )}
          >
            How ready are you for this event right now?
          </p>
          <div className="flex gap-[var(--space-1)]">
            {readinessLevels.map((level) => (
              <button
                key={level}
                onClick={() => updateGoal({ current_readiness: level })}
                className={cn(
                  'flex-1',
                  'h-12',
                  'rounded-[var(--radius-lg)]',
                  'font-[var(--weight-bold)]',
                  'text-[var(--text-sm)]',
                  'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
                  value.current_readiness === level
                    ? level <= 3
                      ? 'bg-[var(--status-error-bg)] text-[var(--text-on-brand)]'
                      : level <= 6
                      ? 'bg-[var(--status-warning-bg)] text-[var(--text-on-brand)]'
                      : 'bg-[var(--status-success-bg)] text-[var(--text-on-brand)]'
                    : cn(
                        'bg-[var(--surface-primary)]',
                        'border border-[var(--border-default)]',
                        'text-[var(--text-secondary)]',
                        'hover:border-[var(--brand-primary)]'
                      )
                )}
              >
                {level}
              </button>
            ))}
          </div>
          <div
            className={cn(
              'flex justify-between',
              'mt-[var(--space-2)]',
              'text-[var(--text-2xs)]',
              'text-[var(--text-tertiary)]'
            )}
          >
            <span>Not ready</span>
            <span>Competition ready</span>
          </div>
        </div>
      )}

      {/* Free-form Description */}
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
          Goal Description <span className="font-[var(--weight-normal)]">(Optional)</span>
        </p>
        <textarea
          value={value?.description || ''}
          onChange={(e) => updateGoal({ description: e.target.value || null })}
          placeholder="Describe your goal in detail... e.g., 'I want to finish Hyrox in under 90 minutes' or 'Get beach-ready by June'"
          rows={4}
          className={cn(
            'w-full',
            'p-[var(--space-4)]',
            'bg-[var(--surface-primary)]',
            'border border-[var(--border-default)]',
            'rounded-[var(--radius-xl)]',
            'text-[var(--text-base)]',
            'font-[var(--weight-medium)]',
            'text-[var(--text-primary)]',
            'placeholder:text-[var(--text-tertiary)]',
            'focus:border-[var(--brand-primary)]',
            'focus:ring-[3px] focus:ring-[var(--brand-primary)]/20',
            'focus:outline-none',
            'transition-all duration-[var(--duration-fast)]',
            'resize-none'
          )}
        />
      </div>

      {/* Summary Card */}
      {value?.event_type && value?.target_date && (
        <div
          className={cn(
            'p-[var(--space-5)]',
            'bg-gradient-to-br from-[var(--brand-primary)]/10 to-[var(--brand-primary)]/5',
            'border border-[var(--brand-primary)]/30',
            'rounded-[var(--radius-xl)]'
          )}
        >
          <div className="flex items-start gap-[var(--space-3)]">
            <div
              className={cn(
                'w-10 h-10',
                'rounded-full',
                'bg-[var(--brand-primary)]',
                'flex items-center justify-center',
                'shrink-0'
              )}
            >
              <FlagIcon className="w-5 h-5 text-[var(--text-on-brand)]" />
            </div>
            <div>
              <p
                className={cn(
                  'text-[var(--text-base)]',
                  'font-[var(--weight-bold)]',
                  'text-[var(--text-primary)]'
                )}
              >
                {value.event_name || eventTypes.find(e => e.value === value.event_type)?.label}
              </p>
              <p
                className={cn(
                  'text-[var(--text-sm)]',
                  'text-[var(--text-secondary)]',
                  'mt-[var(--space-1)]'
                )}
              >
                {new Date(value.target_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {value.current_readiness && (
                <p
                  className={cn(
                    'text-[var(--text-xs)]',
                    'text-[var(--text-tertiary)]',
                    'mt-[var(--space-2)]'
                  )}
                >
                  Current readiness: {value.current_readiness}/10
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
