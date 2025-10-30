import React, { useState, FormEvent } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { LogoIcon, XCircleIcon } from '../components/icons';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged in App.tsx will handle the rest
    } catch (err) {
      const authError = err as any;
      switch (authError.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid credentials. Please check your email and password.');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/weak-password':
            setError('Password should be at least 6 characters.');
            break;
        case 'auth/operation-not-allowed':
             setError("Sign-in method is not enabled. Please check your Firebase project's Authentication settings.");
             console.error("Firebase Auth Error: Email/Password sign-in method is not enabled in the Firebase console.");
             break;
        case 'auth/invalid-api-key':
             setError("Invalid API key. Please check your Firebase configuration.");
             break;
         case 'auth/network-request-failed':
             setError("Network error. Please check your internet connection.");
             break;
        default:
          console.error("Authentication error:", authError);
          setError('An unexpected error occurred. Please try again.');
          break;
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-stone-950 overflow-hidden relative">
        <div className="absolute inset-0 bg-radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(160,140,220,0.2),rgba(255,255,255,0)) -z-10"></div>
        <div className="relative w-full max-w-sm p-8 space-y-8 bg-stone-800/50 border border-stone-700 rounded-3xl shadow-2xl backdrop-blur-lg animate-scale-in-center">
            <div className="text-center">
                <LogoIcon className="mx-auto text-6xl text-white animate-fade-in-down-custom" style={{ animationDelay: '200ms' }} />
                <p className="mt-4 text-lg text-stone-300 font-semibold animate-fade-in-custom" style={{ animationDelay: '400ms' }}>
                    Rebuild. Reshape. Renew.
                </p>
            </div>

            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="animate-fade-in-up-custom" style={{ animationDelay: '500ms' }}>
                        <label htmlFor="email" className="sr-only">
                        Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full px-5 py-3 text-lg text-white bg-stone-800/50 rounded-xl border border-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition"
                        />
                    </div>

                    <div className="animate-fade-in-up-custom" style={{ animationDelay: '600ms' }}>
                        <label htmlFor="password"className="sr-only">
                        Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                           className="w-full px-5 py-3 text-lg text-white bg-stone-800/50 rounded-xl border border-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition"
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center animate-fade-in-custom" role="alert">
                            <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 text-red-400"/>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="animate-fade-in-up-custom" style={{ animationDelay: '700ms' }}>
                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                        {loading ? (
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-base text-stone-400 animate-fade-in-custom" style={{ animationDelay: '800ms' }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-semibold text-red-400 hover:text-red-500 hover:underline focus:outline-none">
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
}