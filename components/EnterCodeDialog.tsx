import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { XMarkIcon, UsersIcon } from './icons';
import { cn } from '../lib/utils';

interface EnterCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeEntered: (code: string) => void;
}

export default function EnterCodeDialog({ isOpen, onClose, onCodeEntered }: EnterCodeDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setError('Please enter a share code');
      return;
    }

    if (!cleanCode.startsWith('REBLD-')) {
      setError('Invalid code format. Should be REBLD-XXXXXX');
      return;
    }

    onCodeEntered(cleanCode);
    setCode('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-md shadow-elevated animate-scale-in">
        <CardHeader className="border-b border-[var(--border)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[var(--text-primary)]">
                  Join Workout Buddy
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Enter share code
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-all"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form onSubmit={handleSubmit}>
            {/* Info */}
            <div className="mb-4 p-3 bg-[var(--surface-secondary)] rounded-xl">
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                Enter the code your workout buddy shared with you to follow the same plan.
              </p>
            </div>

            {/* Input */}
            <div className="mb-4">
              <label className="text-label mb-2 block">
                Share Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="REBLD-ABC123"
                className="w-full h-14 px-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl text-[18px] font-mono font-bold text-[var(--text-primary)] uppercase focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:outline-none transition-all placeholder:text-[var(--text-tertiary)] placeholder:normal-case"
                autoFocus
              />
              {error && (
                <p className="text-[12px] text-[var(--error)] mt-2">
                  {error}
                </p>
              )}
            </div>

            {/* Example */}
            <div className="mb-6 text-center">
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Format: REBLD-XXXXXX (6 characters)
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="accent"
              className="w-full h-14"
              disabled={!code.trim()}
            >
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
