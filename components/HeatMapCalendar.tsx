import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Card, CardHeader, CardContent } from './ui/card';
import { cn } from '../lib/utils';

interface HeatMapCalendarProps {
  userId: string;
}

export default function HeatMapCalendar({ userId }: HeatMapCalendarProps) {
  const heatMapData = useQuery(
    api.achievementQueries.getHeatMapData,
    { userId }
  );

  if (!heatMapData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 bg-[var(--surface-secondary)] rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const getIntensityColor = (intensity: number, completed: boolean) => {
    if (!completed) return 'bg-[var(--surface-secondary)]';

    if (intensity >= 75) return 'bg-gradient-to-br from-[var(--accent-strength)] to-[var(--accent-power)]';
    if (intensity >= 50) return 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)]';
    return 'bg-gradient-to-br from-[var(--success)] to-[var(--accent-recovery)]';
  };

  // Group by weeks (4 weeks = 28 days)
  const weeks: typeof heatMapData[][] = [];
  for (let i = 0; i < 4; i++) {
    weeks.push(heatMapData.slice(i * 7, (i + 1) * 7));
  }

  return (
    <Card>
      <CardHeader className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
            Last 28 Days
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)]">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-[var(--surface-secondary)]" />
              <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[var(--success)] to-[var(--accent-recovery)]" />
              <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)]" />
              <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[var(--accent-strength)] to-[var(--accent-power)]" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-1.5">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1.5">
              {week.map((day, dayIndex) => {
                const date = new Date(day.date);
                const isToday = day.date === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "flex-1 aspect-square rounded-lg transition-all cursor-pointer group relative",
                      getIntensityColor(day.intensity, day.completed),
                      isToday && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]"
                    )}
                    title={`${date.toLocaleDateString()}: ${day.completed ? `${day.exerciseCount} exercises, ${day.volume.toFixed(0)}kg` : 'Rest day'}`}
                  >
                    {day.completed && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[10px] font-bold drop-shadow-lg">
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Day labels */}
        <div className="flex gap-1.5 mt-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-[var(--text-tertiary)] font-bold">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="text-center">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">
              Total
            </p>
            <p className="text-[18px] font-black text-[var(--primary)]">
              {heatMapData.filter(d => d.completed).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">
              This Week
            </p>
            <p className="text-[18px] font-black text-[var(--accent)]">
              {heatMapData.slice(-7).filter(d => d.completed).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">
              Volume
            </p>
            <p className="text-[18px] font-black text-[var(--success)]">
              {(heatMapData.reduce((sum, d) => sum + d.volume, 0) / 1000).toFixed(1)}t
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
