import React, { useState } from 'react';
import { Supplement } from '../../types';
import { cn } from '../../lib/utils';
import { PlusIcon, XMarkIcon, CheckCircleIcon } from '../icons';

/* ═══════════════════════════════════════════════════════════════
   SUPPLEMENTS STEP - Phase 9.4 Page Redesign

   Onboarding step for selecting and configuring supplements.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

interface SupplementsStepProps {
  value: Supplement[];
  onChange: (supplements: Supplement[]) => void;
  primaryGoal?: string; // For AI recommendations
}

const commonSupplements: { name: string; defaultTiming: Supplement['timing'] }[] = [
  { name: 'Creatine Monohydrate', defaultTiming: 'morning' },
  { name: 'Whey Protein', defaultTiming: 'post_workout' },
  { name: 'Pre-Workout', defaultTiming: 'pre_workout' },
  { name: 'Caffeine', defaultTiming: 'morning' },
  { name: 'Fish Oil / Omega-3', defaultTiming: 'with_meals' },
  { name: 'Vitamin D3', defaultTiming: 'morning' },
  { name: 'Magnesium', defaultTiming: 'evening' },
  { name: 'Multivitamin', defaultTiming: 'morning' },
  { name: 'BCAA', defaultTiming: 'pre_workout' },
  { name: 'ZMA', defaultTiming: 'evening' },
  { name: 'Ashwagandha', defaultTiming: 'evening' },
  { name: 'Beta-Alanine', defaultTiming: 'pre_workout' },
];

const timingOptions: { value: Supplement['timing']; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'pre_workout', label: 'Pre-Workout' },
  { value: 'post_workout', label: 'Post-Workout' },
  { value: 'with_meals', label: 'With Meals' },
  { value: 'evening', label: 'Evening' },
];

/**
 * Get science-based supplement recommendations based on primary goal
 * Minimal, evidence-based recommendations only
 */
function getRecommendationsForGoal(goal?: string): { name: string; reason: string; timing: Supplement['timing'] }[] {
  if (!goal) return [];

  const goalLower = goal.toLowerCase();

  // Strength/Powerlifting goals
  if (goalLower.includes('strength') || goalLower.includes('power')) {
    return [
      { name: 'Creatine Monohydrate', reason: '8% strength increase (strong evidence)', timing: 'morning' },
      { name: 'Caffeine', reason: '2% strength improvement (strong evidence)', timing: 'pre_workout' },
      { name: 'Vitamin D3', reason: 'Supports bone health and power output', timing: 'morning' },
    ];
  }

  // Hypertrophy/Aesthetic goals
  if (goalLower.includes('muscle') || goalLower.includes('aesthetic') || goalLower.includes('bulk') || goalLower.includes('gain')) {
    return [
      { name: 'Creatine Monohydrate', reason: 'Most researched supplement for muscle growth', timing: 'morning' },
      { name: 'Whey Protein', reason: 'Convenient protein source (1.6g/kg target)', timing: 'post_workout' },
      { name: 'Fish Oil / Omega-3', reason: 'Reduces muscle soreness 15-20%', timing: 'with_meals' },
    ];
  }

  // Endurance/Cardio goals
  if (goalLower.includes('endurance') || goalLower.includes('cardio') || goalLower.includes('marathon') || goalLower.includes('running')) {
    return [
      { name: 'Caffeine', reason: '3% endurance improvement (strong evidence)', timing: 'pre_workout' },
      { name: 'Fish Oil / Omega-3', reason: 'Anti-inflammatory, faster recovery', timing: 'with_meals' },
      { name: 'Vitamin D3', reason: 'Common deficiency, supports immune function', timing: 'morning' },
    ];
  }

  // Athletic Performance
  if (goalLower.includes('athletic') || goalLower.includes('performance') || goalLower.includes('sport')) {
    return [
      { name: 'Creatine Monohydrate', reason: 'ATP regeneration for explosive efforts', timing: 'morning' },
      { name: 'Caffeine', reason: 'Performance boost across all domains', timing: 'pre_workout' },
      { name: 'Beta-Alanine', reason: 'Buffers lactic acid (1-4 min efforts)', timing: 'morning' },
    ];
  }

  // Weight Loss/Fat Loss
  if (goalLower.includes('weight loss') || goalLower.includes('fat loss') || goalLower.includes('cut')) {
    return [
      { name: 'Caffeine', reason: 'Metabolic boost + appetite suppression', timing: 'morning' },
      { name: 'Whey Protein', reason: 'Maintains muscle during deficit', timing: 'with_meals' },
      { name: 'Fish Oil / Omega-3', reason: 'Supports recovery during calorie deficit', timing: 'with_meals' },
    ];
  }

  // Competition Prep
  if (goalLower.includes('competition') || goalLower.includes('prep')) {
    return [
      { name: 'Creatine Monohydrate', reason: 'Performance optimization', timing: 'morning' },
      { name: 'Caffeine', reason: 'Energy + focus during intense training', timing: 'pre_workout' },
      { name: 'Ashwagandha', reason: 'Reduces cortisol 15-30% (stress management)', timing: 'evening' },
    ];
  }

  // Default: general health and performance
  return [
    { name: 'Creatine Monohydrate', reason: 'Most researched, broadly beneficial', timing: 'morning' },
    { name: 'Vitamin D3', reason: '40% deficiency rate, foundational health', timing: 'morning' },
  ];
}

