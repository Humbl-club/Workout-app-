import React, { useState } from 'react';
import { WorkoutLog, UserProfile, BodyMetrics } from '../types';
import { UserIcon, SignOutIcon, ScaleIcon, BookCheckIcon, CogIcon } from '../components/icons';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { notify } from '../components/layout/Toast';

interface ProfilePageProps {
  logs: WorkoutLog[];
  userProfile: UserProfile | null;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
  onCreateNewPlan?: () => void;
}

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  unit: string;
  onEdit: () => void;
}> = ({ label, value, unit, onEdit }) => (
  <button
    onClick={onEdit}
    className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 text-left hover:border-[var(--accent)] transition-all w-full"
    style={{ boxShadow: 'var(--shadow-sm)' }}
  >
    <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
      {label}
    </p>
    <p className="font-syne text-2xl font-bold text-[var(--text-primary)]">
      {value || '—'}
      <span className="text-[14px] text-[var(--text-secondary)] ml-1">{unit}</span>
    </p>
  </button>
);

export default function ProfilePage({ logs, userProfile, onUpdateProfile, onCreateNewPlan }: ProfilePageProps) {
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditMetric = () => {
    notify({ type: 'info', message: 'Body metrics editing coming soon!' });
  };

  const handleCreateNewPlan = () => {
    if (onCreateNewPlan) {
      onCreateNewPlan();
    } else {
      notify({ type: 'info', message: 'Plan creation coming soon!' });
    }
  };

  const bodyMetrics = userProfile?.bodyMetrics;

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-2">
          YOUR ACCOUNT
        </p>
        <h1 className="font-syne text-3xl font-bold text-[var(--text-primary)] leading-tight">
          Profile
        </h1>
      </header>

      <main className="space-y-6 pb-4">
        {/* Account Info */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-[var(--accent-light)] rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="font-syne text-xl font-bold text-[var(--text-primary)]">
                {auth.currentUser?.email?.split('@')[0] || 'Athlete'}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)]">
                {logs.length} workouts completed
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all"
          >
            <span className="text-[15px] font-medium text-[var(--text-primary)]">Sign Out</span>
            <SignOutIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
          </button>
        </div>

        {/* Body Metrics */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-syne text-xl font-bold text-[var(--text-primary)]">
              Body Metrics
            </h3>
            <button
              onClick={() => setIsEditingMetrics(!isEditingMetrics)}
              className="p-2 rounded-lg hover:bg-[var(--surface-secondary)] transition"
            >
              <CogIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Weight"
              value={bodyMetrics?.weight || 0}
              unit="lbs"
              onEdit={handleEditMetric}
            />
            <MetricCard
              label="Body Fat"
              value={bodyMetrics?.bodyFatPercentage || 0}
              unit="%"
              onEdit={handleEditMetric}
            />
          </div>

          {!bodyMetrics && (
            <p className="text-[12px] text-[var(--text-tertiary)] text-center mt-4">
              Tap to add your body metrics
            </p>
          )}
        </div>

        {/* Recent Workouts */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-4">
            <BookCheckIcon className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-syne text-xl font-bold text-[var(--text-primary)]">
              Recent Workouts
            </h3>
          </div>

          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((log, index) => {
                  const logDate = new Date(log.date);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
                    >
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                          {log.focus}
                        </p>
                        <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                          {logDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                          {log.durationMinutes && ` · ${log.durationMinutes} min`}
                        </p>
                      </div>
                      <p className="text-[12px] text-[var(--text-secondary)]">
                        {log.exercises.length} exercises
                      </p>
                    </div>
                  );
                })}

              <button className="w-full py-3 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[14px] font-medium text-[var(--text-primary)] transition">
                View All History
              </button>
            </div>
          ) : (
            <p className="text-[14px] text-[var(--text-secondary)] text-center py-8">
              No workouts yet. Start training to build your history!
            </p>
          )}
        </div>

        {/* Plan Management */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="font-syne text-xl font-bold text-[var(--text-primary)] mb-4">
            Plan Management
          </h3>

          <button
            onClick={handleCreateNewPlan}
            className="w-full py-4 rounded-lg font-semibold text-[15px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all"
            style={{ boxShadow: 'var(--glow-red)' }}
          >
            + Create New Plan
          </button>
        </div>

        {/* App Settings */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="font-syne text-xl font-bold text-[var(--text-primary)] mb-4">
            Preferences
          </h3>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all">
              <span className="text-[15px] font-medium text-[var(--text-primary)]">Notification Settings</span>
              <span className="text-[var(--text-tertiary)]">→</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all">
              <span className="text-[15px] font-medium text-[var(--text-primary)]">Units (Imperial/Metric)</span>
              <span className="text-[var(--text-tertiary)]">→</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all">
              <span className="text-[15px] font-medium text-[var(--text-primary)]">Export Data</span>
              <span className="text-[var(--text-tertiary)]">→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
