/**
 * Comprehensive Sport-Specific Training Database
 *
 * Each sport includes:
 * - Primary focus areas and training emphases
 * - Top exercises ranked by importance
 * - Mobility requirements
 * - Core/stability work
 * - Conditioning protocols
 * - Weekly structure recommendations
 * - Exercises to avoid
 * - Periodization notes
 */

export interface SportTrainingProtocol {
  sport: string;
  displayName: string;
  category: 'combat' | 'endurance' | 'strength' | 'team' | 'racquet' | 'outdoor' | 'aesthetic' | 'functional';

  // Training focus breakdown (should sum to 100)
  focusDistribution: {
    strength: number;      // Max strength, compound lifts
    power: number;         // Explosive movements, plyometrics
    hypertrophy: number;   // Muscle building
    endurance: number;     // Cardiovascular, muscular endurance
    mobility: number;      // Flexibility, range of motion
    skill: number;         // Sport-specific technique work
  };

  // Primary movement patterns to emphasize
  movementPriorities: {
    pattern: string;
    frequencyPerWeek: string;
    notes: string;
  }[];

  // Top exercises ranked by importance (S-tier = essential, A-tier = highly beneficial)
  topExercises: {
    tier: 'S' | 'A' | 'B';
    name: string;
    setsReps: string;
    notes: string;
  }[];

  // Required mobility work
  mobilityWork: {
    area: string;
    exercises: string[];
    durationMinutes: number;
    frequency: string;
  }[];

  // Core/stability requirements
  coreWork: {
    type: string;
    exercises: string[];
    priority: 'essential' | 'important' | 'beneficial';
  }[];

  // Conditioning protocols
  conditioning: {
    type: string;
    protocol: string;
    frequencyPerWeek: number;
    duration: string;
  }[];

  // Exercises to avoid or modify
  contraindications: {
    exercise: string;
    reason: string;
    alternative: string;
  }[];

  // Weekly structure recommendation
  weeklyTemplate: {
    daysPerWeek: number;
    structure: string[];
    notes: string;
  };

  // Periodization approach
  periodization: {
    phase: string;
    duration: string;
    focus: string;
  }[];

  // Calorie/nutrition notes specific to sport
  nutritionNotes: string[];
}

