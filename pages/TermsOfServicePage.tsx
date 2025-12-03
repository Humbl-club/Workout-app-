import React from 'react';
import { cn } from '../lib/utils';
import { ChevronLeftIcon } from '../components/icons';

/* ═══════════════════════════════════════════════════════════════
   TERMS OF SERVICE PAGE

   Required for App Store submission.
   Outlines usage terms, disclaimers, and user responsibilities.
   ═══════════════════════════════════════════════════════════════ */

interface TermsOfServicePageProps {
  onBack: () => void;
}

export default function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
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
        <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">Last updated: December 2, 2025</p>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">1. Acceptance of Terms</h2>
            <p>By downloading, installing, or using REBLD ("the App"), you agree to be bound by these Terms of Service. If you do not agree, do not use the App.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">2. Description of Service</h2>
            <p>REBLD is an AI-powered fitness application that provides:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li>Personalized workout plan generation</li>
              <li>Workout tracking and logging</li>
              <li>Progress analytics and visualizations</li>
              <li>AI coaching and exercise guidance</li>
              <li>Social features (workout buddies, plan sharing)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">3. Health Disclaimer</h2>
            <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4">
              <p className="font-semibold text-[var(--text-primary)] mb-2">IMPORTANT:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>REBLD is NOT a substitute for professional medical advice, diagnosis, or treatment.</li>
                <li>Always consult a physician before starting any exercise program.</li>
                <li>If you experience pain, dizziness, or discomfort during exercise, stop immediately and seek medical attention.</li>
                <li>AI-generated workout plans are suggestions only. Use your judgment and listen to your body.</li>
                <li>We are not responsible for injuries resulting from following workout plans.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">4. User Responsibilities</h2>
            <p className="mb-3">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Provide accurate information about your fitness level and health conditions</li>
              <li>Use the App responsibly and within your physical capabilities</li>
              <li>Not share your account credentials with others</li>
              <li>Not use the App for any illegal purposes</li>
              <li>Not attempt to reverse-engineer or exploit the App</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">5. Intellectual Property</h2>
            <p>All content, features, and functionality of REBLD (including AI-generated workout plans) are owned by REBLD and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">6. AI-Generated Content</h2>
            <p className="mb-3">REBLD uses artificial intelligence to generate workout plans and coaching advice:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>AI recommendations are based on general fitness principles and your inputs</li>
              <li>AI cannot account for all individual health conditions</li>
              <li>You are responsible for evaluating whether exercises are appropriate for you</li>
              <li>We continuously improve our AI but cannot guarantee perfection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">7. Subscription & Payments</h2>
            <p>REBLD may offer premium features via subscription. By subscribing, you agree to the pricing and billing terms displayed at purchase. Subscriptions auto-renew unless cancelled 24 hours before the renewal date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">8. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, REBLD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO PERSONAL INJURY, LOST PROFITS, OR DATA LOSS.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the App at any time for violation of these terms. You may delete your account at any time through the App settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">10. Changes to Terms</h2>
            <p>We may modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">11. Contact</h2>
            <p>Questions about these terms? Contact us at:</p>
            <p className="mt-2 text-[var(--brand-primary)]">legal@rebld.app</p>
          </section>
        </div>
      </main>
    </div>
  );
}
