import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Card, CardHeader, CardContent } from './ui/card';
import { ChevronDownIcon, CalendarIcon, DumbbellIcon, CheckCircleIcon } from './icons';
import { cn } from '../lib/utils';

interface BuddyWorkoutLogProps {
  userId: string;
  buddyId: string;
  buddyName?: string;
}

export default function BuddyWorkoutLog({ userId, buddyId, buddyName = "Buddy" }: BuddyWorkoutLogProps) {
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(0); // Default first one open

  const recentWorkouts = useQuery(
    api.buddyQueries.getBuddyRecentWorkouts,
    { userId, buddyId, limit: 5 }
  );

  if (!recentWorkouts?.allowed) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-[14px] text-[var(--text-secondary)]">
            {buddyName} hasn't enabled workout sharing
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!recentWorkouts.workouts || recentWorkouts.workouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-[14px] text-[var(--text-secondary)]">
            No recent workouts from {buddyName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recentWorkouts.workouts.map((workout, workoutIndex) => {
        const isExpanded = expandedWorkout === workoutIndex;
        const workoutDate = new Date(workout.date);

        return (
          <Card key={workoutIndex} className="overflow-hidden">
            <CardHeader
              className="p-4 cursor-pointer hover:bg-[var(--surface-secondary)] transition-all"
              onClick={() => setExpandedWorkout(isExpanded ? null : workoutIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] flex flex-col items-center justify-center border border-[var(--primary)]/20">
                    <p className="text-[14px] font-black text-[var(--primary)]">
                      {workoutDate.getDate()}
                    </p>
                    <p className="text-[8px] text-[var(--text-secondary)] font-bold uppercase">
                      {workoutDate.toLocaleDateString('en', { month: 'short' })}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[15px] font-bold text-[var(--text-primary)]">
                      {workout.focus}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <DumbbellIcon className="w-3 h-3" />
                        {workout.exercises.length} exercises
                      </span>
                      {workout.durationMinutes && (
                        <>
                          <span>·</span>
                          <span>{workout.durationMinutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronDownIcon
                  className={cn(
                    "w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-300",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </CardHeader>

            {/* Expanded workout details */}
            {isExpanded && (
              <CardContent className="px-4 pb-4 pt-0 space-y-3 animate-fade-in">
                {workout.exercises.map((exercise, exIndex) => {
                  // Calculate total volume for this exercise
                  const totalVolume = exercise.sets.reduce((sum, set) => {
                    if ('weight' in set && 'reps' in set) {
                      return sum + (Number(set.weight) * Number(set.reps));
                    }
                    return sum;
                  }, 0);

                  return (
                    <div
                      key={exIndex}
                      className="p-3 bg-[var(--surface-secondary)] rounded-xl"
                    >
                      {/* Exercise header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-[11px] font-bold flex items-center justify-center">
                            {exIndex + 1}
                          </span>
                          <div>
                            <h5 className="text-[14px] font-bold text-[var(--text-primary)]">
                              {exercise.exercise_name}
                            </h5>
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              {exercise.sets.length} sets · {totalVolume.toFixed(0)}kg total
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sets breakdown */}
                      <div className="space-y-1.5">
                        {exercise.sets.map((set, setIndex) => (
                          <div
                            key={setIndex}
                            className="flex items-center gap-3 p-2 bg-[var(--surface)] rounded-lg"
                          >
                            <div className="w-6 h-6 rounded-full bg-[var(--success-light)] border border-[var(--success)]/20 flex items-center justify-center">
                              <CheckCircleIcon className="w-4 h-4 text-[var(--success)]" />
                            </div>

                            <div className="flex-1 flex items-center gap-4">
                              <span className="text-[11px] text-[var(--text-tertiary)] font-bold min-w-[40px]">
                                Set {set.set}
                              </span>

                              {'weight' in set && (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase">
                                      Weight
                                    </span>
                                    <span className="text-[16px] font-black text-[var(--primary)] performance-data">
                                      {set.weight}kg
                                    </span>
                                  </div>

                                  <span className="text-[var(--text-tertiary)]">×</span>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase">
                                      Reps
                                    </span>
                                    <span className="text-[16px] font-black text-[var(--accent)] performance-data">
                                      {set.reps}
                                    </span>
                                  </div>

                                  {set.rpe && (
                                    <>
                                      <span className="text-[var(--text-tertiary)]">·</span>
                                      <span className="text-[11px] text-[var(--text-secondary)]">
                                        RPE {set.rpe}
                                      </span>
                                    </>
                                  )}
                                </>
                              )}

                              {'duration_s' in set && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase">
                                    Duration
                                  </span>
                                  <span className="text-[16px] font-black text-[var(--primary)] performance-data">
                                    {set.duration_s}s
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Volume for this set */}
                            {'weight' in set && 'reps' in set && (
                              <div className="text-right">
                                <p className="text-[10px] text-[var(--text-tertiary)] uppercase">
                                  Volume
                                </p>
                                <p className="text-[12px] font-bold text-[var(--text-secondary)] performance-data">
                                  {(Number(set.weight) * Number(set.reps)).toFixed(0)}kg
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Exercise summary */}
                      <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
                        <p className="text-[11px] text-[var(--text-tertiary)]">
                          Total: {exercise.sets.length} sets
                        </p>
                        <p className="text-[12px] font-bold text-[var(--primary)] performance-data">
                          {totalVolume.toFixed(0)}kg volume
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Workout Summary */}
                <div className="mt-4 p-3 bg-gradient-to-br from-[var(--success-light)] to-transparent border border-[var(--success)]/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase mb-1">
                        Total Volume
                      </p>
                      <p className="text-2xl font-black text-[var(--success)] performance-data">
                        {workout.exercises.reduce((sum, ex) => {
                          return sum + ex.sets.reduce((setSum, set) => {
                            if ('weight' in set && 'reps' in set) {
                              return setSum + (Number(set.weight) * Number(set.reps));
                            }
                            return setSum;
                          }, 0);
                        }, 0).toFixed(0)}kg
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase mb-1">
                        Total Sets
                      </p>
                      <p className="text-2xl font-black text-[var(--primary)] performance-data">
                        {workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
