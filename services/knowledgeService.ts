import { convex } from '../convexClient';
import { api } from '../convex/_generated/api';

// Simple in-memory cache keyed by profile hash to reduce repeated fetches
const guidelineCache = new Map<string, { sex: string[]; sport: string[]; body: string[]; injury: string[] }>();

const compressGuidelines = (items: any[], fields: string[], limit = 6) => {
  const bullets: string[] = [];
  for (const item of items || []) {
    for (const f of fields) {
      const val = (item as any)[f];
      if (Array.isArray(val)) {
        bullets.push(...val.filter(Boolean).slice(0, 3));
      }
    }
  }
  return bullets.slice(0, limit);
};

export async function fetchGuidelineConstraints(opts: {
  sex?: string;
  goal?: string;
  experience?: string;
  sport?: string;
  bmiBand?: string;
  athleticLevel?: string;
  bodyType?: string;
  painPoints?: string[];
}) {
  const key = JSON.stringify(opts);
  if (guidelineCache.has(key)) {
    return guidelineCache.get(key)!;
  }

  const { sex, goal, experience, sport, bmiBand, athleticLevel, bodyType, painPoints } = opts;

  const [sexGuidelines, sportGuidelines, bodyGuidelines, injuryProtocols] = await Promise.all([
    sex
      ? convex.query(api.queries.getSexSpecificGuidelines, { sex, goal, experience })
      : Promise.resolve([]),
    sport
      ? convex.query(api.queries.getSportGuidelines, { sport, goal, experience })
      : Promise.resolve([]),
    convex.query(api.queries.getBodyContextGuidelines, {
      band: bmiBand,
      athletic_level: athleticLevel as any,
      body_type: bodyType as any,
    }),
    painPoints && painPoints.length > 0
      ? convex.query(api.queries.getInjuryProtocols, { issue: painPoints[0] }) // simple: first pain point
      : Promise.resolve([]),
  ]);

  const sexBullets = compressGuidelines(sexGuidelines, ['guidelines', 'recommended_exercises', 'contraindications']);
  const sportBullets = compressGuidelines(sportGuidelines, ['movement_priorities', 'top_exercises', 'conditioning_notes', 'contraindications']);
  const bodyBullets = compressGuidelines(bodyGuidelines, ['guidelines', 'recommended_modalities', 'avoid']);
  const injuryBullets = compressGuidelines(injuryProtocols as any[], ['injury_protocols', 'exercises_to_avoid', 'exercise_substitutions']);

  const constraints = { sex: sexBullets, sport: sportBullets, body: bodyBullets, injury: injuryBullets };
  guidelineCache.set(key, constraints);
  return constraints;
}
