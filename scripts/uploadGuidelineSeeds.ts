/**
 * Upload Guideline Seed Data to Convex Database
 * 
 * This script reads seed JSON files and uploads them to Convex using upsert mutations.
 * 
 * Usage:
 * 1. Set Convex URL: export VITE_CONVEX_URL="https://your-deployment.convex.cloud"
 * 2. Run: npx tsx scripts/uploadGuidelineSeeds.ts
 * 3. Verify counts in Convex dashboard
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Get Convex URL from environment variable
const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  console.error('❌ Error: VITE_CONVEX_URL or CONVEX_URL environment variable not set!');
  console.error('   Set it with: export VITE_CONVEX_URL="https://your-deployment.convex.cloud"');
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

interface SexSpecificGuideline {
  sex: "male" | "female" | "other" | "neutral";
  goal?: string | null;
  experience?: string | null;
  guidelines: string[];
  recommended_exercises?: string[];
  contraindications?: string[];
  evidence_level?: "high" | "moderate" | "low" | null;
  source?: string;
  last_reviewed?: string;
}

interface SportGuideline {
  sport: string;
  goal?: string | null;
  experience?: string | null;
  movement_priorities: string[];
  top_exercises: string[];
  conditioning_notes?: string[];
  contraindications?: string[];
  evidence_level?: "high" | "moderate" | "low" | null;
  source?: string;
  last_reviewed?: string;
}

interface BodyContextGuideline {
  band: string;
  athletic_level?: "low" | "moderate" | "high" | null;
  body_type?: "lean" | "average" | "muscular" | null;
  guidelines: string[];
  recommended_modalities?: string[];
  avoid?: string[];
  evidence_level?: "high" | "moderate" | "low" | null;
  source?: string;
  last_reviewed?: string;
}

/**
 * Load and parse JSON seed file
 */
function loadSeedFile<T>(filePath: string): T[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error('Seed file must contain a JSON array');
    }
    return parsed as T[];
  } catch (error) {
    console.error(`❌ Failed to load ${filePath}:`, error);
    throw error;
  }
}

/**
 * Upload sex-specific guidelines
 */
