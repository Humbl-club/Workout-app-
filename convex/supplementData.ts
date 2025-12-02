/**
 * Supplement Research Data for AI Plan Generation
 * Science-based supplement database with evidence levels
 *
 * Sources: Examine.com, PubMed meta-analyses, ISSN position stands
 */

interface SupplementEffect {
  name: string;
  category: 'performance' | 'recovery' | 'health' | 'cognitive';
  trainingVolume: 'increase' | 'neutral' | 'decrease';
  recoverySpeed: 'faster' | 'neutral' | 'slower';
  timing: string;
  evidenceLevel: 'strong' | 'moderate' | 'limited';
  scienceNote: string;
}

const SUPPLEMENT_DATABASE: Record<string, SupplementEffect> = {
  'creatine': {
    name: 'Creatine',
    category: 'performance',
    trainingVolume: 'increase',
    recoverySpeed: 'faster',
    timing: 'Daily, timing flexible',
    evidenceLevel: 'strong',
    scienceNote: 'Most researched supplement. ~8% strength increase. Supports ATP regeneration for explosive efforts.',
  },
  'caffeine': {
    name: 'Caffeine',
    category: 'performance',
    trainingVolume: 'increase',
    recoverySpeed: 'neutral',
    timing: '30-60 min pre-workout',
    evidenceLevel: 'strong',
    scienceNote: '~3% endurance, ~2% strength improvement. Tolerance develops.',
  },
  'pre-workout': {
    name: 'Pre-Workout',
    category: 'performance',
    trainingVolume: 'increase',
    recoverySpeed: 'neutral',
    timing: '20-30 min pre-workout',
    evidenceLevel: 'moderate',
    scienceNote: 'Benefits mainly from caffeine + beta-alanine + citrulline.',
  },
  'whey protein': {
    name: 'Whey Protein',
    category: 'recovery',
    trainingVolume: 'neutral',
    recoverySpeed: 'faster',
    timing: 'Post-workout or with meals',
    evidenceLevel: 'strong',
    scienceNote: 'Convenient protein source. High leucine triggers muscle protein synthesis.',
  },
  'protein': {
    name: 'Protein Powder',
    category: 'recovery',
    trainingVolume: 'neutral',
    recoverySpeed: 'faster',
    timing: 'With meals to hit 1.6g/kg target',
    evidenceLevel: 'strong',
    scienceNote: 'Helps meet daily protein requirements for muscle growth.',
  },
  'fish oil': {
    name: 'Fish Oil / Omega-3',
    category: 'recovery',
    trainingVolume: 'neutral',
    recoverySpeed: 'faster',
    timing: 'With meals',
    evidenceLevel: 'moderate',
    scienceNote: 'Anti-inflammatory. May reduce muscle soreness by ~15-20%.',
  },
  'omega': {
    name: 'Omega-3',
    category: 'recovery',
    trainingVolume: 'neutral',
    recoverySpeed: 'faster',
    timing: 'With meals',
    evidenceLevel: 'moderate',
    scienceNote: 'Anti-inflammatory. Supports cardiovascular health and recovery.',
  },
  'vitamin d': {
    name: 'Vitamin D',
    category: 'health',
    trainingVolume: 'neutral',
    recoverySpeed: 'neutral',
    timing: 'Morning with fat',
    evidenceLevel: 'strong',
    scienceNote: 'Deficiency common (~40%). Supports bone health and immune function.',
  },
  'magnesium': {
    name: 'Magnesium',
    category: 'recovery',
    trainingVolume: 'neutral',
    recoverySpeed: 'faster',
    timing: 'Evening, may improve sleep',
    evidenceLevel: 'moderate',
    scienceNote: 'Supports 300+ enzymatic processes. May improve sleep quality.',
  },
  'beta-alanine': {
    name: 'Beta-Alanine',
    category: 'performance',
    trainingVolume: 'increase',
    recoverySpeed: 'neutral',
    timing: 'Daily dosing',
    evidenceLevel: 'moderate',
    scienceNote: 'Buffers lactic acid. Best for 1-4 minute efforts. ~2.5% improvement.',
  },
  'ashwagandha': {
    name: 'Ashwagandha',
    category: 'recovery',
    trainingVolume: 'increase',
    recoverySpeed: 'faster',
    timing: 'Evening preferred',
    evidenceLevel: 'moderate',
    scienceNote: 'Adaptogen. May reduce cortisol ~15-30%, improve strength ~10%.',
  },
  'bcaa': {
    name: 'BCAA',
    category: 'recovery',
    trainingVolume: 'neutral',
    recoverySpeed: 'neutral',
    timing: 'Intra or post-workout',
    evidenceLevel: 'limited',
    scienceNote: 'Largely unnecessary if protein intake adequate. May help fasted training.',
  },
  'zma': {
    name: 'ZMA',
    category: 'recovery',
    trainingVolume: 'neutral',
    recoverySpeed: 'faster',
    timing: 'Before bed',
    evidenceLevel: 'limited',
    scienceNote: 'May improve sleep. Benefits if zinc/magnesium deficient.',
  },
  'citrulline': {
    name: 'Citrulline',
    category: 'performance',
    trainingVolume: 'increase',
    recoverySpeed: 'neutral',
    timing: '30-60 min pre-workout',
    evidenceLevel: 'moderate',
    scienceNote: 'Increases nitric oxide. May add 1-2 reps. Better than arginine.',
  },
  'melatonin': {
    name: 'Melatonin',
    category: 'recovery',
    trainingVolume: 'neutral',
    recoverySpeed: 'faster',
    timing: '30-60 min before bed',
    evidenceLevel: 'strong',
    scienceNote: 'Effective for sleep onset. Better sleep = better recovery.',
  },
  'electrolytes': {
    name: 'Electrolytes',
    category: 'performance',
    trainingVolume: 'neutral',
    recoverySpeed: 'neutral',
    timing: 'During exercise >60 min',
    evidenceLevel: 'strong',
    scienceNote: 'Essential for hydration. Prevents cramping.',
  },
  'multivitamin': {
    name: 'Multivitamin',
    category: 'health',
    trainingVolume: 'neutral',
    recoverySpeed: 'neutral',
    timing: 'With meals',
    evidenceLevel: 'limited',
    scienceNote: 'Insurance for micronutrient gaps. Limited performance evidence.',
  },
};

