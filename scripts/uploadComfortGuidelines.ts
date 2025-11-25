import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import comfortGuidelines from "../data/comfort_guidelines.seed.json" assert { type: "json" };

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://humorous-ox-302.convex.cloud";

async function uploadComfortGuidelines() {
  const client = new ConvexClient(CONVEX_URL);
  let count = 0;
  try {
    for (const entry of comfortGuidelines as any[]) {
      // Store in sexSpecificGuidelines as neutral with goal/experience null to reuse pipeline
      await client.mutation(api.mutations.upsertSexSpecificGuideline, {
        sex: "neutral",
        goal: null,
        experience: null,
        guidelines: entry.guidelines,
        recommended_exercises: entry.alternatives || [],
        contraindications: [],
        evidence_level: "low",
        source: entry.source,
        last_reviewed: entry.last_reviewed,
      });
      count++;
      console.log(`  ✓ Upserted: ${entry.tag || 'comfort guideline'}`);
    }
    console.log(`\n✅ Uploaded comfort guidelines as neutral sex guidelines: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Upload failed", err);
    process.exit(1);
  }
}

uploadComfortGuidelines();
