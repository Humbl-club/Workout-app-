/**
 * Supplement Research Service
 * Science-based supplement database for AI plan generation
 *
 * All evidence levels and recommendations based on peer-reviewed research
 * Sources: Examine.com, PubMed meta-analyses, ISSN position stands
 */

export interface SupplementEffect {
  name: string;
  category: 'performance' | 'recovery' | 'health' | 'cognitive';
  effects: {
    trainingVolume: 'increase' | 'neutral' | 'decrease';
    recoverySpeed: 'faster' | 'neutral' | 'slower';
    recommendedTiming: string;
    dosageGuidance: string;
  };
  interactions: string[];
  evidenceLevel: 'strong' | 'moderate' | 'limited';
  scienceNote: string;
}

export const SUPPLEMENT_DATABASE: Record<string, SupplementEffect> = {
  'Creatine Monohydrate': {
    name: 'Creatine Monohydrate',
    category: 'performance',
    effects: {
      trainingVolume: 'increase',
      recoverySpeed: 'faster',
      recommendedTiming: 'Daily, timing doesn\'t matter. 3-5g/day.',
      dosageGuidance: '3-5g daily. Loading phase optional (20g/day for 5-7 days).',
    },
    interactions: ['Caffeine may slightly reduce acute performance boost'],
    evidenceLevel: 'strong',
    scienceNote: 'Most researched supplement. Increases phosphocreatine stores, allowing 1-2 extra reps on heavy sets. Meta-analyses show ~8% strength increase.',
  },

  'Creatine': {
    name: 'Creatine',
    category: 'performance',
    effects: {
      trainingVolume: 'increase',
      recoverySpeed: 'faster',
      recommendedTiming: 'Daily, timing doesn\'t matter. 3-5g/day.',
      dosageGuidance: '3-5g daily. Loading phase optional (20g/day for 5-7 days).',
    },
    interactions: ['Caffeine may slightly reduce acute performance boost'],
    evidenceLevel: 'strong',
    scienceNote: 'Most researched supplement. Increases phosphocreatine stores, allowing 1-2 extra reps on heavy sets. Meta-analyses show ~8% strength increase.',
  },

  'Caffeine': {
    name: 'Caffeine',
    category: 'performance',
    effects: {
      trainingVolume: 'increase',
      recoverySpeed: 'neutral',
      recommendedTiming: '30-60 min pre-workout. Avoid within 6h of sleep.',
      dosageGuidance: '3-6mg/kg body weight. ~200-400mg for most people.',
    },
    interactions: ['Cycle off periodically to maintain sensitivity', 'May reduce creatine acute effects slightly'],
    evidenceLevel: 'strong',
    scienceNote: 'Improves endurance, strength, and power. Effect sizes: ~3% endurance, ~2% strength. Tolerance develops over time.',
  },

  'Whey Protein': {
    name: 'Whey Protein',
    category: 'recovery',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'faster',
      recommendedTiming: 'Post-workout or whenever needed to hit protein targets.',
      dosageGuidance: '20-40g per serving. Total daily protein more important than timing.',
    },
    interactions: [],
    evidenceLevel: 'strong',
    scienceNote: 'Convenient protein source. No magic properties vs food protein. High leucine content (~2.5g per 25g) triggers muscle protein synthesis.',
  },

  'Protein Powder': {
    name: 'Protein Powder',
    category: 'recovery',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'faster',
      recommendedTiming: 'Post-workout or whenever needed to hit protein targets.',
      dosageGuidance: '20-40g per serving. Total daily protein more important than timing.',
    },
    interactions: [],
    evidenceLevel: 'strong',
    scienceNote: 'Convenient protein source. Helps hit 1.6g/kg daily target. Whey, casein, and plant proteins all effective.',
  },

  'Vitamin D3': {
    name: 'Vitamin D3',
    category: 'health',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'neutral',
      recommendedTiming: 'Morning with fat-containing meal.',
      dosageGuidance: '1000-4000 IU daily depending on blood levels.',
    },
    interactions: ['Take with Vitamin K2 for optimal calcium metabolism'],
    evidenceLevel: 'strong',
    scienceNote: 'Deficiency common (~40% of population). Supports immune function, bone health. May support testosterone in deficient individuals.',
  },

  'Vitamin D': {
    name: 'Vitamin D',
    category: 'health',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'neutral',
      recommendedTiming: 'Morning with fat-containing meal.',
      dosageGuidance: '1000-4000 IU daily depending on blood levels.',
    },
    interactions: ['Take with Vitamin K2 for optimal calcium metabolism'],
    evidenceLevel: 'strong',
    scienceNote: 'Deficiency common (~40% of population). Supports immune function, bone health. May support testosterone in deficient individuals.',
  },

  'Fish Oil': {
    name: 'Fish Oil',
    category: 'recovery',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'faster',
      recommendedTiming: 'With meals to improve absorption.',
      dosageGuidance: '2-3g combined EPA+DHA daily.',
    },
    interactions: ['May increase bleeding risk with blood thinners'],
    evidenceLevel: 'moderate',
    scienceNote: 'Anti-inflammatory. May reduce muscle soreness by ~15-20%. Benefits cardiovascular health. Look for high EPA+DHA content.',
  },

  'Omega-3': {
    name: 'Omega-3',
    category: 'recovery',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'faster',
      recommendedTiming: 'With meals to improve absorption.',
      dosageGuidance: '2-3g combined EPA+DHA daily.',
    },
    interactions: ['May increase bleeding risk with blood thinners'],
    evidenceLevel: 'moderate',
    scienceNote: 'Anti-inflammatory. May reduce muscle soreness by ~15-20%. Benefits cardiovascular health.',
  },

  'Magnesium': {
    name: 'Magnesium',
    category: 'recovery',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'faster',
      recommendedTiming: 'Evening, may improve sleep quality.',
      dosageGuidance: '200-400mg daily. Glycinate or citrate forms best absorbed.',
    },
    interactions: ['ZMA combines with zinc and B6'],
    evidenceLevel: 'moderate',
    scienceNote: 'Many athletes deficient. Supports 300+ enzymatic processes including muscle contraction and protein synthesis. May improve sleep quality.',
  },

  'Beta-Alanine': {
    name: 'Beta-Alanine',
    category: 'performance',
    effects: {
      trainingVolume: 'increase',
      recoverySpeed: 'neutral',
      recommendedTiming: 'Daily dosing (not timing-specific). May cause tingling.',
      dosageGuidance: '3-6g daily. Tingling (paresthesia) is harmless.',
    },
    interactions: [],
    evidenceLevel: 'moderate',
    scienceNote: 'Increases muscle carnosine, buffering lactic acid. Best for 1-4 minute efforts (like high-rep sets). ~2.5% improvement in exercise lasting 60-240 seconds.',
  },

  'Ashwagandha': {
    name: 'Ashwagandha',
    category: 'recovery',
    effects: {
      trainingVolume: 'increase',
      recoverySpeed: 'faster',
      recommendedTiming: 'Evening preferred. Can take morning if no sedation.',
      dosageGuidance: '300-600mg daily of root extract (KSM-66 or Sensoril).',
    },
    interactions: ['May interact with thyroid medications'],
    evidenceLevel: 'moderate',
    scienceNote: 'Adaptogen that may reduce cortisol by ~15-30%. Studies show improvements in strength (+10%), recovery, and testosterone (+15%) in trained men.',
  },

  'BCAA': {
    name: 'BCAA',
    category: 'recovery',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'neutral',
      recommendedTiming: 'Intra or post-workout. Less useful if protein intake adequate.',
      dosageGuidance: '5-10g. Leucine most important (2-3g minimum).',
    },
    interactions: [],
    evidenceLevel: 'limited',
    scienceNote: 'Largely unnecessary if eating adequate protein (~1.6g/kg). May help in fasted training or very long sessions. Complete proteins (whey) are superior.',
  },

  'Pre-Workout': {
    name: 'Pre-Workout',
    category: 'performance',
    effects: {
      trainingVolume: 'increase',
      recoverySpeed: 'neutral',
      recommendedTiming: '20-30 min pre-workout.',
      dosageGuidance: 'Follow label. Check caffeine content (~150-300mg typical).',
    },
    interactions: ['Watch total daily caffeine. Avoid if sensitive.'],
    evidenceLevel: 'moderate',
    scienceNote: 'Most benefits come from caffeine + beta-alanine + citrulline. Check label for these. Many contain underdosed "proprietary blends."',
  },

  'ZMA': {
    name: 'ZMA',
    category: 'recovery',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'faster',
      recommendedTiming: '30-60 min before bed, away from calcium.',
      dosageGuidance: 'Standard ZMA dose: 30mg zinc, 450mg magnesium, 10.5mg B6.',
    },
    interactions: ['Zinc competes with copper absorption long-term'],
    evidenceLevel: 'limited',
    scienceNote: 'May improve sleep quality and testosterone only if deficient. Benefits mainly from magnesium and zinc individually. Mixed evidence for performance.',
  },

  'Multivitamin': {
    name: 'Multivitamin',
    category: 'health',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'neutral',
      recommendedTiming: 'With meals for better absorption.',
      dosageGuidance: '1 serving daily. Look for quality brands without megadoses.',
    },
    interactions: [],
    evidenceLevel: 'limited',
    scienceNote: '"Insurance policy" for micronutrient gaps. Not a substitute for varied diet. May help those with restricted diets. Limited evidence for performance.',
  },

  'Citrulline': {
    name: 'Citrulline',
    category: 'performance',
    effects: {
      trainingVolume: 'increase',
      recoverySpeed: 'neutral',
      recommendedTiming: '30-60 min pre-workout.',
      dosageGuidance: '6-8g citrulline malate OR 3-4g L-citrulline.',
    },
    interactions: [],
    evidenceLevel: 'moderate',
    scienceNote: 'Increases nitric oxide production, improving blood flow. May add 1-2 reps on compound lifts. Better pumps. More effective than arginine.',
  },

  'L-Citrulline': {
    name: 'L-Citrulline',
    category: 'performance',
    effects: {
      trainingVolume: 'increase',
      recoverySpeed: 'neutral',
      recommendedTiming: '30-60 min pre-workout.',
      dosageGuidance: '3-4g L-citrulline or 6-8g citrulline malate.',
    },
    interactions: [],
    evidenceLevel: 'moderate',
    scienceNote: 'Increases nitric oxide production, improving blood flow. May add 1-2 reps. Better pumps and endurance.',
  },

  'Melatonin': {
    name: 'Melatonin',
    category: 'recovery',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'faster',
      recommendedTiming: '30-60 min before bed.',
      dosageGuidance: '0.5-3mg. Start low, more is not better.',
    },
    interactions: ['May interact with blood thinners, immunosuppressants'],
    evidenceLevel: 'strong',
    scienceNote: 'Effective for sleep onset, especially with jet lag or shift work. Better sleep = better recovery. Lower doses (0.5-1mg) often more effective than high doses.',
  },

  'Electrolytes': {
    name: 'Electrolytes',
    category: 'performance',
    effects: {
      trainingVolume: 'neutral',
      recoverySpeed: 'neutral',
      recommendedTiming: 'During and after prolonged exercise (>60 min) or heavy sweating.',
      dosageGuidance: 'Varies by sweat rate. ~500-1000mg sodium/hour during intense exercise.',
    },
    interactions: [],
    evidenceLevel: 'strong',
    scienceNote: 'Essential for hydration during long/intense sessions. Prevents cramping and maintains performance. Most important: sodium, potassium, magnesium.',
  },
};