export default function SupplementsStep({ value, onChange, primaryGoal }: SupplementsStepProps) {
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleSupplement = (name: string, defaultTiming: Supplement['timing']) => {
    const exists = value.find((s) => s.name === name);

    if (exists) {
      // Remove supplement
      onChange(value.filter((s) => s.name !== name));
    } else {
      // Add supplement
      onChange([
        ...value,
        {
          name,
          timing: defaultTiming,
          dosage: null,
          active: true,
        },
      ]);
    }
  };

  const updateTiming = (name: string, timing: Supplement['timing']) => {
    onChange(
      value.map((s) => (s.name === name ? { ...s, timing } : s))
    );
  };

  const updateDosage = (name: string, dosage: string) => {
    onChange(
      value.map((s) => (s.name === name ? { ...s, dosage: dosage || null } : s))
    );
  };

  const addCustomSupplement = () => {
    if (!customName.trim()) return;

    const exists = value.find(
      (s) => s.name.toLowerCase() === customName.trim().toLowerCase()
    );
    if (exists) return;

    onChange([
      ...value,
      {
        name: customName.trim(),
        timing: 'morning',
        dosage: null,
        active: true,
      },
    ]);

    setCustomName('');
    setShowCustomInput(false);
  };

  const isSelected = (name: string) => value.some((s) => s.name === name);

  // Get AI recommendations based on goal
  const recommendations = getRecommendationsForGoal(primaryGoal);

  return (
    <div className="space-y-[var(--space-6)]">
      {/* AI Recommendations (Science-Based) */}
      {recommendations.length > 0 && (
        <div className={cn(
          'p-[var(--space-4)]',
          'rounded-[var(--radius-xl)]',
          'bg-[var(--brand-primary-subtle)]',
          'border-2 border-[var(--brand-primary)]'
        )}>
          <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-3)]">
            <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
            <p className={cn(
              'text-[var(--text-xs)]',
              'font-[var(--weight-bold)]',
              'text-[var(--brand-primary)]',
              'uppercase tracking-[var(--tracking-wider)]'
            )}>
              AI Recommendations for {primaryGoal}
            </p>
          </div>
          <div className="space-y-[var(--space-2)]">
            {recommendations.map((rec) => (
              <button
                key={rec.name}
                onClick={() => {
                  if (!isSelected(rec.name)) {
                    toggleSupplement(rec.name, rec.timing);
                  }
                }}
                disabled={isSelected(rec.name)}
                className={cn(
                  'w-full p-[var(--space-3)]',
                  'rounded-[var(--radius-lg)]',
                  'text-left',
                  'transition-all duration-[var(--duration-fast)]',
                  isSelected(rec.name)
                    ? 'bg-[var(--brand-primary)]/20 opacity-60 cursor-default'
                    : 'bg-white hover:bg-[var(--brand-primary)]/10 active:scale-[0.98] cursor-pointer'
                )}
              >
                <div className="flex items-start justify-between gap-[var(--space-2)]">
                  <div className="flex-1">
                    <p className={cn(
                      'text-[var(--text-sm)]',
                      'font-[var(--weight-bold)]',
                      'text-[var(--text-primary)]',
                      'mb-1'
                    )}>
                      {rec.name}
                      {isSelected(rec.name) && (
                        <span className="ml-2 text-[var(--brand-primary)] text-[var(--text-xs)]">✓ Added</span>
                      )}
                    </p>
                    <p className={cn(
                      'text-[var(--text-xs)]',
                      'text-[var(--text-secondary)]'
                    )}>
                      {rec.reason}
                    </p>
                  </div>
                  {!isSelected(rec.name) && (
                    <PlusIcon className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <p className={cn(
            'text-[var(--text-2xs)]',
            'text-[var(--text-tertiary)]',
            'mt-[var(--space-3)]',
            'italic'
          )}>
            * Based on peer-reviewed research. Tap to add. Always consult a healthcare provider.
          </p>
        </div>
      )}

      {/* Common Supplements Grid */}
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
          All Supplements
        </p>
        <div className="grid grid-cols-2 gap-[var(--space-2)]">
          {commonSupplements.map((supp) => (
            <button
              key={supp.name}
              onClick={() => toggleSupplement(supp.name, supp.defaultTiming)}
              className={cn(
                'p-[var(--space-4)]',
                'rounded-[var(--radius-xl)]',
                'text-left',
                'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
                'min-h-[var(--height-touch-min)]',
                'flex items-center gap-[var(--space-3)]',
                isSelected(supp.name)
                  ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
                  : cn(
                      'bg-[var(--surface-primary)]',
                      'border border-[var(--border-default)]',
                      'hover:border-[var(--brand-primary)]'
                    )
              )}
            >
              <div
                className={cn(
                  'w-6 h-6',
                  'rounded-full',
                  'border-2',
                  'flex items-center justify-center',
                  'shrink-0',
                  'transition-all duration-[var(--duration-fast)]',
                  isSelected(supp.name)
                    ? 'border-[var(--text-on-brand)] bg-[var(--text-on-brand)]'
                    : 'border-[var(--border-default)]'
                )}
              >
                {isSelected(supp.name) && (
                  <CheckCircleIcon className="w-4 h-4 text-[var(--brand-primary)]" />
                )}
              </div>
              <span
                className={cn(
                  'text-[var(--text-sm)]',
                  'font-[var(--weight-bold)]',
                  isSelected(supp.name)
                    ? 'text-[var(--text-on-brand)]'
                    : 'text-[var(--text-primary)]'
                )}
              >
                {supp.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom */}
      <div>
        {showCustomInput ? (
          <div className="flex gap-[var(--space-2)]">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSupplement()}
              placeholder="Supplement name..."
              autoFocus
              className={cn(
                'flex-1',
                'h-12',
                'px-[var(--space-4)]',
                'bg-[var(--surface-primary)]',
                'border border-[var(--border-default)]',
                'rounded-[var(--radius-xl)]',
                'text-[var(--text-sm)]',
                'font-[var(--weight-medium)]',
                'text-[var(--text-primary)]',
                'placeholder:text-[var(--text-tertiary)]',
                'focus:border-[var(--brand-primary)]',
                'focus:ring-[3px] focus:ring-[var(--brand-primary)]/20',
                'focus:outline-none',
                'transition-all duration-[var(--duration-fast)]'
              )}
            />
            <button
              onClick={addCustomSupplement}
              disabled={!customName.trim()}
              className={cn(
                'h-12',
                'px-[var(--space-4)]',
                'bg-[var(--brand-primary)]',
                'text-[var(--text-on-brand)]',
                'rounded-[var(--radius-xl)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-sm)]',
                'transition-all duration-[var(--duration-fast)]',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomName('');
              }}
              className={cn(
                'h-12 w-12',
                'bg-[var(--surface-secondary)]',
                'rounded-[var(--radius-xl)]',
                'flex items-center justify-center',
                'transition-all duration-[var(--duration-fast)]',
                'hover:bg-[var(--surface-hover)]'
              )}
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomInput(true)}
            className={cn(
              'w-full',
              'h-12',
              'border-2 border-dashed border-[var(--border-default)]',
              'rounded-[var(--radius-xl)]',
              'flex items-center justify-center gap-[var(--space-2)]',
              'text-[var(--text-secondary)]',
              'hover:border-[var(--brand-primary)]',
              'hover:text-[var(--brand-primary)]',
              'transition-all duration-[var(--duration-fast)]'
            )}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-[var(--weight-bold)] text-[var(--text-sm)]">
              Add Custom Supplement
            </span>
          </button>
        )}
      </div>

      {/* Selected Supplements with Timing */}
      {value.length > 0 && (
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
            Configure Timing ({value.length} Selected)
          </p>
          <div className="space-y-[var(--space-3)]">
            {value.map((supp) => (
              <div
                key={supp.name}
                className={cn(
                  'p-[var(--space-4)]',
                  'bg-[var(--surface-primary)]',
                  'border border-[var(--border-default)]',
                  'rounded-[var(--radius-xl)]'
                )}
              >
                <div className="flex items-center justify-between mb-[var(--space-3)]">
                  <span
                    className={cn(
                      'text-[var(--text-sm)]',
                      'font-[var(--weight-bold)]',
                      'text-[var(--text-primary)]'
                    )}
                  >
                    {supp.name}
                  </span>
                  <button
                    onClick={() =>
                      onChange(value.filter((s) => s.name !== supp.name))
                    }
                    className={cn(
                      'p-[var(--space-1-5)]',
                      'rounded-[var(--radius-lg)]',
                      'text-[var(--text-tertiary)]',
                      'hover:bg-[var(--status-error-bg)]/10',
                      'hover:text-[var(--status-error-bg)]',
                      'transition-all duration-[var(--duration-fast)]'
                    )}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Timing Selection */}
                <div className="flex flex-wrap gap-[var(--space-1-5)] mb-[var(--space-3)]">
                  {timingOptions.map((timing) => (
                    <button
                      key={timing.value}
                      onClick={() => updateTiming(supp.name, timing.value)}
                      className={cn(
                        'px-[var(--space-3)] py-[var(--space-1-5)]',
                        'rounded-[var(--radius-lg)]',
                        'text-[var(--text-2xs)]',
                        'font-[var(--weight-bold)]',
                        'transition-all duration-[var(--duration-fast)]',
                        supp.timing === timing.value
                          ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
                          : cn(
                              'bg-[var(--surface-secondary)]',
                              'text-[var(--text-secondary)]',
                              'hover:bg-[var(--surface-hover)]'
                            )
                      )}
                    >
                      {timing.label}
                    </button>
                  ))}
                </div>

                {/* Dosage Input */}
                <input
                  type="text"
                  value={supp.dosage || ''}
                  onChange={(e) => updateDosage(supp.name, e.target.value)}
                  placeholder="Dosage (optional), e.g., 5g, 1 scoop"
                  className={cn(
                    'w-full',
                    'h-10',
                    'px-[var(--space-3)]',
                    'bg-[var(--surface-secondary)]',
                    'border border-transparent',
                    'rounded-[var(--radius-lg)]',
                    'text-[var(--text-sm)]',
                    'font-[var(--weight-medium)]',
                    'text-[var(--text-primary)]',
                    'placeholder:text-[var(--text-tertiary)]',
                    'focus:border-[var(--border-default)]',
                    'focus:outline-none',
                    'transition-all duration-[var(--duration-fast)]'
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div
          className={cn(
            'p-[var(--space-6)]',
            'bg-[var(--surface-secondary)]',
            'rounded-[var(--radius-xl)]',
            'text-center'
          )}
        >
          <p
            className={cn(
              'text-[var(--text-sm)]',
              'text-[var(--text-secondary)]'
            )}
          >
            No supplements selected. This is optional.
          </p>
          <p
            className={cn(
              'text-[var(--text-xs)]',
              'text-[var(--text-tertiary)]',
              'mt-[var(--space-1)]'
            )}
          >
            Select any supplements you're currently taking.
          </p>
        </div>
      )}

      {/* Info Note */}
      {value.length > 0 && (
        <div
          className={cn(
            'p-[var(--space-4)]',
            'bg-[var(--surface-secondary)]',
            'rounded-[var(--radius-xl)]'
          )}
        >
          <p
            className={cn(
              'text-[var(--text-xs)]',
              'text-[var(--text-secondary)]',
              'leading-[var(--leading-relaxed)]'
            )}
          >
            Supplement timing will be incorporated into your daily reminders and
            pre/post workout routines.
          </p>
        </div>
      )}
    </div>
  );
}