export const SPORT_TRAINING_DATABASE: SportTrainingProtocol[] = [
  // ==================== COMBAT SPORTS ====================
  {
    sport: 'boxing',
    displayName: 'Boxing',
    category: 'combat',
    focusDistribution: {
      strength: 15,
      power: 25,
      hypertrophy: 10,
      endurance: 30,
      mobility: 10,
      skill: 10,
    },
    movementPriorities: [
      { pattern: 'Rotational Power', frequencyPerWeek: '3-4x', notes: 'Core of punching power - medicine ball throws, cable rotations' },
      { pattern: 'Hip Hinge', frequencyPerWeek: '2x', notes: 'Power generation from ground up' },
      { pattern: 'Push (Horizontal)', frequencyPerWeek: '2x', notes: 'Punch extension strength' },
      { pattern: 'Core Anti-Rotation', frequencyPerWeek: '4x', notes: 'Absorbing body shots, maintaining guard' },
      { pattern: 'Conditioning', frequencyPerWeek: '4-5x', notes: 'High-intensity intervals mimicking round structure' },
    ],
    topExercises: [
      { tier: 'S', name: 'Medicine Ball Rotational Throw', setsReps: '4x6 each side', notes: 'Explosive rotational power' },
      { tier: 'S', name: 'Heavy Bag Work', setsReps: '3-5 rounds x 3min', notes: 'Sport-specific power endurance' },
      { tier: 'S', name: 'Landmine Rotational Press', setsReps: '3x8 each side', notes: 'Rotational pushing power' },
      { tier: 'A', name: 'Cable Woodchop', setsReps: '3x12 each side', notes: 'Controlled rotational strength' },
      { tier: 'A', name: 'Box Jump', setsReps: '4x5', notes: 'Lower body explosiveness' },
      { tier: 'A', name: 'Sled Push', setsReps: '6x20m', notes: 'Leg drive conditioning' },
      { tier: 'A', name: 'Battle Ropes', setsReps: '30s on/30s off x 8', notes: 'Shoulder endurance, grip' },
      { tier: 'B', name: 'Pallof Press', setsReps: '3x10 each side', notes: 'Core anti-rotation' },
      { tier: 'B', name: 'Plank Variations', setsReps: '3x30-45s', notes: 'Core stability under fatigue' },
      { tier: 'B', name: 'Dumbbell Shoulder Press', setsReps: '3x10', notes: 'Shoulder stability' },
    ],
    mobilityWork: [
      { area: 'Thoracic Spine', exercises: ['T-Spine Rotation', 'Cat-Cow', 'Thread the Needle'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Hips', exercises: ['Hip 90/90', 'Hip Circles', 'Deep Squat Hold'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Shoulders', exercises: ['Shoulder CARs', 'Wall Slides', 'Band Pull-Aparts'], durationMinutes: 5, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Anti-Rotation', exercises: ['Pallof Press', 'Dead Bug', 'Bird Dog'], priority: 'essential' },
      { type: 'Rotational Power', exercises: ['Russian Twist', 'Cable Rotation', 'Med Ball Slam'], priority: 'essential' },
      { type: 'Stability', exercises: ['Plank', 'Side Plank', 'Hollow Body Hold'], priority: 'important' },
    ],
    conditioning: [
      { type: 'Interval Training', protocol: '3min work / 1min rest (mimics rounds)', frequencyPerWeek: 3, duration: '20-30min' },
      { type: 'Heavy Bag Rounds', protocol: '3min rounds, focus on output', frequencyPerWeek: 4, duration: '15-25min' },
      { type: 'Jump Rope', protocol: 'Continuous 10-15min', frequencyPerWeek: 5, duration: '10-15min' },
    ],
    contraindications: [
      { exercise: 'Heavy Barbell Bench Press', reason: 'Can create shoulder tightness affecting guard', alternative: 'Push-ups, Landmine Press' },
      { exercise: 'Heavy Bicep Curls', reason: 'Can limit arm extension speed', alternative: 'Light curls with speed focus' },
    ],
    weeklyTemplate: {
      daysPerWeek: 5,
      structure: [
        'Day 1: Power + Conditioning',
        'Day 2: Skill/Bag Work',
        'Day 3: Strength + Core',
        'Day 4: Active Recovery/Mobility',
        'Day 5: Conditioning + Bag Work',
      ],
      notes: 'Avoid heavy lifting 48h before sparring',
    },
    periodization: [
      { phase: 'Base Building', duration: '4-6 weeks', focus: 'Aerobic base, movement quality' },
      { phase: 'Strength', duration: '4 weeks', focus: 'Max strength, power development' },
      { phase: 'Fight Camp', duration: '6-8 weeks', focus: 'Sport-specific conditioning, skill' },
      { phase: 'Taper', duration: '1-2 weeks', focus: 'Reduce volume, maintain intensity' },
    ],
    nutritionNotes: [
      'Weight management crucial - may need weight cuts',
      'High protein for recovery: 1.6-2.0g/kg',
      'Carb timing around training sessions',
      'Hydration critical for performance',
    ],
  },

  {
    sport: 'mma',
    displayName: 'Mixed Martial Arts',
    category: 'combat',
    focusDistribution: {
      strength: 20,
      power: 20,
      hypertrophy: 10,
      endurance: 30,
      mobility: 10,
      skill: 10,
    },
    movementPriorities: [
      { pattern: 'Grappling Strength', frequencyPerWeek: '3x', notes: 'Pulling, grip work for clinch and ground' },
      { pattern: 'Rotational Power', frequencyPerWeek: '3x', notes: 'Strikes and throws' },
      { pattern: 'Hip Hinge', frequencyPerWeek: '2x', notes: 'Takedown power, sprawl strength' },
      { pattern: 'Pushing', frequencyPerWeek: '2x', notes: 'Frame creation, ground escapes' },
      { pattern: 'Conditioning', frequencyPerWeek: '4-5x', notes: 'Mixed energy system work' },
    ],
    topExercises: [
      { tier: 'S', name: 'Turkish Get-Up', setsReps: '3x3 each side', notes: 'Full-body strength, ground-to-standing' },
      { tier: 'S', name: 'Rope Climb', setsReps: '3-5 climbs', notes: 'Pulling strength, grip endurance' },
      { tier: 'S', name: 'Wrestling Drills', setsReps: '5-10min rounds', notes: 'Sport-specific conditioning' },
      { tier: 'A', name: 'Deadlift', setsReps: '4x5', notes: 'Posterior chain strength' },
      { tier: 'A', name: 'Kettlebell Swing', setsReps: '5x15', notes: 'Hip power, conditioning' },
      { tier: 'A', name: 'Pull-ups (weighted)', setsReps: '4x8', notes: 'Pulling strength for grappling' },
      { tier: 'A', name: 'Medicine Ball Slam', setsReps: '4x8', notes: 'Ground and pound power' },
      { tier: 'B', name: 'Farmer Carries', setsReps: '4x40m', notes: 'Grip, core stability' },
      { tier: 'B', name: 'Sprawl to Box Jump', setsReps: '3x8', notes: 'Defensive transitions' },
    ],
    mobilityWork: [
      { area: 'Hips', exercises: ['Hip 90/90', 'Pigeon Stretch', 'Frog Stretch'], durationMinutes: 8, frequency: 'Daily' },
      { area: 'Thoracic Spine', exercises: ['T-Spine Rotation', 'Foam Roll', 'Cat-Cow'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Neck', exercises: ['Neck CARs', 'Light Neck Bridges'], durationMinutes: 3, frequency: '3x/week' },
    ],
    coreWork: [
      { type: 'Anti-Extension', exercises: ['Dead Bug', 'Ab Wheel', 'Body Saw'], priority: 'essential' },
      { type: 'Rotational', exercises: ['Pallof Press', 'Russian Twist', 'Cable Rotation'], priority: 'essential' },
      { type: 'Hip Flexor Strength', exercises: ['Hanging Leg Raise', 'V-Ups'], priority: 'important' },
    ],
    conditioning: [
      { type: 'MMA Intervals', protocol: '5min rounds / 1min rest', frequencyPerWeek: 3, duration: '25min' },
      { type: 'Grappling Cardio', protocol: 'Flow rolling 6x5min', frequencyPerWeek: 3, duration: '30min' },
      { type: 'Assault Bike', protocol: '30s sprint / 30s rest x 10', frequencyPerWeek: 2, duration: '10min' },
    ],
    contraindications: [
      { exercise: 'Heavy Overhead Press', reason: 'Shoulder impingement risk from grappling', alternative: 'Landmine Press, Push Press' },
    ],
    weeklyTemplate: {
      daysPerWeek: 5,
      structure: [
        'Day 1: Strength (Lower emphasis)',
        'Day 2: MMA Skill Training',
        'Day 3: Power + Conditioning',
        'Day 4: MMA Skill Training',
        'Day 5: Strength (Upper emphasis) + Grip',
      ],
      notes: 'Coordinate with skill training to manage fatigue',
    },
    periodization: [
      { phase: 'GPP', duration: '4-6 weeks', focus: 'General fitness, movement quality' },
      { phase: 'Strength', duration: '4 weeks', focus: 'Max strength development' },
      { phase: 'Fight Prep', duration: '8-10 weeks', focus: 'Sport-specific, weight management' },
    ],
    nutritionNotes: [
      'Weight cuts common - work with nutritionist',
      'High protein: 1.8-2.2g/kg bodyweight',
      'Periodize carbs based on training load',
    ],
  },

  // ==================== ENDURANCE SPORTS ====================
  {
    sport: 'hyrox',
    displayName: 'HYROX',
    category: 'functional',
    focusDistribution: {
      strength: 15,
      power: 10,
      hypertrophy: 5,
      endurance: 55,
      mobility: 10,
      skill: 5,
    },
    movementPriorities: [
      { pattern: 'Running Economy', frequencyPerWeek: '4-5x', notes: 'Base of HYROX - run between stations' },
      { pattern: 'Sled Work', frequencyPerWeek: '2-3x', notes: 'Push AND pull - competition stations' },
      { pattern: 'Functional Pushing', frequencyPerWeek: '2x', notes: 'Wall balls, burpees' },
      { pattern: 'Hip Hinge', frequencyPerWeek: '2x', notes: 'Lunges, step-ups with weight' },
      { pattern: 'Grip/Carry', frequencyPerWeek: '2x', notes: 'Farmer carries, sandbag lunges' },
    ],
    topExercises: [
      { tier: 'S', name: 'Sled Push', setsReps: '8x25m (competition distance)', notes: 'Competition station - exact format' },
      { tier: 'S', name: 'Sled Pull', setsReps: '8x25m', notes: 'Competition station' },
      { tier: 'S', name: 'Wall Ball', setsReps: '100 reps for time', notes: '6/9kg ball to 3m target' },
      { tier: 'S', name: 'SkiErg', setsReps: '1000m for time', notes: 'Competition station' },
      { tier: 'S', name: 'Rowing', setsReps: '1000m for time', notes: 'Competition station' },
      { tier: 'A', name: 'Burpee Broad Jump', setsReps: '80m for time', notes: 'Competition station' },
      { tier: 'A', name: 'Weighted Lunges', setsReps: '100m with 24kg', notes: 'Sandbag lunges station' },
      { tier: 'A', name: 'Farmer Carry', setsReps: '200m with 24kg each hand', notes: 'Competition station' },
      { tier: 'B', name: 'Tempo Runs', setsReps: '5-10km at race pace', notes: 'Running between stations' },
      { tier: 'B', name: 'Air Bike Intervals', setsReps: '30/30 x 10', notes: 'Conditioning transfer' },
    ],
    mobilityWork: [
      { area: 'Hips', exercises: ['Hip Flexor Stretch', 'Pigeon', '90/90'], durationMinutes: 8, frequency: 'Daily' },
      { area: 'Ankles', exercises: ['Ankle Circles', 'Wall Ankle Stretch'], durationMinutes: 3, frequency: 'Daily' },
      { area: 'Thoracic Spine', exercises: ['T-Spine Rotation', 'Cat-Cow'], durationMinutes: 4, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Anti-Extension', exercises: ['Dead Bug', 'Plank'], priority: 'essential' },
      { type: 'Endurance Core', exercises: ['Hollow Body Hold', 'Plank Shoulder Taps'], priority: 'essential' },
      { type: 'Rotational Stability', exercises: ['Pallof Press', 'Bird Dog'], priority: 'important' },
    ],
    conditioning: [
      { type: 'HYROX Simulation', protocol: 'Full or half race simulation', frequencyPerWeek: 1, duration: '60-90min' },
      { type: 'Run Intervals', protocol: '8x400m at race pace', frequencyPerWeek: 2, duration: '30min' },
      { type: 'Station Practice', protocol: '2-3 stations back-to-back', frequencyPerWeek: 3, duration: '20-30min' },
    ],
    contraindications: [
      { exercise: 'Heavy Back Squats', reason: 'Recovery demand vs endurance needs', alternative: 'Goblet Squats, Weighted Lunges' },
      { exercise: 'Isolated Arm Work', reason: 'Time better spent on functional movements', alternative: 'Farmer Carries' },
    ],
    weeklyTemplate: {
      daysPerWeek: 5,
      structure: [
        'Day 1: Running + 2 Stations',
        'Day 2: Strength (full body)',
        'Day 3: Long Run (easy pace)',
        'Day 4: Intervals + 2 Stations',
        'Day 5: Race Simulation (partial or full)',
      ],
      notes: 'Build up to full race simulations over 8-12 weeks',
    },
    periodization: [
      { phase: 'Base Building', duration: '4-6 weeks', focus: 'Aerobic base, station technique' },
      { phase: 'Build', duration: '6-8 weeks', focus: 'Increase intensity, race pace work' },
      { phase: 'Peak', duration: '2-3 weeks', focus: 'Race simulations, taper' },
    ],
    nutritionNotes: [
      'High carb needs for endurance: 5-7g/kg on training days',
      'Race day nutrition: practice in training',
      'Hydration strategy crucial',
      'Calorie needs: TDEE + 300-500 on heavy days',
    ],
  },

  {
    sport: 'marathon',
    displayName: 'Marathon Running',
    category: 'endurance',
    focusDistribution: {
      strength: 10,
      power: 5,
      hypertrophy: 0,
      endurance: 70,
      mobility: 10,
      skill: 5,
    },
    movementPriorities: [
      { pattern: 'Running', frequencyPerWeek: '5-6x', notes: 'Primary training modality' },
      { pattern: 'Single Leg Strength', frequencyPerWeek: '2x', notes: 'Injury prevention, running economy' },
      { pattern: 'Hip Stability', frequencyPerWeek: '3x', notes: 'Glute activation, pelvis control' },
      { pattern: 'Core Endurance', frequencyPerWeek: '3-4x', notes: 'Maintain form under fatigue' },
    ],
    topExercises: [
      { tier: 'S', name: 'Single Leg Romanian Deadlift', setsReps: '3x10 each', notes: 'Posterior chain, balance' },
      { tier: 'S', name: 'Bulgarian Split Squat', setsReps: '3x10 each', notes: 'Single leg strength' },
      { tier: 'S', name: 'Calf Raises', setsReps: '3x15-20', notes: 'Push-off strength' },
      { tier: 'A', name: 'Glute Bridge (single leg)', setsReps: '3x12 each', notes: 'Glute activation' },
      { tier: 'A', name: 'Side Plank', setsReps: '3x30s each', notes: 'Hip stability' },
      { tier: 'A', name: 'Step Ups', setsReps: '3x12 each', notes: 'Functional strength' },
      { tier: 'B', name: 'Banded Clamshells', setsReps: '3x15 each', notes: 'Hip stability' },
      { tier: 'B', name: 'Dead Bug', setsReps: '3x10 each', notes: 'Core control' },
    ],
    mobilityWork: [
      { area: 'Hip Flexors', exercises: ['Couch Stretch', 'Half Kneeling Hip Flexor'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Calves/Ankles', exercises: ['Calf Stretch', 'Ankle Circles'], durationMinutes: 3, frequency: 'Daily' },
      { area: 'IT Band/Glutes', exercises: ['Foam Roll IT Band', 'Pigeon Stretch'], durationMinutes: 5, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Anti-Rotation', exercises: ['Pallof Press', 'Bird Dog'], priority: 'essential' },
      { type: 'Anti-Extension', exercises: ['Dead Bug', 'Plank'], priority: 'essential' },
      { type: 'Hip Stability', exercises: ['Side Plank', 'Clamshells'], priority: 'essential' },
    ],
    conditioning: [
      { type: 'Long Run', protocol: '60-150min easy pace', frequencyPerWeek: 1, duration: '60-150min' },
      { type: 'Tempo Run', protocol: '20-40min at marathon pace', frequencyPerWeek: 1, duration: '40-60min' },
      { type: 'Intervals', protocol: '6-10x1000m', frequencyPerWeek: 1, duration: '45min' },
      { type: 'Easy Runs', protocol: 'Conversational pace', frequencyPerWeek: 3, duration: '30-45min' },
    ],
    contraindications: [
      { exercise: 'Heavy Squats', reason: 'Fatigue interferes with running', alternative: 'Bodyweight or light goblet squats' },
      { exercise: 'High Volume Upper Body', reason: 'Unnecessary mass', alternative: 'Minimal maintenance work' },
    ],
    weeklyTemplate: {
      daysPerWeek: 6,
      structure: [
        'Day 1: Easy Run + Strength',
        'Day 2: Intervals',
        'Day 3: Easy Run + Mobility',
        'Day 4: Tempo Run',
        'Day 5: Rest or Cross-train',
        'Day 6: Long Run',
      ],
      notes: '80/20 rule: 80% easy, 20% hard',
    },
    periodization: [
      { phase: 'Base', duration: '8-12 weeks', focus: 'Build weekly mileage gradually' },
      { phase: 'Build', duration: '6-8 weeks', focus: 'Increase intensity, marathon pace work' },
      { phase: 'Peak', duration: '3 weeks', focus: 'Race-specific workouts' },
      { phase: 'Taper', duration: '2-3 weeks', focus: 'Reduce volume, maintain intensity' },
    ],
    nutritionNotes: [
      'Carb loading before race: 8-10g/kg',
      'Training: 5-7g/kg carbs',
      'Moderate protein: 1.4-1.6g/kg',
      'Practice race nutrition in long runs',
    ],
  },

  {
    sport: 'triathlon',
    displayName: 'Triathlon',
    category: 'endurance',
    focusDistribution: {
      strength: 10,
      power: 5,
      hypertrophy: 0,
      endurance: 70,
      mobility: 10,
      skill: 5,
    },
    movementPriorities: [
      { pattern: 'Swimming Technique', frequencyPerWeek: '3-4x', notes: 'Swim is often the limiter' },
      { pattern: 'Cycling Endurance', frequencyPerWeek: '3-4x', notes: 'Bike is longest segment' },
      { pattern: 'Running Economy', frequencyPerWeek: '3-4x', notes: 'Run off the bike' },
      { pattern: 'Single Leg Strength', frequencyPerWeek: '2x', notes: 'Injury prevention' },
    ],
    topExercises: [
      { tier: 'S', name: 'Pull-ups/Lat Pulldown', setsReps: '3x10', notes: 'Swim pulling strength' },
      { tier: 'S', name: 'Single Leg Press', setsReps: '3x12 each', notes: 'Cycling power' },
      { tier: 'S', name: 'Romanian Deadlift', setsReps: '3x10', notes: 'Posterior chain' },
      { tier: 'A', name: 'Plank', setsReps: '3x45-60s', notes: 'Core for all three sports' },
      { tier: 'A', name: 'Shoulder External Rotation', setsReps: '3x15', notes: 'Swim injury prevention' },
      { tier: 'A', name: 'Calf Raises', setsReps: '3x15', notes: 'Run push-off' },
      { tier: 'B', name: 'Push-ups', setsReps: '3x15', notes: 'Upper body maintenance' },
    ],
    mobilityWork: [
      { area: 'Shoulders', exercises: ['Shoulder CARs', 'Wall Angels', 'Pec Stretch'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Hips', exercises: ['Hip Flexor Stretch', '90/90', 'Pigeon'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Thoracic Spine', exercises: ['T-Spine Rotation', 'Foam Roll'], durationMinutes: 3, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Stability', exercises: ['Plank', 'Side Plank', 'Superman'], priority: 'essential' },
      { type: 'Anti-Rotation', exercises: ['Pallof Press', 'Dead Bug'], priority: 'important' },
    ],
    conditioning: [
      { type: 'Swim', protocol: 'Technique + intervals', frequencyPerWeek: 3, duration: '45-60min' },
      { type: 'Bike', protocol: 'Endurance + intervals', frequencyPerWeek: 3, duration: '60-180min' },
      { type: 'Run', protocol: 'Easy + tempo/intervals', frequencyPerWeek: 3, duration: '30-90min' },
      { type: 'Brick', protocol: 'Bike-to-run transitions', frequencyPerWeek: 1, duration: '90min+' },
    ],
    contraindications: [
      { exercise: 'Heavy Upper Body', reason: 'Swim shoulder health', alternative: 'Light, high rep work' },
      { exercise: 'High Volume Squats', reason: 'Interferes with cycling/running', alternative: 'Single leg work' },
    ],
    weeklyTemplate: {
      daysPerWeek: 6,
      structure: [
        'Day 1: Swim AM + Bike PM',
        'Day 2: Run + Strength',
        'Day 3: Swim + Easy Bike',
        'Day 4: Key Run (tempo/intervals)',
        'Day 5: Swim + Recovery',
        'Day 6: Long Bike + Short Run (Brick)',
      ],
      notes: 'Manage training load across three sports',
    },
    periodization: [
      { phase: 'Base', duration: '8-12 weeks', focus: 'Build volume in all three sports' },
      { phase: 'Build', duration: '8 weeks', focus: 'Race-specific intensity' },
      { phase: 'Peak', duration: '2-3 weeks', focus: 'Race simulations' },
      { phase: 'Taper', duration: '2 weeks', focus: 'Reduce volume significantly' },
    ],
    nutritionNotes: [
      'High carb needs: 6-10g/kg depending on phase',
      'Race nutrition practice critical',
      'Hydration planning for all three sports',
    ],
  },

  // ==================== STRENGTH SPORTS ====================
  {
    sport: 'powerlifting',
    displayName: 'Powerlifting',
    category: 'strength',
    focusDistribution: {
      strength: 60,
      power: 15,
      hypertrophy: 15,
      endurance: 0,
      mobility: 5,
      skill: 5,
    },
    movementPriorities: [
      { pattern: 'Squat', frequencyPerWeek: '2-4x', notes: 'Competition lift - priority #1' },
      { pattern: 'Bench Press', frequencyPerWeek: '2-4x', notes: 'Competition lift - priority #2' },
      { pattern: 'Deadlift', frequencyPerWeek: '1-2x', notes: 'Competition lift - high CNS demand' },
      { pattern: 'Accessory Work', frequencyPerWeek: '3-4x', notes: 'Support main lifts' },
    ],
    topExercises: [
      { tier: 'S', name: 'Competition Squat', setsReps: 'Per program', notes: 'High bar or low bar per preference' },
      { tier: 'S', name: 'Competition Bench', setsReps: 'Per program', notes: 'Pause at chest' },
      { tier: 'S', name: 'Competition Deadlift', setsReps: 'Per program', notes: 'Conventional or sumo' },
      { tier: 'A', name: 'Pause Squat', setsReps: '3x5 @70-80%', notes: 'Build out of hole strength' },
      { tier: 'A', name: 'Close Grip Bench', setsReps: '3x8', notes: 'Tricep strength, lockout' },
      { tier: 'A', name: 'Deficit Deadlift', setsReps: '3x5', notes: 'Improve off the floor' },
      { tier: 'A', name: 'Romanian Deadlift', setsReps: '3x8-10', notes: 'Hamstring/posterior chain' },
      { tier: 'B', name: 'Leg Press', setsReps: '3x10-15', notes: 'Quad volume without fatigue' },
      { tier: 'B', name: 'Dumbbell Row', setsReps: '3x12', notes: 'Upper back for bench stability' },
      { tier: 'B', name: 'Tricep Pushdown', setsReps: '3x15', notes: 'Lockout assistance' },
    ],
    mobilityWork: [
      { area: 'Hips', exercises: ['Hip Flexor Stretch', 'Pigeon', 'Adductor Stretch'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Thoracic Spine', exercises: ['Foam Roll T-Spine', 'Cat-Cow'], durationMinutes: 3, frequency: 'Before bench' },
      { area: 'Ankles', exercises: ['Ankle Mobility', 'Calf Stretch'], durationMinutes: 2, frequency: 'Before squat' },
    ],
    coreWork: [
      { type: 'Bracing', exercises: ['Plank', 'Dead Bug', 'Bird Dog'], priority: 'essential' },
      { type: 'Anti-Extension', exercises: ['Ab Wheel', 'Hanging Leg Raise'], priority: 'important' },
    ],
    conditioning: [
      { type: 'GPP', protocol: 'Sled drag, carry work', frequencyPerWeek: 2, duration: '15-20min' },
      { type: 'Active Recovery', protocol: 'Walking, light cycling', frequencyPerWeek: 2, duration: '20-30min' },
    ],
    contraindications: [
      { exercise: 'High Rep Conditioning', reason: 'Interferes with strength adaptation', alternative: 'Low intensity GPP' },
      { exercise: 'Olympic Lifts', reason: 'Different movement patterns', alternative: 'Pause variations' },
    ],
    weeklyTemplate: {
      daysPerWeek: 4,
      structure: [
        'Day 1: Squat + Squat Accessories',
        'Day 2: Bench + Upper Accessories',
        'Day 3: Deadlift + Back/Hamstrings',
        'Day 4: Bench Variation + Upper Volume',
      ],
      notes: 'Follow established program (5/3/1, GZCL, etc.)',
    },
    periodization: [
      { phase: 'Hypertrophy', duration: '4-6 weeks', focus: 'Higher volume, muscle building' },
      { phase: 'Strength', duration: '4-6 weeks', focus: 'Lower reps, higher intensity' },
      { phase: 'Peaking', duration: '2-4 weeks', focus: 'Competition prep, singles' },
      { phase: 'Deload/Transition', duration: '1-2 weeks', focus: 'Recovery' },
    ],
    nutritionNotes: [
      'Calorie surplus for strength gains',
      'High protein: 1.6-2.2g/kg',
      'May need weight cuts for competition',
      'Creatine highly beneficial',
    ],
  },

  {
    sport: 'bodybuilding',
    displayName: 'Bodybuilding',
    category: 'aesthetic',
    focusDistribution: {
      strength: 20,
      power: 0,
      hypertrophy: 65,
      endurance: 5,
      mobility: 5,
      skill: 5,
    },
    movementPriorities: [
      { pattern: 'Push (Horizontal + Vertical)', frequencyPerWeek: '2-3x', notes: 'Chest, shoulders, triceps' },
      { pattern: 'Pull (Horizontal + Vertical)', frequencyPerWeek: '2-3x', notes: 'Back, biceps, rear delts' },
      { pattern: 'Legs', frequencyPerWeek: '2x', notes: 'Quads, hamstrings, glutes' },
      { pattern: 'Isolation', frequencyPerWeek: 'Daily', notes: 'Bring up weak points' },
    ],
    topExercises: [
      { tier: 'S', name: 'Barbell Bench Press', setsReps: '4x8-12', notes: 'Chest mass builder' },
      { tier: 'S', name: 'Barbell Row', setsReps: '4x8-12', notes: 'Back thickness' },
      { tier: 'S', name: 'Squat', setsReps: '4x8-12', notes: 'Quad development' },
      { tier: 'S', name: 'Romanian Deadlift', setsReps: '4x10-12', notes: 'Hamstring/glute development' },
      { tier: 'A', name: 'Overhead Press', setsReps: '4x8-12', notes: 'Shoulder mass' },
      { tier: 'A', name: 'Lat Pulldown', setsReps: '4x10-12', notes: 'Back width' },
      { tier: 'A', name: 'Leg Press', setsReps: '4x12-15', notes: 'Quad volume' },
      { tier: 'A', name: 'Cable Fly', setsReps: '3x12-15', notes: 'Chest stretch/contraction' },
      { tier: 'B', name: 'Lateral Raise', setsReps: '4x15-20', notes: 'Side delt width' },
      { tier: 'B', name: 'Bicep Curl', setsReps: '4x10-15', notes: 'Arm size' },
      { tier: 'B', name: 'Tricep Extension', setsReps: '4x10-15', notes: 'Arm size' },
    ],
    mobilityWork: [
      { area: 'Shoulders', exercises: ['Shoulder Dislocates', 'Pec Stretch'], durationMinutes: 5, frequency: 'Push days' },
      { area: 'Hips', exercises: ['Hip Flexor Stretch', 'Glute Stretch'], durationMinutes: 5, frequency: 'Leg days' },
    ],
    coreWork: [
      { type: 'Stability', exercises: ['Plank', 'Cable Crunch', 'Hanging Leg Raise'], priority: 'important' },
      { type: 'Vacuum', exercises: ['Stomach Vacuum'], priority: 'important' },
    ],
    conditioning: [
      { type: 'LISS Cardio', protocol: 'Walking, low incline treadmill', frequencyPerWeek: 3, duration: '20-30min' },
      { type: 'Prep Phase Cardio', protocol: 'Increase cardio in cutting phase', frequencyPerWeek: 5, duration: '30-60min' },
    ],
    contraindications: [
      { exercise: 'Heavy Singles', reason: 'Injury risk vs hypertrophy benefit', alternative: 'Moderate weight, higher reps' },
      { exercise: 'CrossFit-style Metcons', reason: 'Interferes with recovery', alternative: 'LISS cardio' },
    ],
    weeklyTemplate: {
      daysPerWeek: 5,
      structure: [
        'Day 1: Push (Chest emphasis)',
        'Day 2: Pull (Back emphasis)',
        'Day 3: Legs (Quad emphasis)',
        'Day 4: Push (Shoulder emphasis)',
        'Day 5: Pull + Legs (Hamstring emphasis)',
      ],
      notes: 'Can use PPL, Upper/Lower, or Bro Split',
    },
    periodization: [
      { phase: 'Off-Season', duration: '6-9 months', focus: 'Muscle building, calorie surplus' },
      { phase: 'Pre-Contest', duration: '12-20 weeks', focus: 'Fat loss, maintain muscle' },
      { phase: 'Peak Week', duration: '1 week', focus: 'Water/carb manipulation' },
    ],
    nutritionNotes: [
      'Off-season: 300-500 calorie surplus',
      'Contest prep: 500-1000 calorie deficit',
      'High protein always: 2.0-2.5g/kg',
      'Carb cycling can be effective',
    ],
  },

  {
    sport: 'crossfit',
    displayName: 'CrossFit',
    category: 'functional',
    focusDistribution: {
      strength: 20,
      power: 20,
      hypertrophy: 5,
      endurance: 35,
      mobility: 10,
      skill: 10,
    },
    movementPriorities: [
      { pattern: 'Olympic Lifts', frequencyPerWeek: '3-4x', notes: 'Snatch, Clean & Jerk' },
      { pattern: 'Gymnastic Movements', frequencyPerWeek: '3-4x', notes: 'Pull-ups, muscle-ups, HSPU' },
      { pattern: 'Powerlifting', frequencyPerWeek: '2-3x', notes: 'Squat, deadlift, press' },
      { pattern: 'Metcon', frequencyPerWeek: '4-5x', notes: 'Mixed modal conditioning' },
    ],
    topExercises: [
      { tier: 'S', name: 'Snatch', setsReps: 'Per program', notes: 'Olympic lift - technical' },
      { tier: 'S', name: 'Clean & Jerk', setsReps: 'Per program', notes: 'Olympic lift - technical' },
      { tier: 'S', name: 'Kipping Pull-up', setsReps: 'For time/reps', notes: 'MetCon staple' },
      { tier: 'S', name: 'Thrusters', setsReps: 'For time/reps', notes: 'High output movement' },
      { tier: 'A', name: 'Bar Muscle-Up', setsReps: 'Skill work', notes: 'High-level gymnastics' },
      { tier: 'A', name: 'Box Jump', setsReps: 'For time/reps', notes: 'Power/conditioning' },
      { tier: 'A', name: 'Wall Ball', setsReps: 'For time/reps', notes: 'Legs and cardio' },
      { tier: 'A', name: 'Double Unders', setsReps: 'For time/reps', notes: 'Coordination/cardio' },
      { tier: 'B', name: 'Handstand Push-up', setsReps: 'For reps', notes: 'Pressing strength' },
      { tier: 'B', name: 'Rowing', setsReps: 'For cals/meters', notes: 'Cardio engine' },
    ],
    mobilityWork: [
      { area: 'Shoulders', exercises: ['Shoulder CARs', 'PVC Pass-throughs', 'Lat Stretch'], durationMinutes: 8, frequency: 'Daily' },
      { area: 'Hips', exercises: ['Hip CARs', 'Pigeon', 'Squat Hold'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Wrists', exercises: ['Wrist Circles', 'Wrist Stretch'], durationMinutes: 3, frequency: 'Before gymnastics' },
    ],
    coreWork: [
      { type: 'Hollow Body', exercises: ['Hollow Hold', 'Hollow Rock', 'V-Ups'], priority: 'essential' },
      { type: 'Stability', exercises: ['Plank', 'L-Sit', 'Toes to Bar'], priority: 'essential' },
    ],
    conditioning: [
      { type: 'Short MetCon', protocol: 'AMRAP/For Time 5-12min', frequencyPerWeek: 3, duration: '5-12min' },
      { type: 'Long MetCon', protocol: '15-30min workout', frequencyPerWeek: 2, duration: '15-30min' },
      { type: 'Monostructural', protocol: 'Row/bike/run intervals', frequencyPerWeek: 2, duration: '20min' },
    ],
    contraindications: [
      { exercise: 'Kipping without strict strength', reason: 'Injury risk', alternative: 'Build strict strength first' },
    ],
    weeklyTemplate: {
      daysPerWeek: 5,
      structure: [
        'Day 1: Strength + MetCon',
        'Day 2: Olympic Lifting + MetCon',
        'Day 3: Gymnastics Skill + MetCon',
        'Day 4: Active Recovery',
        'Day 5: Long MetCon or Competition Prep',
      ],
      notes: 'Follow gym programming or structured program',
    },
    periodization: [
      { phase: 'GPP', duration: '8-12 weeks', focus: 'Build base across all modalities' },
      { phase: 'Strength', duration: '4-6 weeks', focus: 'Emphasis on lifting numbers' },
      { phase: 'Competition Prep', duration: '6-8 weeks', focus: 'Sport-specific prep' },
    ],
    nutritionNotes: [
      'High carb needs: 5-7g/kg',
      'Protein: 1.6-2.0g/kg',
      'May need to eat more than expected',
      'Timing matters for performance',
    ],
  },

  // ==================== TEAM SPORTS ====================
  {
    sport: 'basketball',
    displayName: 'Basketball',
    category: 'team',
    focusDistribution: {
      strength: 15,
      power: 25,
      hypertrophy: 5,
      endurance: 25,
      mobility: 15,
      skill: 15,
    },
    movementPriorities: [
      { pattern: 'Vertical Power', frequencyPerWeek: '2-3x', notes: 'Jump training for rebounds/dunks' },
      { pattern: 'Lateral Movement', frequencyPerWeek: '3x', notes: 'Defense, cutting' },
      { pattern: 'Single Leg Strength', frequencyPerWeek: '2x', notes: 'Jump stability, injury prevention' },
      { pattern: 'Core Rotation', frequencyPerWeek: '2-3x', notes: 'Shooting, passing power' },
    ],
    topExercises: [
      { tier: 'S', name: 'Box Jump', setsReps: '4x5', notes: 'Vertical power' },
      { tier: 'S', name: 'Depth Jump', setsReps: '4x4', notes: 'Reactive power' },
      { tier: 'S', name: 'Trap Bar Deadlift', setsReps: '4x5', notes: 'Lower body power' },
      { tier: 'A', name: 'Bulgarian Split Squat', setsReps: '3x8 each', notes: 'Single leg strength' },
      { tier: 'A', name: 'Lateral Bound', setsReps: '3x6 each', notes: 'Lateral power' },
      { tier: 'A', name: 'Medicine Ball Rotational Throw', setsReps: '3x8 each', notes: 'Core power' },
      { tier: 'B', name: 'Nordic Hamstring Curl', setsReps: '3x6', notes: 'Hamstring injury prevention' },
      { tier: 'B', name: 'Calf Raise', setsReps: '3x15', notes: 'Achilles health, jumping' },
    ],
    mobilityWork: [
      { area: 'Hips', exercises: ['Hip 90/90', 'Hip Flexor Stretch', 'Adductor Stretch'], durationMinutes: 8, frequency: 'Daily' },
      { area: 'Ankles', exercises: ['Ankle Circles', 'Calf Stretch', 'Ankle Mobility'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Thoracic Spine', exercises: ['T-Spine Rotation', 'Cat-Cow'], durationMinutes: 4, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Anti-Rotation', exercises: ['Pallof Press', 'Cable Rotation'], priority: 'essential' },
      { type: 'Hip Stability', exercises: ['Copenhagen Plank', 'Side Plank'], priority: 'essential' },
      { type: 'Power', exercises: ['Med Ball Slam', 'Rotational Throw'], priority: 'important' },
    ],
    conditioning: [
      { type: 'Court Sprints', protocol: '17s (baseline to baseline)', frequencyPerWeek: 2, duration: '15min' },
      { type: 'Shuttle Runs', protocol: 'Lane agility drills', frequencyPerWeek: 2, duration: '10min' },
      { type: 'Tempo Runs', protocol: '300m at 80%', frequencyPerWeek: 1, duration: '20min' },
    ],
    contraindications: [
      { exercise: 'Heavy Overhead Press', reason: 'Shoulder impingement risk from shooting', alternative: 'Landmine Press' },
      { exercise: 'Heavy Back Squat', reason: 'Can affect jump performance', alternative: 'Trap Bar Deadlift' },
    ],
    weeklyTemplate: {
      daysPerWeek: 4,
      structure: [
        'Day 1: Power (Lower emphasis)',
        'Day 2: Skill Practice',
        'Day 3: Strength (Upper emphasis)',
        'Day 4: Conditioning + Agility',
      ],
      notes: 'In-season: reduce volume, maintain power',
    },
    periodization: [
      { phase: 'Off-season', duration: '8-12 weeks', focus: 'Build strength and power base' },
      { phase: 'Pre-season', duration: '4-6 weeks', focus: 'Sport-specific conditioning' },
      { phase: 'In-season', duration: 'Season length', focus: 'Maintenance, recovery focus' },
    ],
    nutritionNotes: [
      'Moderate carb: 4-6g/kg',
      'Protein: 1.6-2.0g/kg',
      'Hydration critical for performance',
      'Game day: lighter pre-game meal',
    ],
  },

  {
    sport: 'soccer',
    displayName: 'Soccer/Football',
    category: 'team',
    focusDistribution: {
      strength: 15,
      power: 20,
      hypertrophy: 5,
      endurance: 35,
      mobility: 15,
      skill: 10,
    },
    movementPriorities: [
      { pattern: 'Running/Sprinting', frequencyPerWeek: '4-5x', notes: 'Primary movement - 10km+ per game' },
      { pattern: 'Change of Direction', frequencyPerWeek: '3x', notes: 'Cutting, turning' },
      { pattern: 'Single Leg Strength', frequencyPerWeek: '2x', notes: 'Kicking, stability' },
      { pattern: 'Hip Mobility', frequencyPerWeek: 'Daily', notes: 'Prevent groin injuries' },
    ],
    topExercises: [
      { tier: 'S', name: 'Nordic Hamstring Curl', setsReps: '3x6', notes: 'Hamstring injury prevention' },
      { tier: 'S', name: 'Copenhagen Plank', setsReps: '3x10-15s each', notes: 'Adductor strength' },
      { tier: 'S', name: 'Single Leg Romanian Deadlift', setsReps: '3x8 each', notes: 'Posterior chain, balance' },
      { tier: 'A', name: 'Bulgarian Split Squat', setsReps: '3x8 each', notes: 'Single leg strength' },
      { tier: 'A', name: 'Box Jump', setsReps: '3x5', notes: 'Power for headers, sprints' },
      { tier: 'A', name: 'Lateral Lunge', setsReps: '3x8 each', notes: 'Lateral stability' },
      { tier: 'B', name: 'Hip Flexor Strengthening', setsReps: '3x10 each', notes: 'Kicking power' },
      { tier: 'B', name: 'Calf Raise', setsReps: '3x15', notes: 'Sprint power, achilles health' },
    ],
    mobilityWork: [
      { area: 'Hip Flexors', exercises: ['Couch Stretch', 'Hip Flexor Stretch'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Adductors', exercises: ['Adductor Stretch', 'Frog Stretch'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Hamstrings', exercises: ['Active Hamstring Stretch', 'Nordic prep'], durationMinutes: 3, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Anti-Rotation', exercises: ['Pallof Press', 'Dead Bug'], priority: 'essential' },
      { type: 'Hip Stability', exercises: ['Copenhagen Plank', 'Clamshells'], priority: 'essential' },
      { type: 'Power', exercises: ['Medicine Ball Throw'], priority: 'important' },
    ],
    conditioning: [
      { type: 'Interval Running', protocol: '6x400m at match pace', frequencyPerWeek: 2, duration: '25min' },
      { type: 'Small-sided Games', protocol: '4v4, 5v5 games', frequencyPerWeek: 3, duration: '20min' },
      { type: 'Tempo Runs', protocol: '10-15min at 70-80%', frequencyPerWeek: 1, duration: '15min' },
    ],
    contraindications: [
      { exercise: 'Heavy Bilateral Squats', reason: 'Recovery demand, unilateral sport', alternative: 'Single leg work' },
      { exercise: 'Long Distance Running', reason: 'Interferes with speed qualities', alternative: 'Interval training' },
    ],
    weeklyTemplate: {
      daysPerWeek: 4,
      structure: [
        'Day 1: Strength + Power',
        'Day 2: Soccer Training',
        'Day 3: Conditioning + Injury Prevention',
        'Day 4: Soccer Training',
      ],
      notes: 'In-season: 2 gym sessions max',
    },
    periodization: [
      { phase: 'Off-season', duration: '6-8 weeks', focus: 'Build strength, address weaknesses' },
      { phase: 'Pre-season', duration: '4-6 weeks', focus: 'Sport-specific conditioning' },
      { phase: 'In-season', duration: 'Season length', focus: 'Maintenance, injury prevention' },
    ],
    nutritionNotes: [
      'Carb periodization based on training',
      'Match day: carb loading',
      'Protein: 1.4-1.8g/kg',
      'Recovery nutrition critical',
    ],
  },

  // ==================== RACQUET SPORTS ====================
  {
    sport: 'tennis',
    displayName: 'Tennis',
    category: 'racquet',
    focusDistribution: {
      strength: 15,
      power: 20,
      hypertrophy: 5,
      endurance: 25,
      mobility: 20,
      skill: 15,
    },
    movementPriorities: [
      { pattern: 'Rotational Power', frequencyPerWeek: '3-4x', notes: 'Serve, groundstrokes' },
      { pattern: 'Lateral Movement', frequencyPerWeek: '3x', notes: 'Court coverage' },
      { pattern: 'Shoulder Health', frequencyPerWeek: '4x', notes: 'Serve health, injury prevention' },
      { pattern: 'Core Stability', frequencyPerWeek: '4x', notes: 'Transfer power to racquet' },
    ],
    topExercises: [
      { tier: 'S', name: 'Medicine Ball Rotational Throw', setsReps: '4x8 each', notes: 'Stroke power' },
      { tier: 'S', name: 'Cable Rotation', setsReps: '3x12 each', notes: 'Controlled rotation' },
      { tier: 'S', name: 'Lateral Bound', setsReps: '3x6 each', notes: 'Court movement' },
      { tier: 'A', name: 'Single Leg RDL', setsReps: '3x8 each', notes: 'Posterior chain, balance' },
      { tier: 'A', name: 'External Rotation', setsReps: '3x15', notes: 'Shoulder health' },
      { tier: 'A', name: 'Split Squat Jump', setsReps: '3x6', notes: 'Explosive first step' },
      { tier: 'B', name: 'Band Pull-Apart', setsReps: '3x20', notes: 'Shoulder stability' },
      { tier: 'B', name: 'Plank with Rotation', setsReps: '3x8 each', notes: 'Core stability' },
    ],
    mobilityWork: [
      { area: 'Shoulders', exercises: ['Shoulder CARs', 'Sleeper Stretch', 'External Rotation Stretch'], durationMinutes: 8, frequency: 'Daily' },
      { area: 'Thoracic Spine', exercises: ['T-Spine Rotation', 'Open Book'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Hips', exercises: ['Hip 90/90', 'Hip Flexor Stretch'], durationMinutes: 5, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Rotational Power', exercises: ['Med Ball Throw', 'Cable Rotation'], priority: 'essential' },
      { type: 'Anti-Rotation', exercises: ['Pallof Press', 'Dead Bug'], priority: 'essential' },
      { type: 'Stability', exercises: ['Plank', 'Side Plank'], priority: 'important' },
    ],
    conditioning: [
      { type: 'Court Sprints', protocol: 'Baseline to net and back', frequencyPerWeek: 2, duration: '15min' },
      { type: 'Lateral Shuttles', protocol: '10m lateral shuffles', frequencyPerWeek: 2, duration: '10min' },
      { type: 'Interval Training', protocol: '20s work/40s rest x 12', frequencyPerWeek: 1, duration: '12min' },
    ],
    contraindications: [
      { exercise: 'Behind Neck Press', reason: 'Shoulder impingement risk', alternative: 'Front Press, Landmine Press' },
      { exercise: 'Heavy Bicep Curls', reason: 'Tennis elbow risk', alternative: 'Wrist strengthening' },
    ],
    weeklyTemplate: {
      daysPerWeek: 4,
      structure: [
        'Day 1: Power + Rotation',
        'Day 2: Tennis Practice',
        'Day 3: Strength + Mobility',
        'Day 4: Conditioning + Court Movement',
      ],
      notes: 'Shoulder prehab every session',
    },
    periodization: [
      { phase: 'Off-season', duration: '6-8 weeks', focus: 'Build base strength, address imbalances' },
      { phase: 'Pre-season', duration: '4-6 weeks', focus: 'Power, court-specific conditioning' },
      { phase: 'In-season', duration: 'Tournament schedule', focus: 'Maintenance, recovery' },
    ],
    nutritionNotes: [
      'Match day: light, high-carb pre-match',
      'Hydration critical - long matches',
      'Moderate carb: 4-6g/kg',
      'Protein: 1.4-1.8g/kg',
    ],
  },

  // ==================== OUTDOOR/ADVENTURE SPORTS ====================
  {
    sport: 'rock_climbing',
    displayName: 'Rock Climbing',
    category: 'outdoor',
    focusDistribution: {
      strength: 25,
      power: 20,
      hypertrophy: 5,
      endurance: 20,
      mobility: 20,
      skill: 10,
    },
    movementPriorities: [
      { pattern: 'Pulling (Vertical)', frequencyPerWeek: '3-4x', notes: 'Lat strength, lock-off ability' },
      { pattern: 'Grip/Finger Strength', frequencyPerWeek: '2-3x', notes: 'Critical for climbing performance' },
      { pattern: 'Core Tension', frequencyPerWeek: '4x', notes: 'Body positioning on the wall' },
      { pattern: 'Antagonist Training', frequencyPerWeek: '3x', notes: 'Injury prevention - push muscles' },
    ],
    topExercises: [
      { tier: 'S', name: 'Pull-up (weighted)', setsReps: '4x5-8', notes: 'Primary climbing movement' },
      { tier: 'S', name: 'Hangboard Training', setsReps: 'Per protocol', notes: 'Finger strength development' },
      { tier: 'S', name: 'Lock-off Holds', setsReps: '3x5s each angle', notes: 'Isometric pulling strength' },
      { tier: 'A', name: 'Front Lever Progressions', setsReps: '3x5-10s', notes: 'Core tension, pulling' },
      { tier: 'A', name: 'Push-ups', setsReps: '3x15', notes: 'Antagonist - shoulder health' },
      { tier: 'A', name: 'Wrist Curls', setsReps: '3x15', notes: 'Antagonist - forearm balance' },
      { tier: 'B', name: 'Shoulder External Rotation', setsReps: '3x15', notes: 'Shoulder health' },
      { tier: 'B', name: 'Reverse Wrist Curl', setsReps: '3x15', notes: 'Elbow health' },
    ],
    mobilityWork: [
      { area: 'Shoulders', exercises: ['Shoulder CARs', 'Lat Stretch', 'Pec Stretch'], durationMinutes: 8, frequency: 'Daily' },
      { area: 'Hips', exercises: ['Hip 90/90', 'Frog Stretch', 'Deep Squat Hold'], durationMinutes: 8, frequency: 'Daily' },
      { area: 'Fingers/Wrists', exercises: ['Finger Extensions', 'Wrist Circles'], durationMinutes: 5, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Anti-Extension', exercises: ['Front Lever', 'Ab Wheel', 'Dragon Flag'], priority: 'essential' },
      { type: 'Compression', exercises: ['L-Sit', 'Hanging Leg Raise', 'V-Ups'], priority: 'essential' },
      { type: 'Rotation', exercises: ['Windshield Wipers', 'Pallof Press'], priority: 'important' },
    ],
    conditioning: [
      { type: 'Climbing Volume', protocol: 'Easy routes for volume', frequencyPerWeek: 2, duration: '60min' },
      { type: 'Aerobic Base', protocol: 'Light cardio', frequencyPerWeek: 2, duration: '30min' },
    ],
    contraindications: [
      { exercise: 'Heavy Deadlifts', reason: 'Grip fatigue impacts climbing', alternative: 'Hip hinge variations' },
      { exercise: 'Excessive Pulling Volume', reason: 'Elbow/finger overuse', alternative: 'Quality over quantity' },
    ],
    weeklyTemplate: {
      daysPerWeek: 4,
      structure: [
        'Day 1: Climbing + Hangboard',
        'Day 2: Antagonist Training + Mobility',
        'Day 3: Climbing (Volume)',
        'Day 4: Strength + Core',
      ],
      notes: 'Manage finger load carefully',
    },
    periodization: [
      { phase: 'Base', duration: '4-6 weeks', focus: 'Volume climbing, general strength' },
      { phase: 'Strength', duration: '4-6 weeks', focus: 'Finger strength, max hangs' },
      { phase: 'Power', duration: '3-4 weeks', focus: 'Limit bouldering, explosive moves' },
      { phase: 'Performance', duration: '2-3 weeks', focus: 'Project attempts, reduce volume' },
    ],
    nutritionNotes: [
      'Power-to-weight ratio important',
      'Moderate carb: 4-5g/kg',
      'Protein: 1.6-2.0g/kg',
      'Don\'t chase low weight at expense of strength',
    ],
  },

  {
    sport: 'swimming',
    displayName: 'Swimming',
    category: 'endurance',
    focusDistribution: {
      strength: 15,
      power: 15,
      hypertrophy: 10,
      endurance: 40,
      mobility: 15,
      skill: 5,
    },
    movementPriorities: [
      { pattern: 'Pulling (Vertical)', frequencyPerWeek: '3-4x', notes: 'Lat strength for catch and pull' },
      { pattern: 'Core Stability', frequencyPerWeek: '4x', notes: 'Body position, kick transfer' },
      { pattern: 'Shoulder Rotation', frequencyPerWeek: '4x', notes: 'Injury prevention, stroke efficiency' },
      { pattern: 'Hip Mobility', frequencyPerWeek: 'Daily', notes: 'Kick range of motion' },
    ],
    topExercises: [
      { tier: 'S', name: 'Lat Pulldown', setsReps: '4x10-12', notes: 'Pull phase strength' },
      { tier: 'S', name: 'Band Pull-Apart', setsReps: '4x20', notes: 'Shoulder health' },
      { tier: 'S', name: 'Prone I-Y-T Raises', setsReps: '3x10 each', notes: 'Rotator cuff strength' },
      { tier: 'A', name: 'Cable External Rotation', setsReps: '3x15', notes: 'Shoulder stability' },
      { tier: 'A', name: 'Russian Twist', setsReps: '3x20', notes: 'Rotational core' },
      { tier: 'A', name: 'Flutter Kicks', setsReps: '3x30s', notes: 'Kick strength, hip flexors' },
      { tier: 'B', name: 'Push-up', setsReps: '3x15', notes: 'Push phase, chest' },
      { tier: 'B', name: 'Squat Jump', setsReps: '3x8', notes: 'Dive starts, turns' },
    ],
    mobilityWork: [
      { area: 'Shoulders', exercises: ['Shoulder CARs', 'Sleeper Stretch', 'Doorway Stretch'], durationMinutes: 10, frequency: 'Daily' },
      { area: 'Thoracic Spine', exercises: ['T-Spine Extension', 'Cat-Cow', 'Thread the Needle'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Ankles', exercises: ['Ankle Plantarflexion Stretch', 'Ankle Circles'], durationMinutes: 3, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Stability', exercises: ['Plank', 'Side Plank', 'Hollow Hold'], priority: 'essential' },
      { type: 'Rotation', exercises: ['Russian Twist', 'Bicycle Crunch'], priority: 'important' },
      { type: 'Hip Flexor', exercises: ['Flutter Kick', 'Hanging Leg Raise'], priority: 'important' },
    ],
    conditioning: [
      { type: 'Pool Intervals', protocol: '10x100m at race pace', frequencyPerWeek: 3, duration: '45min' },
      { type: 'Technique Focus', protocol: 'Drill work', frequencyPerWeek: 2, duration: '30min' },
      { type: 'Endurance Swim', protocol: '2000-4000m continuous', frequencyPerWeek: 2, duration: '60min' },
    ],
    contraindications: [
      { exercise: 'Behind Neck Press', reason: 'Shoulder impingement risk', alternative: 'Front press variations' },
      { exercise: 'Heavy Bench Press', reason: 'Pec tightness affects stroke', alternative: 'Moderate weight, full ROM' },
    ],
    weeklyTemplate: {
      daysPerWeek: 6,
      structure: [
        'Day 1: Swim - Endurance',
        'Day 2: Dryland Strength',
        'Day 3: Swim - Intervals',
        'Day 4: Mobility + Light Swim',
        'Day 5: Swim - Race Pace',
        'Day 6: Dryland Power + Core',
      ],
      notes: 'Shoulder prehab critical',
    },
    periodization: [
      { phase: 'Base', duration: '8-12 weeks', focus: 'Build aerobic base, technique' },
      { phase: 'Build', duration: '6-8 weeks', focus: 'Increase intensity' },
      { phase: 'Taper', duration: '2-3 weeks', focus: 'Reduce volume, maintain speed' },
    ],
    nutritionNotes: [
      'High energy expenditure in water',
      'Carb needs: 5-8g/kg',
      'Protein: 1.4-1.8g/kg',
      'Pre-competition meal timing important',
    ],
  },

  // ==================== GENERAL FITNESS ====================
  {
    sport: 'general_fitness',
    displayName: 'General Fitness',
    category: 'functional',
    focusDistribution: {
      strength: 25,
      power: 10,
      hypertrophy: 20,
      endurance: 25,
      mobility: 15,
      skill: 5,
    },
    movementPriorities: [
      { pattern: 'Push', frequencyPerWeek: '2x', notes: 'Chest, shoulders, triceps' },
      { pattern: 'Pull', frequencyPerWeek: '2x', notes: 'Back, biceps' },
      { pattern: 'Squat/Hinge', frequencyPerWeek: '2x', notes: 'Legs, glutes' },
      { pattern: 'Core', frequencyPerWeek: '3x', notes: 'Stability, posture' },
      { pattern: 'Cardio', frequencyPerWeek: '2-3x', notes: 'Heart health' },
    ],
    topExercises: [
      { tier: 'S', name: 'Squat (any variation)', setsReps: '3x8-12', notes: 'Fundamental lower body' },
      { tier: 'S', name: 'Deadlift (any variation)', setsReps: '3x8-10', notes: 'Posterior chain' },
      { tier: 'S', name: 'Bench Press/Push-up', setsReps: '3x8-12', notes: 'Upper push' },
      { tier: 'S', name: 'Row/Pull-up', setsReps: '3x8-12', notes: 'Upper pull' },
      { tier: 'A', name: 'Lunges', setsReps: '3x10 each', notes: 'Unilateral leg work' },
      { tier: 'A', name: 'Shoulder Press', setsReps: '3x10', notes: 'Overhead strength' },
      { tier: 'A', name: 'Plank', setsReps: '3x30-60s', notes: 'Core stability' },
      { tier: 'B', name: 'Bicep Curl', setsReps: '3x12', notes: 'Arm aesthetics' },
      { tier: 'B', name: 'Tricep Extension', setsReps: '3x12', notes: 'Arm aesthetics' },
    ],
    mobilityWork: [
      { area: 'Hips', exercises: ['Hip Flexor Stretch', 'Pigeon'], durationMinutes: 5, frequency: 'Daily' },
      { area: 'Shoulders', exercises: ['Shoulder Circles', 'Doorway Stretch'], durationMinutes: 3, frequency: 'Daily' },
      { area: 'Spine', exercises: ['Cat-Cow', 'Thoracic Rotation'], durationMinutes: 3, frequency: 'Daily' },
    ],
    coreWork: [
      { type: 'Stability', exercises: ['Plank', 'Dead Bug', 'Bird Dog'], priority: 'essential' },
      { type: 'Strength', exercises: ['Crunch', 'Leg Raise'], priority: 'important' },
    ],
    conditioning: [
      { type: 'Steady State', protocol: 'Walk, bike, swim at easy pace', frequencyPerWeek: 2, duration: '30min' },
      { type: 'Intervals', protocol: '20s hard/40s easy x 10', frequencyPerWeek: 1, duration: '15min' },
    ],
    contraindications: [],
    weeklyTemplate: {
      daysPerWeek: 3,
      structure: [
        'Day 1: Full Body Strength',
        'Day 2: Cardio + Core',
        'Day 3: Full Body Strength',
      ],
      notes: 'Flexible - adjust based on goals',
    },
    periodization: [
      { phase: 'Foundation', duration: 'Ongoing', focus: 'Consistent training, habit building' },
    ],
    nutritionNotes: [
      'Balanced diet - no extremes needed',
      'Protein: 1.4-1.8g/kg',
      'Eat according to goals (surplus/deficit/maintenance)',
    ],
  },
];

/**
 * Get sport protocol by sport name (case-insensitive, handles variations)
 */
export function getSportProtocol(sportName: string): SportTrainingProtocol | null {
  if (!sportName) return null;

  const normalized = sportName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');

  // Direct match
  const direct = SPORT_TRAINING_DATABASE.find(s => s.sport === normalized);
  if (direct) return direct;

  // Fuzzy matching for common variations
  const aliases: Record<string, string> = {
    'mma': 'mma',
    'mixed_martial_arts': 'mma',
    'ufc': 'mma',
    'brazilian_jiu_jitsu': 'mma',
    'bjj': 'mma',
    'kickboxing': 'boxing',
    'muay_thai': 'boxing',
    'football': 'soccer',
    'fussball': 'soccer',
    'futbol': 'soccer',
    'running': 'marathon',
    'long_distance_running': 'marathon',
    '5k': 'marathon',
    '10k': 'marathon',
    'half_marathon': 'marathon',
    'ironman': 'triathlon',
    '70_3': 'triathlon',
    'olympic_triathlon': 'triathlon',
    'olympic_lifting': 'crossfit',
    'weightlifting': 'powerlifting',
    'strength_training': 'powerlifting',
    'bouldering': 'rock_climbing',
    'sport_climbing': 'rock_climbing',
    'climbing': 'rock_climbing',
    'padel': 'tennis',
    'squash': 'tennis',
    'badminton': 'tennis',
    'none': 'general_fitness',
    'general': 'general_fitness',
    'fitness': 'general_fitness',
    'gym': 'general_fitness',
    'weight_loss': 'general_fitness',
    'get_fit': 'general_fitness',
  };

  const aliased = aliases[normalized];
  if (aliased) {
    return SPORT_TRAINING_DATABASE.find(s => s.sport === aliased) || null;
  }

  // Partial match
  const partial = SPORT_TRAINING_DATABASE.find(s =>
    normalized.includes(s.sport) || s.sport.includes(normalized)
  );
  if (partial) return partial;

  // Default to general fitness
  return SPORT_TRAINING_DATABASE.find(s => s.sport === 'general_fitness') || null;
}

/**
 * Format sport protocol for AI prompt (compact format)
 */
export function formatSportForPrompt(protocol: SportTrainingProtocol): string {
  const lines = [
    `**SPORT-SPECIFIC TRAINING: ${protocol.displayName}**`,
    '',
    `Focus Distribution: Strength ${protocol.focusDistribution.strength}%, Power ${protocol.focusDistribution.power}%, Endurance ${protocol.focusDistribution.endurance}%, Mobility ${protocol.focusDistribution.mobility}%`,
    '',
    '**Movement Priorities:**',
    ...protocol.movementPriorities.map(m => `- ${m.pattern} (${m.frequencyPerWeek}): ${m.notes}`),
    '',
    '**Essential Exercises (S-Tier):**',
    ...protocol.topExercises.filter(e => e.tier === 'S').map(e => `- ${e.name}: ${e.setsReps} - ${e.notes}`),
    '',
    '**Important Exercises (A-Tier):**',
    ...protocol.topExercises.filter(e => e.tier === 'A').map(e => `- ${e.name}: ${e.setsReps}`),
    '',
    '**Required Mobility Work:**',
    ...protocol.mobilityWork.map(m => `- ${m.area}: ${m.exercises.join(', ')} (${m.frequency})`),
    '',
    '**Core Training Priority:**',
    ...protocol.coreWork.filter(c => c.priority === 'essential').map(c => `- ${c.type}: ${c.exercises.join(', ')}`),
    '',
    '**Conditioning:**',
    ...protocol.conditioning.map(c => `- ${c.type}: ${c.protocol} (${c.frequencyPerWeek}x/week)`),
    '',
    '**Exercises to Avoid/Modify:**',
    ...protocol.contraindications.map(c => `- ${c.exercise}: ${c.reason} → Use: ${c.alternative}`),
    '',
    '**Weekly Structure:**',
    ...protocol.weeklyTemplate.structure,
    '',
    `Note: ${protocol.weeklyTemplate.notes}`,
  ];

  return lines.join('\n');
}

export default SPORT_TRAINING_DATABASE;
