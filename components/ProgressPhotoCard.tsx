import React from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { SparklesIcon, CalendarIcon } from './icons';

// Target/Bullseye icon for body fat estimate
const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Muscle/Bicep icon
const MuscleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

// Trophy/Improvement icon
const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);

// Lightbulb/Suggestion icon
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

interface ProgressPhotoCardProps {
  photoUrl: string;
  photoType: 'front' | 'side' | 'back';
  date: string;
  aiAnalysis?: {
    bodyFatEstimate: number;
    muscleChanges: string;
    improvements: string[];
    suggestions: string[];
    confidence: number;
  };
  onClick?: () => void;
  key?: React.Key;
}

export default function ProgressPhotoCard({
  photoUrl,
  photoType,
  date,
  aiAnalysis,
  onClick
}: ProgressPhotoCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-[var(--success)]';
    if (confidence >= 60) return 'text-[var(--accent)]';
    return 'text-[var(--text-secondary)]';
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={onClick}
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={photoUrl}
          alt={`${photoType} progress photo`}
          className="w-full h-full object-cover"
        />

        {/* Photo Type Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">
            {photoType}
          </p>
        </div>

        {/* Date Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-white" />
          <p className="text-[11px] font-semibold text-white">
            {formattedDate}
          </p>
        </div>

        {/* AI Analysis Badge (if available) */}
        {aiAnalysis && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] backdrop-blur-sm rounded-full flex items-center gap-1.5 shadow-lg">
            <SparklesIcon className="w-3.5 h-3.5 text-white" />
            <p className="text-[11px] font-bold text-white">
              AI Analyzed
            </p>
          </div>
        )}
      </div>

      {/* Analysis Summary */}
      {aiAnalysis && (
        <CardContent className="p-4 space-y-3">
          {/* Body Fat Estimate */}
          <div className="p-3 bg-gradient-to-br from-[var(--primary-light)] to-transparent rounded-xl border border-[var(--primary)]/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-[var(--primary)]" />
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
                  Body Fat Estimate
                </p>
              </div>
              <p className={`text-[10px] font-semibold ${getConfidenceColor(aiAnalysis.confidence)}`}>
                {aiAnalysis.confidence}% confident
              </p>
            </div>
            <p className="text-2xl font-black text-[var(--primary)]">
              ~{aiAnalysis.bodyFatEstimate}%
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              (Approximate)
            </p>
          </div>

          {/* Muscle Changes */}
          <div className="p-3 bg-[var(--surface-secondary)] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MuscleIcon className="w-4 h-4 text-[var(--accent)]" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
                Muscle Changes
              </p>
            </div>
            <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">
              {aiAnalysis.muscleChanges}
            </p>
          </div>

          {/* Improvements */}
          {aiAnalysis.improvements.length > 0 && (
            <div className="p-3 bg-gradient-to-br from-[var(--success-light)] to-transparent rounded-xl border border-[var(--success)]/20">
              <div className="flex items-center gap-2 mb-2">
                <TrophyIcon className="w-4 h-4 text-[var(--success)]" />
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
                  Improvements
                </p>
              </div>
              <ul className="space-y-1.5">
                {aiAnalysis.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[var(--success)] text-[12px] mt-0.5">✓</span>
                    <span className="text-[12px] text-[var(--text-primary)] leading-relaxed">
                      {improvement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {aiAnalysis.suggestions.length > 0 && (
            <div className="p-3 bg-gradient-to-br from-[var(--accent-light)] to-transparent rounded-xl border border-[var(--accent)]/20">
              <div className="flex items-center gap-2 mb-2">
                <LightbulbIcon className="w-4 h-4 text-[var(--accent)]" />
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
                  Suggestions
                </p>
              </div>
              <ul className="space-y-1.5">
                {aiAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[var(--accent)] text-[12px] mt-0.5">→</span>
                    <span className="text-[12px] text-[var(--text-primary)] leading-relaxed">
                      {suggestion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-[var(--warning-light)] border border-[var(--accent)]/20 rounded-xl">
            <p className="text-[11px] text-[var(--text-primary)]">
              <strong>Note:</strong> Body fat estimate is approximate based on visual analysis.
              For medical-grade measurements, consult a professional.
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">
              Analysis confidence: {aiAnalysis.confidence}%
            </p>
          </div>
        </CardContent>
      )}

      {/* No Analysis State */}
      {!aiAnalysis && (
        <CardContent className="p-4">
          <div className="text-center py-2">
            <p className="text-[13px] text-[var(--text-secondary)]">
              No AI analysis available
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