async function uploadSexSpecificGuidelines(): Promise<{ uploaded: number; failed: number }> {
  const filePath = join(process.cwd(), 'data', 'sex_specific_guidelines.seed.json');
  console.log(`\n📋 Loading sex-specific guidelines from: ${filePath}`);
  
  const guidelines = loadSeedFile<SexSpecificGuideline>(filePath);
  console.log(`   Found ${guidelines.length} guidelines to upload`);
  
  let uploaded = 0;
  let failed = 0;
  
  for (const guideline of guidelines) {
    try {
      await client.mutation(api.mutations.upsertSexSpecificGuideline, {
        sex: guideline.sex,
        goal: guideline.goal || null,
        experience: guideline.experience || null,
        guidelines: guideline.guidelines,
        recommended_exercises: guideline.recommended_exercises || [],
        contraindications: guideline.contraindications || [],
        evidence_level: guideline.evidence_level || null,
        source: guideline.source || null,
        last_reviewed: guideline.last_reviewed || null,
      });
      uploaded++;
      console.log(`   ✓ Upserted: ${guideline.sex} / ${guideline.goal || 'any'} / ${guideline.experience || 'any'}`);
    } catch (error) {
      console.error(`   ✗ Failed to upsert guideline (${guideline.sex}):`, error);
      failed++;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { uploaded, failed };
}

/**
 * Upload sport-specific guidelines
 */
async function uploadSportGuidelines(): Promise<{ uploaded: number; failed: number }> {
  const filePath = join(process.cwd(), 'data', 'sport_guidelines.seed.json');
  console.log(`\n🏃 Loading sport-specific guidelines from: ${filePath}`);
  
  const guidelines = loadSeedFile<SportGuideline>(filePath);
  console.log(`   Found ${guidelines.length} guidelines to upload`);
  
  let uploaded = 0;
  let failed = 0;
  
  for (const guideline of guidelines) {
    try {
      await client.mutation(api.mutations.upsertSportGuideline, {
        sport: guideline.sport,
        goal: guideline.goal || null,
        experience: guideline.experience || null,
        movement_priorities: guideline.movement_priorities,
        top_exercises: guideline.top_exercises,
        conditioning_notes: guideline.conditioning_notes || [],
        contraindications: guideline.contraindications || [],
        evidence_level: guideline.evidence_level || null,
        source: guideline.source || null,
        last_reviewed: guideline.last_reviewed || null,
      });
      uploaded++;
      console.log(`   ✓ Upserted: ${guideline.sport} / ${guideline.goal || 'any'} / ${guideline.experience || 'any'}`);
    } catch (error) {
      console.error(`   ✗ Failed to upsert guideline (${guideline.sport}):`, error);
      failed++;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { uploaded, failed };
}

/**
 * Upload body context guidelines
 */
async function uploadBodyContextGuidelines(): Promise<{ uploaded: number; failed: number }> {
  const filePath = join(process.cwd(), 'data', 'body_context_guidelines.seed.json');
  console.log(`\n🏋️ Loading body context guidelines from: ${filePath}`);
  
  const guidelines = loadSeedFile<BodyContextGuideline>(filePath);
  console.log(`   Found ${guidelines.length} guidelines to upload`);
  
  let uploaded = 0;
  let failed = 0;
  
  for (const guideline of guidelines) {
    try {
      await client.mutation(api.mutations.upsertBodyContextGuideline, {
        band: guideline.band,
        athletic_level: guideline.athletic_level || null,
        body_type: guideline.body_type || null,
        guidelines: guideline.guidelines,
        recommended_modalities: guideline.recommended_modalities || [],
        avoid: guideline.avoid || [],
        evidence_level: guideline.evidence_level || null,
        source: guideline.source || null,
        last_reviewed: guideline.last_reviewed || null,
      });
      uploaded++;
      console.log(`   ✓ Upserted: ${guideline.band} / ${guideline.athletic_level || 'any'} / ${guideline.body_type || 'any'}`);
    } catch (error) {
      console.error(`   ✗ Failed to upsert guideline (${guideline.band}):`, error);
      failed++;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { uploaded, failed };
}

/**
 * Main execution
 */
async function main() {
  console.log('🌱 Upload Guideline Seed Data to Convex\n');
  console.log(`📡 Convex URL: ${convexUrl}\n`);
  
  try {
    // Upload sex-specific guidelines
    const sexResults = await uploadSexSpecificGuidelines();
    
    // Upload sport-specific guidelines
    const sportResults = await uploadSportGuidelines();
    
    // Upload body context guidelines
    const bodyResults = await uploadBodyContextGuidelines();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n📋 Sex-Specific Guidelines:`);
    console.log(`   ✅ Uploaded: ${sexResults.uploaded}`);
    console.log(`   ❌ Failed: ${sexResults.failed}`);
    
    console.log(`\n🏃 Sport-Specific Guidelines:`);
    console.log(`   ✅ Uploaded: ${sportResults.uploaded}`);
    console.log(`   ❌ Failed: ${sportResults.failed}`);
    
    console.log(`\n🏋️ Body Context Guidelines:`);
    console.log(`   ✅ Uploaded: ${bodyResults.uploaded}`);
    console.log(`   ❌ Failed: ${bodyResults.failed}`);
    
    const totalUploaded = sexResults.uploaded + sportResults.uploaded + bodyResults.uploaded;
    const totalFailed = sexResults.failed + sportResults.failed + bodyResults.failed;
    
    console.log(`\n📈 Total:`);
    console.log(`   ✅ Uploaded: ${totalUploaded}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    
    if (totalFailed === 0) {
      console.log('\n✅ All guidelines uploaded successfully!');
    } else {
      console.log('\n⚠️  Some guidelines failed to upload. Check errors above.');
      process.exit(1);
    }
    
    console.log('\n📝 Next steps:');
    console.log('   1. Verify counts in Convex dashboard');
    console.log('   2. Test plan generation with personalization features');
    console.log('   3. Extend seed files with more curated entries as needed');
    
  } catch (error) {
    console.error('\n❌ Fatal error during upload:', error);
    process.exit(1);
  }
}

// Run if executed directly (ES module syntax)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('uploadGuidelineSeeds.ts')) {
  main().catch(console.error);
}

export { uploadSexSpecificGuidelines, uploadSportGuidelines, uploadBodyContextGuidelines };