// Fuzzy match supplement names
function findSupplement(name: string): SupplementEffect | null {
  const normalizedName = name.toLowerCase().trim();

  // Direct match first
  for (const [key, value] of Object.entries(SUPPLEMENT_DATABASE)) {
    if (key.toLowerCase() === normalizedName) {
      return value;
    }
  }

  // Partial match
  for (const [key, value] of Object.entries(SUPPLEMENT_DATABASE)) {
    if (key.toLowerCase().includes(normalizedName) || normalizedName.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}

export interface UserSupplement {
  name: string;
  timing?: string;
  dosage?: string;
}

/**
 * Format supplement context for AI plan generation
 * Provides science-based recommendations without judgment
 */
export function formatSupplementContext(supplements: UserSupplement[]): string {
  if (!supplements || supplements.length === 0) return '';

  const matchedSupps: SupplementEffect[] = [];
  const unmatchedNames: string[] = [];

  for (const supp of supplements) {
    const matched = findSupplement(supp.name);
    if (matched) {
      matchedSupps.push(matched);
    } else {
      unmatchedNames.push(supp.name);
    }
  }

  if (matchedSupps.length === 0 && unmatchedNames.length === 0) return '';

  let context = `\n**SUPPLEMENT STACK ANALYSIS:**\n`;
  context += `The user is taking ${supplements.length} supplement(s). Consider these in the plan:\n\n`;

  for (const supp of matchedSupps) {
    context += `- **${supp.name}** (${supp.evidenceLevel} evidence):\n`;
    context += `  - Training volume impact: ${supp.effects.trainingVolume}\n`;
    context += `  - Recovery impact: ${supp.effects.recoverySpeed}\n`;
    context += `  - Timing: ${supp.effects.recommendedTiming}\n`;
    context += `  - Science: ${supp.scienceNote}\n`;
  }

  if (unmatchedNames.length > 0) {
    context += `\nUnrecognized supplements (no data): ${unmatchedNames.join(', ')}\n`;
  }

  // Calculate training volume and recovery recommendations
  const volumeIncreasing = matchedSupps.filter(s => s.effects.trainingVolume === 'increase');
  const recoveryBoosting = matchedSupps.filter(s => s.effects.recoverySpeed === 'faster');
  const performanceSupps = matchedSupps.filter(s => s.category === 'performance');

  context += `\n**AI PROGRAMMING RECOMMENDATIONS:**\n`;

  if (volumeIncreasing.length >= 2) {
    context += `- With ${volumeIncreasing.length} volume-enhancing supplements (${volumeIncreasing.map(s => s.name).join(', ')}), the user may tolerate slightly higher training volume (+1-2 sets on compound movements).\n`;
  }

  if (recoveryBoosting.length >= 2) {
    context += `- With ${recoveryBoosting.length} recovery-enhancing supplements (${recoveryBoosting.map(s => s.name).join(', ')}), the user may recover faster between sessions. Consider higher frequency if desired.\n`;
  }

  if (performanceSupps.length > 0) {
    context += `- Performance supplements present (${performanceSupps.map(s => s.name).join(', ')}). User may perform better with adequate pre-workout timing.\n`;
  }

  // Check for creatine specifically - very well-researched
  const hasCreatine = matchedSupps.some(s => s.name.toLowerCase().includes('creatine'));
  if (hasCreatine) {
    context += `- **Creatine user**: Can likely handle higher intensity work and may see better strength gains. Creatine supports ATP regeneration for explosive efforts.\n`;
  }

  // Check for caffeine/pre-workout
  const hasCaffeine = matchedSupps.some(s =>
    s.name.toLowerCase().includes('caffeine') || s.name.toLowerCase().includes('pre-workout')
  );
  if (hasCaffeine) {
    context += `- **Caffeine/Pre-workout user**: May perform better in morning or early sessions. Avoid scheduling intense workouts close to bedtime.\n`;
  }

  context += `\n**IMPORTANT**: These are general guidelines. Individual responses vary. Do not dramatically increase volume/intensity solely based on supplements. Build progressively.\n`;

  return context;
}

/**
 * Get a list of common supplements for UI suggestions
 */
export function getCommonSupplements(): string[] {
  return [
    'Creatine',
    'Whey Protein',
    'Caffeine',
    'Pre-Workout',
    'Fish Oil',
    'Vitamin D',
    'Magnesium',
    'Beta-Alanine',
    'BCAA',
    'Ashwagandha',
    'ZMA',
    'Multivitamin',
    'Citrulline',
    'Melatonin',
    'Electrolytes',
  ];
}

/**
 * Get supplement info for display in UI
 */
export function getSupplementInfo(name: string): SupplementEffect | null {
  return findSupplement(name);
}
