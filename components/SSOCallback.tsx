import { useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';

/* ═══════════════════════════════════════════════════════════════
   SSO CALLBACK - OAuth Redirect Handler

   Handles the redirect from OAuth providers (Google, Apple).
   Completes the sign-in flow and redirects to home.
   ═══════════════════════════════════════════════════════════════ */

export default function SSOCallback() {
  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // First try to complete sign-in
        if (signIn?.status === 'complete') {
          await setActive({ session: signIn.createdSessionId });
          return;
        }

        // If sign-in didn't work, try sign-up (for new users via OAuth)
        if (signUp?.status === 'complete') {
          await setSignUpActive({ session: signUp.createdSessionId });
          return;
        }
      } catch (error) {
        console.error('SSO callback error:', error);
      }
    };

    handleCallback();
  }, [signIn, signUp, setActive, setSignUpActive]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-4xl font-black tracking-tight mb-4">
          <span className="text-[var(--text-primary)]">RE</span>
          <span className="text-[var(--brand-primary)]">BLD</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
          <span className="text-[var(--text-secondary)] text-sm">Signing you in...</span>
        </div>
      </div>
    </div>
  );
}
