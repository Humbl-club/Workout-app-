import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { XMarkIcon, PlusIcon, ExclamationTriangleIcon } from './icons';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { notify } from './layout/Toast';
import { useTranslation } from 'react-i18next';

interface InjuryProfileProps {
    userId: string;
    injuryProfile?: {
        current_injuries: Array<{
            injury_type: string;
            severity: 'mild' | 'moderate' | 'severe';
            affected_area: string;
            date_reported: string;
            notes: string | null;
        }>;
        injury_history: Array<{
            injury_type: string;
            date_occurred: string;
            date_recovered: string | null;
            recurring: boolean;
        }>;
        movement_restrictions: string[];
        pain_triggers: string[];
        last_updated: string;
    };
}

// Injury types with translation keys
const getCommonInjuries = (t: any) => [
    { type: 'knee_pain', area: 'Knees', label: t('injury.common.kneePain') },
    { type: 'lower_back', area: 'Lower Back', label: t('injury.common.lowerBack') },
    { type: 'shoulder_impingement', area: 'Shoulders', label: t('injury.common.shoulderImpingement') },
    { type: 'elbow_tendinitis', area: 'Elbows', label: t('injury.common.elbowPain') },
    { type: 'hip_pain', area: 'Hips', label: t('injury.common.hipPain') },
    { type: 'ankle_instability', area: 'Ankles', label: t('injury.common.anklePain') },
    { type: 'wrist_pain', area: 'Wrists', label: t('injury.common.wristPain') },
    { type: 'neck_strain', area: 'Neck', label: t('injury.common.neckStrain') },
];

export default function InjuryProfile({ userId, injuryProfile }: InjuryProfileProps) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [newInjury, setNewInjury] = useState({
        injury_type: '',
        severity: 'mild' as 'mild' | 'moderate' | 'severe',
        affected_area: '',
        notes: '',
    });

    const updateInjuryProfileMutation = useMutation(api.sportBucketMutations.updateUserInjuryProfile);

    const currentInjuries = injuryProfile?.current_injuries || [];
    const COMMON_INJURIES = getCommonInjuries(t);
    
    const handleAddInjury = async () => {
        if (!newInjury.injury_type || !newInjury.affected_area) {
            notify({ type: 'error', message: 'Please select an injury type' });
            return;
        }
        
        try {
            await updateInjuryProfileMutation({
                userId,
                injuryProfile: {
                    current_injuries: [
                        ...currentInjuries,
                        {
                            ...newInjury,
                            date_reported: new Date().toISOString(),
                            notes: newInjury.notes || null,
                        }
                    ],
                    injury_history: injuryProfile?.injury_history || [],
                    movement_restrictions: injuryProfile?.movement_restrictions || [],
                    pain_triggers: injuryProfile?.pain_triggers || [],
                }
            });
            
            notify({ type: 'success', message: 'Injury added. Exercises will be adjusted accordingly.' });
            setNewInjury({ injury_type: '', severity: 'mild', affected_area: '', notes: '' });
            setIsEditing(false);
        } catch (error) {
            notify({ type: 'error', message: 'Failed to update injury profile' });
        }
    };
    
    const handleRemoveInjury = async (index: number) => {
        try {
            const updatedInjuries = currentInjuries.filter((_, i) => i !== index);
            
            await updateInjuryProfileMutation({
                userId,
                injuryProfile: {
                    current_injuries: updatedInjuries,
                    injury_history: injuryProfile?.injury_history || [],
                    movement_restrictions: injuryProfile?.movement_restrictions || [],
                    pain_triggers: injuryProfile?.pain_triggers || [],
                }
            });
            
            notify({ type: 'success', message: 'Injury removed' });
        } catch (error) {
            notify({ type: 'error', message: 'Failed to remove injury' });
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                    {t('injury.title')}
                </CardTitle>
                <CardDescription>
                    {t('injury.description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Injuries */}
                {currentInjuries.length > 0 && (
                    <div className="space-y-2">
                        {currentInjuries.map((injury, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                                <div>
                                    <p className="font-medium">{injury.affected_area}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {injury.injury_type.replace(/_/g, ' ')} - {injury.severity}
                                    </p>
                                    {injury.notes && (
                                        <p className="text-xs text-gray-500 mt-1">{injury.notes}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleRemoveInjury(index)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-800/20 rounded"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Add Injury Form */}
                {isEditing ? (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <select
                            value={newInjury.injury_type}
                            onChange={(e) => {
                                const injury = COMMON_INJURIES.find(i => i.type === e.target.value);
                                setNewInjury({
                                    ...newInjury,
                                    injury_type: e.target.value,
                                    affected_area: injury?.area || '',
                                });
                            }}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value="">{t('injury.selectInjury')}</option>
                            {COMMON_INJURIES.map(injury => (
                                <option key={injury.type} value={injury.type}>
                                    {injury.label}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setNewInjury({ ...newInjury, severity: 'mild' })}
                                className={`flex-1 py-2 px-3 rounded ${newInjury.severity === 'mild' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                {t('injury.severity.mild')}
                            </button>
                            <button
                                onClick={() => setNewInjury({ ...newInjury, severity: 'moderate' })}
                                className={`flex-1 py-2 px-3 rounded ${newInjury.severity === 'moderate' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                {t('injury.severity.moderate')}
                            </button>
                            <button
                                onClick={() => setNewInjury({ ...newInjury, severity: 'severe' })}
                                className={`flex-1 py-2 px-3 rounded ${newInjury.severity === 'severe' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                {t('injury.severity.severe')}
                            </button>
                        </div>

                        <textarea
                            value={newInjury.notes}
                            onChange={(e) => setNewInjury({ ...newInjury, notes: e.target.value })}
                            placeholder={t('injury.notesPlaceholder')}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            rows={2}
                        />

                        <div className="flex gap-2">
                            <Button
                                onClick={handleAddInjury}
                                className="flex-1"
                            >
                                {t('injury.addInjury')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="w-full"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        {t('injury.addInjury')}
                    </Button>
                )}

                {/* Info Message */}
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {t('injury.message')}
                </p>
            </CardContent>
        </Card>
    );
}
