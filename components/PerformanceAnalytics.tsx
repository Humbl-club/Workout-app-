import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartBarIcon, TrophyIcon, FireIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTranslation } from 'react-i18next';

interface PerformanceAnalyticsProps {
    userId: string;
    sport?: string | null;
}

export default function PerformanceAnalytics({ userId, sport }: PerformanceAnalyticsProps) {
    const { t } = useTranslation();

    // Get sport bucket statistics
    const sportStats = useQuery(
        api.sportBucketQueries.getSportBucketStats,
        sport ? { sport } : "skip"
    );

    // Get top performing exercises
    const topExercises = useQuery(
        api.sportBucketQueries.getSportBucketExercises,
        sport ? { sport, minScore: 80, minUsageCount: 3 } : "skip"
    );

    if (!sport || !sportStats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5" />
                        {t('analytics.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('analytics.selectSport')}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    {sport.replace(/_/g, ' ').charAt(0).toUpperCase() + sport.slice(1).replace(/_/g, ' ')} {t('analytics.performance')}
                </CardTitle>
                <CardDescription>
                    {t('analytics.basedOn', { count: sportStats.totalUsage })}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overview Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold">{sportStats.totalExercises}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('analytics.metrics.exercisesUsed')}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold">{Math.round(sportStats.avgPerformanceScore)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('analytics.metrics.avgScore')}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold">{sportStats.totalUsage}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('analytics.metrics.totalSets')}</p>
                    </div>
                </div>

                {/* Top Performers */}
                {sportStats.highPerformers.length > 0 && (
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <TrophyIcon className="w-4 h-4 text-yellow-500" />
                            {t('analytics.topPerforming')}
                        </h4>
                        <div className="space-y-2">
                            {sportStats.highPerformers.slice(0, 5).map((exercise, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpIcon className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium">
                                            {exercise.exercise_name.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{Math.round(exercise.score)}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {exercise.usage_count} uses
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Exercises to Improve */}
                {sportStats.lowPerformers.length > 0 && (
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <FireIcon className="w-4 h-4 text-orange-500" />
                            Needs Improvement
                        </h4>
                        <div className="space-y-2">
                            {sportStats.lowPerformers.slice(0, 3).map((exercise, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <ArrowDownIcon className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-medium">
                                            {exercise.exercise_name.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{Math.round(exercise.score)}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {exercise.usage_count} uses
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Category Distribution */}
                <div>
                    <h4 className="font-semibold mb-2">Exercise Distribution</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Warmup</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${sportStats.categoryDistribution.warmup}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">
                                    {Math.round(sportStats.categoryDistribution.warmup)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Main</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{ width: `${sportStats.categoryDistribution.main}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">
                                    {Math.round(sportStats.categoryDistribution.main)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Cooldown</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${sportStats.categoryDistribution.cooldown}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">
                                    {Math.round(sportStats.categoryDistribution.cooldown)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
