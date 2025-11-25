import { useQuery, useMutation } from "convex/react";
import { useUser } from '@clerk/clerk-react';
import { api } from "../convex/_generated/api";
import { WorkoutPlan } from '../types';
import { Id } from "../convex/_generated/dataModel";
import { saveExercisesFromExtractedList } from '../services/exerciseDatabaseService';
import useUserProfile from './useUserProfile';

export default function useWorkoutPlan() {
    const { user } = useUser();
    const userId = user?.id || null;
    const { userProfile } = useUserProfile();
    
    const allPlans = useQuery(
        api.queries.getWorkoutPlans,
        userId ? { userId } : "skip"
    );
    const activePlan = useQuery(
        api.queries.getActivePlan,
        userId ? { userId } : "skip"
    );
    const createPlanMutation = useMutation(api.mutations.createWorkoutPlan);
    const updatePlanMutation = useMutation(api.mutations.updateWorkoutPlan);
    const deletePlanMutation = useMutation(api.mutations.deleteWorkoutPlan);
    const setActivePlanMutation = useMutation(api.mutations.setActivePlan);
    const cacheExerciseMutation = useMutation(api.mutations.cacheExerciseExplanation);
    const updateSportBucketMutation = useMutation(api.sportBucketMutations.updateSportBucket);
    const incrementPlanUsageMutation = useMutation(api.mutations.incrementPlanUsage);

    const setActivePlan = async (planId: Id<"workoutPlans">) => {
        if (!userId) return;
        
        try {
            await setActivePlanMutation({ userId, planId });
        } catch (error) {
            console.error("Error setting active plan:", error);
        }
    };

    // Normalize plan data to ensure it matches Convex schema exactly
    // This creates a clean structure that matches Convex validators precisely
    const normalizePlanForConvex = (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => {
        return {
            name: plan.name,
            weeklyPlan: plan.weeklyPlan.map(day => ({
                day_of_week: day.day_of_week,
                focus: day.focus,
                notes: day.notes !== undefined && day.notes !== null ? day.notes : null,
                blocks: day.blocks.map(block => {
                    // Normalize exercises first
                    const exercises = block.exercises.map(ex => {
                        const exercise: any = {
                            exercise_name: ex.exercise_name,
                            category: ex.category,
                            metrics_template: ex.metrics_template,
                            notes: ex.notes !== undefined && ex.notes !== null ? ex.notes : null,
                            original_exercise_name: (ex as any).original_exercise_name !== undefined && (ex as any).original_exercise_name !== null 
                                ? (ex as any).original_exercise_name 
                                : null,
                            rpe: (ex as any).rpe !== undefined && (ex as any).rpe !== null ? (ex as any).rpe : null,
                        };
                        return exercise;
                    });
                    
                    // Build block based on type
                    const baseBlock: any = {
                        type: block.type,
                        title: (block as any).title !== undefined && (block as any).title !== null ? (block as any).title : null,
                        exercises: exercises,
                    };
                    
                    // Add type-specific fields
                    if (block.type === 'superset') {
                        baseBlock.rounds = (block as any).rounds;
                    } else if (block.type === 'amrap') {
                        baseBlock.duration_minutes = (block as any).duration_minutes;
                    }
                    
                    return baseBlock;
                })
            })),
            dailyRoutine: plan.dailyRoutine || null,
        };
    };

    const addPlan = async (newPlanData: Omit<WorkoutPlan, 'id' | 'createdAt'>) => {
        if (!userId) return;
        
        try {
            // Normalize the plan to ensure schema compliance - single normalization pass
            const normalizedPlan = normalizePlanForConvex(newPlanData);
            
            // Debug: Log first block structure to verify it matches schema
            if (normalizedPlan.weeklyPlan[0]?.blocks[0]) {
                console.log("First block structure:", JSON.stringify(normalizedPlan.weeklyPlan[0].blocks[0], null, 2));
            }
            
            const result = await createPlanMutation({
                userId,
                name: normalizedPlan.name,
                weeklyPlan: normalizedPlan.weeklyPlan as any,
                dailyRoutine: normalizedPlan.dailyRoutine || undefined,
            });

            // Track plan generation for rate limiting
            await incrementPlanUsageMutation({ userId });

            // Extract exercises is now done server-side - use the returned exercises
            const planId = result.planId;
            const extractedExercises = result.extractedExercises || [];
            
            // After plan is saved, save all exercises to database with explanations
            // This builds the exercise database over time
            // Run in background (don't block plan creation)
            const planWithId: WorkoutPlan = {
                ...normalizedPlan,
                id: planId,
                createdAt: new Date().toISOString(),
            };
            
            // Save exercises asynchronously using server-extracted list (FASTER - no client-side extraction)
            if (extractedExercises.length > 0) {
                saveExercisesFromExtractedList(extractedExercises, cacheExerciseMutation).catch(error => {
                    console.error("Failed to save exercises to database:", error);
                    // Don't throw - plan creation succeeded, exercise saving is bonus
                });
            }
            
            // Save to sport buckets if user has sport-specific training
            if (userProfile?.trainingPreferences?.sport_specific && userId) {
                savePlanToSportBuckets(planWithId, userProfile.trainingPreferences.sport_specific).catch(error => {
                    console.error("Failed to save to sport buckets:", error);
                    // Don't throw - this is optional optimization
                });
            }
            
            // Plan is automatically set as active when created
            return planId;
        } catch (error) {
            console.error("Error adding new plan:", error);
            // Log the normalized plan structure for debugging
            try {
                const normalizedPlan = normalizePlanForConvex(newPlanData);
                console.error("Normalized plan structure:", JSON.stringify(normalizedPlan.weeklyPlan[0]?.blocks[0], null, 2));
            } catch (e) {
                console.error("Could not log normalized plan:", e);
            }
            throw error; // Re-throw so caller can handle it
        }
    };
    
    // Save plan exercises to sport buckets for intelligent selection
    const savePlanToSportBuckets = async (plan: WorkoutPlan, sport: string) => {
        if (!userId) return;
        
        for (const day of plan.weeklyPlan) {
            for (const block of day.blocks) {
                for (const exercise of block.exercises) {
                    try {
                        await updateSportBucketMutation({
                            sport,
                            exercise_name: exercise.exercise_name,
                            category: exercise.category || 'main',
                            placement: exercise.category || 'main',
                            userId,
                        });
                    } catch (error) {
                        console.error(`Failed to save ${exercise.exercise_name} to sport bucket:`, error);
                        // Continue with other exercises
                    }
                }
            }
        }
    };
    
    const updatePlan = async (updatedPlan: WorkoutPlan) => {
        if (!updatedPlan.id || !userId) return;
        
        try {
            await updatePlanMutation({
                userId,
                planId: updatedPlan.id as Id<"workoutPlans">,
                name: updatedPlan.name,
                weeklyPlan: updatedPlan.weeklyPlan,
                dailyRoutine: updatedPlan.dailyRoutine || undefined,
            });
        } catch(error) {
            console.error("Error updating plan:", error);
        }
    };

    const deletePlan = async (planId: Id<"workoutPlans">) => {
        if (!userId) return;
        
        try {
            await deletePlanMutation({ userId, planId });
        } catch (error) {
            console.error("Error deleting plan:", error);
        }
    };

    // Convert Convex plans to WorkoutPlan format
    const plans: WorkoutPlan[] | null = allPlans ? allPlans.map(plan => ({
        id: plan._id,
        name: plan.name,
        weeklyPlan: plan.weeklyPlan,
        dailyRoutine: plan.dailyRoutine || undefined,
        createdAt: plan.createdAt,
    })) : null;

    const activePlanFormatted: WorkoutPlan | null = activePlan ? {
        id: activePlan._id,
        name: activePlan.name,
        weeklyPlan: activePlan.weeklyPlan,
        dailyRoutine: activePlan.dailyRoutine || undefined,
        createdAt: activePlan.createdAt,
    } : null;

    const planLoaded = (allPlans !== undefined && activePlan !== undefined) || !userId;

    return { 
        allPlans: plans, 
        activePlan: activePlanFormatted, 
        addPlan, 
        updatePlan, 
        deletePlan, 
        setActivePlan, 
        planLoaded 
    };
}
