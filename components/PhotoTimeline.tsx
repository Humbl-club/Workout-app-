import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import ProgressPhotoCard from './ProgressPhotoCard';
import { Card, CardContent } from './ui/card';
import { SparklesIcon } from './icons';

// Filter icon
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);

// Empty state icon
const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

interface PhotoTimelineProps {
  userId: string;
  onPhotoClick?: (photoId: string) => void;
}

type PhotoFilter = 'all' | 'front' | 'side' | 'back';

export default function PhotoTimeline({ userId, onPhotoClick }: PhotoTimelineProps) {
  const [filter, setFilter] = useState<PhotoFilter>('all');

  // Fetch all progress photos
  const allPhotos = useQuery(api.photoQueries.getUserProgressPhotos, {
    userId,
    limit: 50
  });

  // Filter photos based on selected type
  const filteredPhotos = allPhotos?.filter(photo => {
    if (filter === 'all') return true;
    return photo.photoType === filter;
  }) || [];

  const isLoading = allPhotos === undefined;

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[var(--text-primary)]">
            Progress Photos
          </h2>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PhotoFilter)}
            className="px-3 py-1.5 text-[12px] font-semibold bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          >
            <option value="all">All</option>
            <option value="front">Front</option>
            <option value="side">Side</option>
            <option value="back">Back</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-[var(--surface-secondary)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPhotos.length === 0 && (
        <Card className="border-2 border-dashed border-[var(--border)]">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-[var(--text-tertiary)]" />
              </div>
              <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">
                No progress photos yet
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
                {filter === 'all'
                  ? 'Upload your first progress photo to start tracking your transformation journey!'
                  : `No ${filter} view photos yet. Try uploading one or select a different view.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Grid */}
      {!isLoading && filteredPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPhotos.map((photo) => (
            <ProgressPhotoCard
              key={photo._id}
              photoUrl={photo.photoUrl}
              photoType={photo.photoType}
              date={photo.date}
              aiAnalysis={photo.aiAnalysis}
              onClick={() => onPhotoClick?.(photo._id)}
            />
          ))}
        </div>
      )}

      {/* Stats Footer (if photos exist) */}
      {!isLoading && filteredPhotos.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-[var(--accent-light)] to-[var(--primary-light)] border border-[var(--accent)]/20 rounded-xl">
          <div className="flex items-start gap-2">
            <SparklesIcon className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-[var(--text-primary)] mb-1">
                Track Your Transformation
              </p>
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                Keep uploading photos to track your progress over time. AI analysis helps you understand changes in body composition and provides personalized training recommendations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