// Find supplement by fuzzy matching
function findSupplement(name: string): SupplementEffect | null {
  const normalized = name.toLowerCase().trim();

  // Direct match
  if (SUPPLEMENT_DATABASE[normalized]) {
    return SUPPLEMENT_DATABASE[normalized];
  }

  // Partial match
  for (const [key, value] of Object.entries(SUPPLEMENT_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

export interface UserSupplement {
  name: string;
  timing: string;
  dosage?: string;
}

/**
 * Format supplement context for AI plan generation prompt
 */
export function formatSupplementPrompt(supplements?: UserSupplement[]): string {
  if (!supplements || supplements.length === 0) return '';

  const matched: SupplementEffect[] = [];
  const unmatched: string[] = [];

  for (const supp of supplements) {
    const found = findSupplement(supp.name);
    if (found) {
      matched.push(found);
    } else {
      unmatched.push(supp.name);
    }
  }

  if (matched.length === 0) return '';

  let context = `\n**SUPPLEMENT STACK ANALYSIS:**
The user is taking ${supplements.length} supplement(s). Consider these when programming:\n`;

  for (const supp of matched) {
    context += `\n- **${supp.name}** (${supp.evidenceLevel} evidence):
  - Volume impact: ${supp.trainingVolume}
  - Recovery impact: ${supp.recoverySpeed}
  - ${supp.scienceNote}\n`;
  }

  if (unmatched.length > 0) {
    context += `\n*Unrecognized: ${unmatched.join(', ')}*\n`;
  }

  // Training recommendations based on stack
  const volumeBoost = matched.filter(s => s.trainingVolume === 'increase');
  const recoveryBoost = matched.filter(s => s.recoverySpeed === 'faster');
  const hasCreatine = matched.some(s => s.name.toLowerCase().includes('creatine'));
  const hasCaffeine = matched.some(s =>
    s.name.toLowerCase().includes('caffeine') || s.name.toLowerCase().includes('pre-workout')
  );

  context += `\n**AI PROGRAMMING ADJUSTMENTS:**\n`;

  if (volumeBoost.length >= 2) {
    context += `- With ${volumeBoost.length} volume-enhancing supplements, user may tolerate +1-2 sets on compound movements.\n`;
  }

  if (recoveryBoost.length >= 2) {
    context += `- With ${recoveryBoost.length} recovery supplements, user may recover faster between sessions.\n`;
  }

  if (hasCreatine) {
    context += `- **Creatine user**: Can handle higher intensity work. ATP support for explosive efforts.\n`;
  }

  if (hasCaffeine) {
    context += `- **Caffeine user**: Performs better with adequate pre-workout timing. Avoid intense evening sessions.\n`;
  }

  context += `\n*Note: Individual responses vary. Build volume progressively, not dramatically.*\n`;

  return context;
}
