import { parseWorkoutPlan } from '../services/geminiService';

async function testParsing() {
  const complexPlan = `
  Buy-in: 500m row
  
  Then, 21-15-9 RFT:
  - T2B
  - HSPU  
  - KB swings (53/35)
  
  Cash out: 100 DU
  
  Daily Morning Routine:
  - Cat-Cow × 10
  - Hip Circles × 10 each way
  - Arm Circles × 10 each way
  `;

  try {
    console.log('🔍 Testing enhanced parsing...\n');
    console.log('Input plan:', complexPlan);
    
    const parsed = await parseWorkoutPlan(complexPlan, false);
    
    console.log('\n✅ Parsed successfully!');
    console.log('\nWeekly plan days:', parsed.weeklyPlan.length);
    console.log('First day blocks:', parsed.weeklyPlan[0]?.blocks.length);
    
    // Check if warmup block was created
    const warmupBlock = parsed.weeklyPlan[0]?.blocks.find(b => 
      b.exercises.some(e => e.category === 'warmup')
    );
    console.log('Warmup block found:', !!warmupBlock);
    
    // Check if abbreviations were handled
    const exerciseNames = parsed.weeklyPlan[0]?.blocks.flatMap(b => 
      b.exercises.map(e => e.exercise_name)
    );
    console.log('Exercise names:', exerciseNames);
    
  } catch (error) {
    console.error('❌ Parsing failed:', error);
  }
}

testParsing();
