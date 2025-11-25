import React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, SparklesIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading: boolean;
  content: string | null;
  error: string | null;
  showAcceptButton?: boolean;
  onAccept?: () => void;
}

/**
 * Parse markdown-style text into React components (XSS-safe)
 * Renders text with preserved formatting without HTML injection
 */
const parseMarkdown = (text: string | null): React.ReactNode => {
    if (!text) return null;

    // Split by lines to handle list items and paragraphs
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
        // Handle list items
        if (line.trim().startsWith('- ')) {
            elements.push(
                <li key={idx} className="ml-4 list-disc">
                    {line.substring(2)}
                </li>
            );
        } else if (line.trim()) {
            // Handle regular text (no HTML injection, just plain text)
            elements.push(
                <p key={idx} className="mb-2">
                    {line}
                </p>
            );
        }
    });

    return <>{elements}</>;
};

export default function AnalysisModal({
  isOpen,
  onClose,
  title,
  isLoading,
  content,
  error,
  showAcceptButton = false,
  onAccept,
}: AnalysisModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
          <svg className="animate-spin h-10 w-10 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-stone-400">{t('chat.analyzing')}</p>
        </div>
      );
    }
    if (error) {
        return (
             <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center" role="alert">
                <XCircleIcon className="w-6 h-6 mr-3 text-red-400 flex-shrink-0"/>
                <div>
                    <strong className="font-bold">{t('errors.analysisFailed')} </strong>
                    <span className="block sm:inline text-sm">{error}</span>
                </div>
            </div>
        )
    }
    if (content) {
        return (
            <div className="prose prose-invert max-w-none prose-strong:font-semibold">
              {parseMarkdown(content)}
            </div>
        )
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-50 w-full max-w-2xl flex flex-col bg-stone-900/80 border border-stone-700 backdrop-blur-xl rounded-2xl shadow-2xl max-h-[80vh]">
        <header className="flex items-center justify-between p-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:bg-stone-800 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
        
        {(showAcceptButton && onAccept && !isLoading && !error) && (
            <footer className="p-4 border-t border-stone-800 flex justify-end">
                <button 
                    onClick={onAccept}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-semibold rounded-lg shadow-sm text-black bg-white hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-white"
                >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Accept & Replace
                </button>
            </footer>
        )}
      </div>
    </div>
  );
}