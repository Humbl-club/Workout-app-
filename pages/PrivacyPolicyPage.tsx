import React from 'react';
import { cn } from '../lib/utils';
import { ChevronLeftIcon } from '../components/icons';

/* ═══════════════════════════════════════════════════════════════
   PRIVACY POLICY PAGE

   Required for App Store submission.
   Explains data collection, usage, and user rights.
   ═══════════════════════════════════════════════════════════════ */

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-default)]">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[var(--brand-primary)] min-h-[44px] min-w-[44px]"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">Last updated: December 2, 2025</p>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">1. Information We Collect</h2>
            <p className="mb-3">REBLD collects the following information to provide personalized workout plans:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Account Information:</strong> Email address, name (via Clerk authentication)</li>
              <li><strong>Fitness Data:</strong> Goals, experience level, training preferences, pain points</li>
              <li><strong>Workout Logs:</strong> Exercises completed, sets, reps, weights, dates</li>
              <li><strong>Body Metrics:</strong> Weight, height, measurements (optional)</li>
              <li><strong>Progress Photos:</strong> Images you upload for progress tracking (optional)</li>
              <li><strong>Device Information:</strong> Device type, OS version, app version</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Generate personalized AI workout plans based on your goals and preferences</li>
              <li>Track your workout progress and provide analytics</li>
              <li>Send workout reminders and streak notifications (if enabled)</li>
              <li>Improve our AI recommendations based on anonymized usage patterns</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">3. Data Storage & Security</h2>
            <p className="mb-3">Your data is stored securely using industry-standard encryption:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Authentication handled by Clerk (SOC 2 compliant)</li>
              <li>Data stored in Convex (encrypted at rest and in transit)</li>
              <li>AI processing via Google Gemini (data not stored after processing)</li>
              <li>Progress photos stored securely with access controls</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">4. Data Sharing</h2>
            <p className="mb-3">We do NOT sell your personal data. We may share data with:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Service Providers:</strong> Clerk (auth), Convex (database), Google (AI)</li>
              <li><strong>Workout Buddies:</strong> If you choose to connect with friends, limited workout stats are shared</li>
              <li><strong>Legal Requirements:</strong> If required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">5. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access your personal data</li>
              <li>Export your workout data</li>
              <li>Delete your account and all associated data</li>
              <li>Opt out of analytics and tracking</li>
              <li>Update or correct your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">6. Children's Privacy</h2>
            <p>REBLD is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">7. Changes to This Policy</h2>
            <p>We may update this policy periodically. We will notify you of significant changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">8. Contact Us</h2>
            <p>Questions about this policy? Contact us at:</p>
            <p className="mt-2 text-[var(--brand-primary)]">privacy@rebld.app</p>
          </section>
        </div>
      </main>
    </div>
  );
}
