import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutLog, UserProfile, BodyMetrics } from '../types';
import { UserIcon, SignOutIcon, ScaleIcon, BookCheckIcon, CogIcon, UsersIcon, TrophyIcon } from '../components/icons';
import { useClerk, useUser } from '@clerk/clerk-react';
import { notify } from '../components/layout/Toast';
import InjuryProfile from '../components/InjuryProfile';
import LanguageSwitcher from '../components/LanguageSwitcher';
import HeatMapCalendar from '../components/HeatMapCalendar';
import StreakCounter from '../components/StreakCounter';
import PhotoCaptureDialog from '../components/PhotoCaptureDialog';
import ProgressPhotoCard from '../components/ProgressPhotoCard';
import PhotoTimeline from '../components/PhotoTimeline';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Card, CardHeader, CardContent } from '../components/ui/card';

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
    className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-left hover:border-[var(--accent)] transition-all w-full"
    style={{ boxShadow: 'var(--shadow-sm)' }}
  >
    <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-0.5">
      {label}
    </p>
    <p className="text-base font-bold text-[var(--text-primary)]">
      {value || '—'}
      <span className="text-[12px] text-[var(--text-secondary)] ml-1">{unit}</span>
    </p>
  </button>
);

export default function ProfilePage({ logs, userProfile, onUpdateProfile, onCreateNewPlan }: ProfilePageProps) {
  const { t } = useTranslation();
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [isPhotoCaptureOpen, setIsPhotoCaptureOpen] = useState(false);
  const [viewAllPhotos, setViewAllPhotos] = useState(false);
  const [showTrainingPrefs, setShowTrainingPrefs] = useState(false);
  const [showInjuryProfile, setShowInjuryProfile] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  // Get full user data with injury profile from Convex
  const userId = user?.id || null;
  const fullUserData = useQuery(
    api.queries.getUserProfile,
    userId ? { userId } : "skip"
  );

  // Get achievements
  const achievements = useQuery(
    api.achievementQueries.getUserAchievements,
    userId ? { userId } : "skip"
  );

  // Get latest progress photo
  const latestPhoto = useQuery(
    api.photoQueries.getLatestPhoto,
    userId ? { userId } : "skip"
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditMetric = () => {
    notify({ type: 'info', message: t('profile.bodyMetricsComingSoon') });
  };

  const handleCreateNewPlan = () => {
    if (onCreateNewPlan) {
      onCreateNewPlan();
    } else {
      notify({ type: 'info', message: t('profile.planCreationComingSoon') });
    }
  };

  const bodyMetrics = userProfile?.bodyMetrics;

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
      <header className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-1">
              {t('profile.account')}
            </p>
            <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
              {t('profile.title')}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="space-y-5 pb-4">
        {/* Account Info */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[var(--accent-light)] rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {user?.emailAddresses[0]?.emailAddress?.split('@')[0] || t('profile.defaultName')}
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)]">
                {t('profile.workoutsCompleted', { count: logs.length })}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all"
          >
            <span className="text-[13px] font-medium text-[var(--text-primary)]">{t('auth.signOut')}</span>
            <SignOutIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>
        </div>

        {/* Body Metrics - Moved up */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {t('profile.bodyMetrics')}
            </h3>
            <button
              onClick={() => setIsEditingMetrics(!isEditingMetrics)}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] transition"
            >
              <CogIcon className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-gradient-to-br from-[var(--primary-light)] to-transparent rounded-2xl border border-[var(--primary)]/20">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">Weight</p>
              <p className="text-3xl font-black text-[var(--primary)] stat-number mb-1">
                {bodyMetrics?.weight || '—'}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] font-semibold">kg</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-[var(--accent-light)] to-transparent rounded-2xl border border-[var(--accent)]/20">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">Body Fat</p>
              <p className="text-3xl font-black text-[var(--accent)] stat-number mb-1">
                {bodyMetrics?.bodyFatPercentage || '—'}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] font-semibold">%</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-[var(--success-light)] to-transparent rounded-2xl border border-[var(--success)]/20">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">Workouts</p>
              <p className="text-3xl font-black text-[var(--success)] stat-number mb-1">
                {logs.length}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] font-semibold">total</p>
            </div>
          </div>

          {!bodyMetrics && (
            <p className="text-[11px] text-[var(--text-tertiary)] text-center mt-3">
              {t('profile.addBodyMetrics')}
            </p>
          )}
        </div>

        {/* Streak Counter */}
        {userId && <StreakCounter userId={userId} />}

        {/* Recent Workouts */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-3">
            <BookCheckIcon className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {t('profile.recentWorkouts')}
            </h3>
          </div>

          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((log, index) => {
                  const logDate = new Date(log.date);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {log.focus}
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                          {logDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                          {log.durationMinutes && ` · ${log.durationMinutes} ${t('workout.min')}`}
                        </p>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {t('workout.exerciseCount', { count: log.exercises.length })}
                      </p>
                    </div>
                  );
                })}

              <button className="w-full py-2.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[13px] font-medium text-[var(--text-primary)] transition">
                {t('profile.viewAllHistory')}
              </button>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-secondary)] text-center py-6">
              {t('profile.noWorkoutsYet')}
            </p>
          )}
        </div>

        {/* Section Divider - Your Progress */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--background-primary)] px-4 text-[11px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">
              Your Progress
            </span>
          </div>
        </div>

        {/* Progress Photos Section */}
        {userId && (
          <Card>
            <CardHeader className="p-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  Progress Photos
                </h3>
                <button
                  onClick={() => setIsPhotoCaptureOpen(true)}
                  className="px-3 py-1.5 text-[12px] font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  + Add Photo
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {latestPhoto ? (
                <div className="space-y-3">
                  <div className="max-w-sm mx-auto">
                    <ProgressPhotoCard
                      photoUrl={latestPhoto.photoUrl}
                      photoType={latestPhoto.photoType}
                      date={latestPhoto.date}
                      aiAnalysis={latestPhoto.aiAnalysis}
                    />
                  </div>
                  <button
                    onClick={() => setViewAllPhotos(true)}
                    className="w-full py-2.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[13px] font-medium text-[var(--text-primary)] transition"
                  >
                    View All Photos
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[var(--text-tertiary)]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">
                    No progress photos yet
                  </p>
                  <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto mb-4">
                    Start tracking your transformation with AI-powered body composition analysis
                  </p>
                  <button
                    onClick={() => setIsPhotoCaptureOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-white text-[14px] font-bold rounded-lg hover:shadow-lg transition-all"
                  >
                    Upload First Photo
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements Section */}
        {userId && (
          <Card>
            <CardHeader className="p-4 border-b border-[var(--border)]">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-[var(--accent)]" />
                Achievements
              </h3>
            </CardHeader>
            <CardContent className="p-4">
              {/* Heat Map */}
              <HeatMapCalendar userId={userId} />

              {/* Achievement Badges */}
              <div className="mt-4">
                <p className="text-[12px] font-bold text-[var(--text-primary)] mb-3">
                  Unlocked Badges
                </p>
                {achievements && achievements.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement._id}
                        className="p-4 bg-gradient-to-br from-[var(--accent-light)] to-[var(--primary-light)] border border-[var(--border)] rounded-xl text-center"
                      >
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <p className="text-[13px] font-bold text-[var(--text-primary)] mb-1">
                          {achievement.displayName}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] mb-2">
                          {achievement.description}
                        </p>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold ${
                          achievement.tier === 'platinum' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' :
                          achievement.tier === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                          achievement.tier === 'silver' ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                          'bg-gradient-to-r from-orange-600 to-orange-700 text-white'
                        }`}>
                          {achievement.tier.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[13px] text-[var(--text-secondary)]">
                      Complete your first workout to unlock achievements!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Code Card */}
        {userProfile?.userCode && (
          <Card>
            <CardHeader className="p-4 border-b border-[var(--border)]">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-[var(--accent)]" />
                Your Buddy Code
              </h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="p-5 bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] border-2 border-[var(--primary)]/20 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold mb-2">
                  Share This Code
                </p>
                <p className="text-3xl font-black font-mono tracking-wider text-[var(--primary)] mb-3">
                  {userProfile.userCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userProfile.userCode!);
                    notify({ type: 'success', message: 'Code copied to clipboard!' });
                  }}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-bold text-[13px] hover:bg-[var(--primary-hover)] transition-all active:scale-95"
                >
                  Copy Code
                </button>
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] text-center mt-3">
                Share this code with friends to become workout buddies!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Section Divider - Settings */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--background-primary)] px-4 text-[11px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">
              Settings & Details
            </span>
          </div>
        </div>

        {/* Collapsible Training Preferences */}
        {userProfile?.trainingPreferences && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <button
              onClick={() => setShowTrainingPrefs(!showTrainingPrefs)}
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
            >
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {t('profile.trainingPreferences')}
              </h3>
              <svg
                className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${showTrainingPrefs ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTrainingPrefs && (
              <div className="px-4 pb-4 border-t border-[var(--border)] pt-4 space-y-2.5">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                  {t('profile.primaryGoal')}
                </p>
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                  {userProfile.trainingPreferences.primary_goal}
                </p>
                {userProfile.trainingPreferences.goal_explanation && (
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 italic">
                    "{userProfile.trainingPreferences.goal_explanation}"
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                    {t('profile.experience')}
                  </p>
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                    {userProfile.trainingPreferences.experience_level}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                    {t('profile.frequency')}
                  </p>
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                    {t('profile.daysPerWeek', { days: userProfile.trainingPreferences.training_frequency })}
                  </p>
                </div>
              </div>
              
              {userProfile.trainingPreferences.pain_points.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                    {t('profile.painPoints')}
                  </p>
                  <p className="text-[13px] text-[var(--text-primary)]">
                    {userProfile.trainingPreferences.pain_points.join(', ')}
                  </p>
                </div>
              )}
              
              {userProfile.trainingPreferences.sport && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                    {t('profile.sport')}
                  </p>
                  <p className="text-[13px] text-[var(--text-primary)]">
                    {userProfile.trainingPreferences.sport}
                  </p>
                </div>
              )}
              
              {userProfile.trainingPreferences.additional_notes && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                    {t('profile.additionalNotes')}
                  </p>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    {userProfile.trainingPreferences.additional_notes}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-[var(--text-tertiary)] mt-3 pt-3 border-t border-[var(--border)]">
                {t('profile.lastUpdated', { date: new Date(userProfile.trainingPreferences.last_updated).toLocaleDateString() })}
              </p>
            </div>
            )}
          </div>
        )}

        {/* Collapsible Injury Profile */}
        {userId && fullUserData?.injuryProfile && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <button
              onClick={() => setShowInjuryProfile(!showInjuryProfile)}
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
            >
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Injury Profile
              </h3>
              <svg
                className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${showInjuryProfile ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showInjuryProfile && (
              <div className="border-t border-[var(--border)]">
                <InjuryProfile
                  userId={userId}
                  injuryProfile={fullUserData?.injuryProfile}
                />
              </div>
            )}
          </div>
        )}

        {/* Combined Settings Section */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">
            Settings
          </h3>

          {/* Plan Management */}
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">
              Plan Management
            </p>
            <button
              onClick={handleCreateNewPlan}
              className="w-full py-3 rounded-lg font-semibold text-[13px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all shadow-card"
            >
              {t('profile.createNewPlan')}
            </button>
          </div>

          {/* App Preferences */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">
              Preferences
            </p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{t('profile.notificationSettings')}</span>
                <span className="text-[var(--text-tertiary)]">→</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{t('profile.units')}</span>
                <span className="text-[var(--text-tertiary)]">→</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{t('profile.exportData')}</span>
                <span className="text-[var(--text-tertiary)]">→</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Photo Capture Dialog */}
      {userId && (
        <PhotoCaptureDialog
          userId={userId}
          isOpen={isPhotoCaptureOpen}
          onClose={() => setIsPhotoCaptureOpen(false)}
          onPhotoUploaded={() => {
            // Refresh will happen automatically via Convex reactivity
            notify({ type: 'success', message: 'Photo uploaded successfully!' });
          }}
        />
      )}

      {/* View All Photos Modal */}
      {viewAllPhotos && userId && (
        <div
          className="fixed inset-0 z-50 bg-[var(--background-primary)] overflow-y-auto animate-fade-in"
          onClick={() => setViewAllPhotos(false)}
        >
          <div
            className="min-h-screen p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--background-primary)]/95 backdrop-blur-sm py-4 z-10 border-b border-[var(--border)]">
              <h2 className="text-[20px] font-bold text-[var(--text-primary)]">
                All Progress Photos
              </h2>
              <button
                onClick={() => setViewAllPhotos(false)}
                className="p-2 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-primary)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo Timeline */}
            <div className="max-w-6xl mx-auto">
              <PhotoTimeline userId={userId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
