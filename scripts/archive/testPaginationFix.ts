/**
 * Test script to verify pagination fix logic
 * Simulates the infinite loop scenario
 */

// Simulate the pagination logic
function testPaginationLogic() {
  console.log("🧪 Testing pagination fix logic...\n");
  
  let allExercises: any[] = [];
  const seenIds = new Set<string>();
  let cursor: string | null = null;
  let hasMore = true;
  let iterations = 0;
  const maxIterations = 100;
  let stuckCount = 0;
  
  // Simulate getting duplicate exercises repeatedly
  const mockResults = [
    { exercises: Array.from({length: 100}, (_, i) => ({ exercise_name: `exercise_${i}`, _id: `id_${i}` })), continueCursor: "cursor1" },
    { exercises: Array.from({length: 100}, (_, i) => ({ exercise_name: `exercise_${i}`, _id: `id_${i}` })), continueCursor: "cursor2" }, // Same exercises, different cursor
    { exercises: Array.from({length: 100}, (_, i) => ({ exercise_name: `exercise_${i}`, _id: `id_${i}` })), continueCursor: "cursor3" }, // Same exercises again
  ];
  
  let resultIndex = 0;
  
  while (hasMore && iterations < maxIterations) {
    iterations++;
    
    // Simulate query result
    const result = mockResults[resultIndex % mockResults.length];
    resultIndex++;
    
    // Deduplicate
    const newExercises = result.exercises.filter((ex: any) => {
      const id = ex.exercise_name || ex._id;
      if (seenIds.has(id)) {
        return false;
      }
      seenIds.add(id);
      return true;
    });
    
    // If we didn't get any new exercises, increment stuck counter
    if (newExercises.length === 0) {
      stuckCount++;
      console.log(`  ⚠️  No new exercises in batch (${stuckCount} consecutive). Got ${result.exercises.length} exercises, all duplicates.`);
      
      // If we're stuck for 2+ iterations, stop - we've seen everything
      if (stuckCount >= 2) {
        console.log(`  ✅ Stopping: No new exercises for ${stuckCount} consecutive iterations. Collected ${allExercises.length} unique exercises.`);
        hasMore = false;
        break;
      }
      
      // Still update cursor and continue (might be a gap in pagination)
      cursor = result.continueCursor || null;
      if (!cursor) {
        console.log(`  ✅ No more pages available. Collected ${allExercises.length} unique exercises.`);
        hasMore = false;
        break;
      }
      continue; // Skip adding duplicates, but try next page
    }
    
    // Reset stuck counter when we get new exercises
    stuckCount = 0;
    allExercises = allExercises.concat(newExercises);
    
    const currentCount = allExercises.length;
    
    // Update cursor
    cursor = result.continueCursor || null;
    
    // Stop if cursor is null or undefined (no more pages)
    if (!cursor) {
      console.log(`  ✅ No more pages available. Collected ${currentCount} unique exercises.`);
      hasMore = false;
      break;
    }
    
    console.log(`  Fetched ${currentCount} exercises so far... (iteration ${iterations}, ${newExercises.length} new, ${result.exercises.length} total in batch, cursor: ${cursor ? 'yes' : 'no'})`);
  }
  
  console.log(`\n✅ Test complete!`);
  console.log(`   Total iterations: ${iterations}`);
  console.log(`   Unique exercises collected: ${allExercises.length}`);
  console.log(`   Stopped due to stuck detection: ${stuckCount >= 2 ? 'YES ✅' : 'NO'}`);
  
  if (iterations >= maxIterations) {
    console.log(`   ⚠️  Hit max iterations limit`);
    return false;
  }
  
  if (stuckCount >= 2) {
    console.log(`   ✅ Correctly detected infinite loop and stopped`);
    return true;
  }
  
  return true;
}

testPaginationLogic();

