/**
 * Fill injuryProtocols table with injury management and prehab protocols
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

const INJURY_PROTOCOLS = [
  {
    issue: "knee_pain",
    book_source: "Low Back Disorders (McGill) & Rehabilitation of the Spine",
    exercises_to_avoid: [
      { exercise: "deep_squat", reason: "Excessive knee flexion increases patellofemoral stress" },
      { exercise: "box_jump", reason: "High impact landing forces" },
      { exercise: "leg_extension", reason: "Isolated quad loading without hamstring co-contraction" },
      { exercise: "pistol_squat", reason: "Extreme single-leg loading" }
    ],
    exercise_substitutions: [
      { from: "barbell_back_squat", to: "leg_press", reason: "Reduces shear forces on knee" },
      { from: "lunge", to: "step_ups", reason: "Controlled depth and eccentric loading" },
      { from: "box_jump", to: "box_step_ups", reason: "Eliminates impact forces" }
    ],
    prehab_exercises: [
      { exercise: "terminal_knee_extension", sets: 3, reps: 15, notes: "VMO activation" },
      { exercise: "single_leg_balance", sets: 3, duration_s: 30, notes: "Proprioception" },
      { exercise: "clamshell", sets: 3, reps: 20, notes: "Hip external rotation strength" },
      { exercise: "glute_bridge", sets: 3, reps: 15, notes: "Glute activation" }
    ],
    warning_signs: [
      "Sharp pain during movement",
      "Swelling or warmth around knee joint",
      "Locking or catching sensation",
      "Pain that worsens with stairs or squatting"
    ],
    when_to_progress: "Pain-free during bodyweight movements for 2 weeks, full range of motion restored",
    when_to_regress: "Any sharp pain, swelling, or loss of range of motion"
  },
  {
    issue: "lower_back_pain",
    book_source: "Low Back Disorders (Stuart McGill)",
    exercises_to_avoid: [
      { exercise: "deadlift", reason: "High spinal compression and shear forces" },
      { exercise: "good_morning", reason: "Flexion moment on lumbar spine" },
      { exercise: "sit_up", reason: "Repeated spinal flexion under load" },
      { exercise: "jefferson_curl", reason: "Loaded spinal flexion" }
    ],
    exercise_substitutions: [
      { from: "deadlift", to: "hip_thrust", reason: "Hip extension without spinal loading" },
      { from: "back_squat", to: "goblet_squat", reason: "More upright torso position" },
      { from: "bent_over_row", to: "chest_supported_row", reason: "Eliminates spinal stabilization demand" }
    ],
    prehab_exercises: [
      { exercise: "mcgill_curl_up", sets: 3, reps: 10, notes: "Anti-extension core stability" },
      { exercise: "side_plank", sets: 3, duration_s: 30, notes: "Lateral stability" },
      { exercise: "bird_dog", sets: 3, reps: 10, notes: "Anti-rotation and stability" },
      { exercise: "dead_bug", sets: 3, reps: 10, notes: "Core bracing with limb movement" },
      { exercise: "cat_cow", sets: 2, reps: 10, notes: "Spinal mobility" }
    ],
    warning_signs: [
      "Radiating pain down leg (sciatica)",
      "Numbness or tingling in legs",
      "Loss of bowel or bladder control (emergency)",
      "Pain that worsens with prolonged sitting or standing"
    ],
    when_to_progress: "Pain-free core bracing, no pain with daily activities for 2 weeks",
    when_to_regress: "Any radiating pain, increased stiffness, or pain during basic movements"
  },
  {
    issue: "shoulder_impingement",
    book_source: "The Shoulder (Rockwood & Matsen)",
    exercises_to_avoid: [
      { exercise: "overhead_press", reason: "Narrows subacromial space under load" },
      { exercise: "upright_row", reason: "Internal rotation with abduction" },
      { exercise: "behind_neck_press", reason: "Extreme shoulder external rotation" },
      { exercise: "dips", reason: "Can cause anterior shoulder stress" }
    ],
    exercise_substitutions: [
      { from: "overhead_press", to: "landmine_press", reason: "Scapular plane pressing" },
      { from: "pull_up", to: "lat_pulldown", reason: "Controlled range of motion" },
      { from: "bench_press", to: "floor_press", reason: "Limited shoulder extension" }
    ],
    prehab_exercises: [
      { exercise: "face_pull", sets: 3, reps: 15, notes: "Posterior delt and external rotation" },
      { exercise: "band_pull_apart", sets: 3, reps: 20, notes: "Scapular retraction" },
      { exercise: "external_rotation", sets: 3, reps: 15, notes: "Rotator cuff strength" },
      { exercise: "scapular_wall_slide", sets: 3, reps: 10, notes: "Scapular upward rotation" },
      { exercise: "sleeper_stretch", sets: 2, duration_s: 30, notes: "Internal rotation mobility" }
    ],
    warning_signs: [
      "Pain at night when lying on affected shoulder",
      "Catching or popping sensation",
      "Weakness in arm elevation",
      "Pain with overhead activities"
    ],
    when_to_progress: "Full pain-free range of motion, rotator cuff strength restored",
    when_to_regress: "Sharp pain with overhead movements, night pain returns"
  },
  {
    issue: "hip_impingement",
    book_source: "Athletic Body in Balance (Gray Cook)",
    exercises_to_avoid: [
      { exercise: "deep_squat", reason: "Excessive hip flexion" },
      { exercise: "pistol_squat", reason: "Extreme hip flexion under load" },
      { exercise: "sumo_deadlift", reason: "Wide stance with deep hip flexion" },
      { exercise: "pigeon_pose", reason: "Deep hip external rotation" }
    ],
    exercise_substitutions: [
      { from: "deep_squat", to: "box_squat", reason: "Controls depth at parallel" },
      { from: "bulgarian_split_squat", to: "reverse_lunge", reason: "Reduces hip flexion angle" },
      { from: "sumo_deadlift", to: "trap_bar_deadlift", reason: "More neutral hip position" }
    ],
    prehab_exercises: [
      { exercise: "hip_flexor_stretch", sets: 3, duration_s: 30, notes: "Anterior hip mobility" },
      { exercise: "clamshell", sets: 3, reps: 20, notes: "Hip external rotation strength" },
      { exercise: "glute_bridge", sets: 3, reps: 15, notes: "Glute activation" },
      { exercise: "90_90_hip_stretch", sets: 2, duration_s: 60, notes: "Hip mobility" },
      { exercise: "fire_hydrant", sets: 3, reps: 15, notes: "Hip abduction" }
    ],
    warning_signs: [
      "Pinching sensation in front of hip",
      "Clicking or catching in hip joint",
      "Pain with deep squatting or sitting",
      "Groin pain"
    ],
    when_to_progress: "Pain-free hip flexion to 90 degrees, no pinching sensation",
    when_to_regress: "Sharp pinching pain, reduced range of motion"
  },
  {
    issue: "ankle_instability",
    book_source: "Strength Training Anatomy (Delavier)",
    exercises_to_avoid: [
      { exercise: "box_jump", reason: "High impact landing forces on unstable ankle" },
      { exercise: "single_leg_exercises", reason: "Balance challenge on unstable joint" },
      { exercise: "depth_jump", reason: "Rapid stretch-shortening cycle stress" }
    ],
    exercise_substitutions: [
      { from: "box_jump", to: "box_step_up", reason: "Eliminates landing impact" },
      { from: "single_leg_rdl", to: "romanian_deadlift", reason: "Bilateral stance" },
      { from: "lunge", to: "leg_press", reason: "Machine stability" }
    ],
    prehab_exercises: [
      { exercise: "single_leg_balance", sets: 3, duration_s: 30, notes: "Proprioception" },
      { exercise: "ankle_alphabet", sets: 2, reps: 1, notes: "Range of motion" },
      { exercise: "calf_raise", sets: 3, reps: 20, notes: "Ankle plantarflexor strength" },
      { exercise: "resistance_band_dorsiflexion", sets: 3, reps: 15, notes: "Anterior tibialis strength" },
      { exercise: "bosu_ball_balance", sets: 3, duration_s: 30, notes: "Dynamic stability" }
    ],
    warning_signs: [
      "Ankle giving way during activities",
      "Chronic swelling",
      "Recurrent sprains",
      "Pain with walking on uneven surfaces"
    ],
    when_to_progress: "Single-leg balance for 30+ seconds without wobbling, no pain",
    when_to_regress: "Ankle gives way, swelling increases, or pain returns"
  },
  {
    issue: "elbow_tendonitis",
    book_source: "Overcoming Tendonitis (Baar)",
    exercises_to_avoid: [
      { exercise: "heavy_pull_ups", reason: "High elbow flexor load" },
      { exercise: "barbell_curl", reason: "Isolated bicep tension" },
      { exercise: "tricep_extension", reason: "Isolated tricep tension" },
      { exercise: "close_grip_bench", reason: "High tricep load at long muscle length" }
    ],
    exercise_substitutions: [
      { from: "pull_up", to: "lat_pulldown", reason: "Controlled load" },
      { from: "barbell_curl", to: "hammer_curl", reason: "Neutral grip reduces strain" },
      { from: "skull_crusher", to: "overhead_tricep_extension", reason: "Different tension angle" }
    ],
    prehab_exercises: [
      { exercise: "eccentric_wrist_curl", sets: 3, reps: 15, notes: "Slow eccentric for tendon loading" },
      { exercise: "reverse_wrist_curl", sets: 3, reps: 15, notes: "Extensor strength" },
      { exercise: "forearm_pronation_supination", sets: 3, reps: 20, notes: "Rotational strength" },
      { exercise: "bicep_stretch", sets: 2, duration_s: 30, notes: "Maintain mobility" },
      { exercise: "tricep_stretch", sets: 2, duration_s: 30, notes: "Maintain mobility" }
    ],
    warning_signs: [
      "Pain on outside of elbow (tennis elbow)",
      "Pain on inside of elbow (golfer's elbow)",
      "Weakness in grip strength",
      "Pain with gripping or lifting"
    ],
    when_to_progress: "Pain-free grip strength, no pain during daily activities for 2 weeks",
    when_to_regress: "Increased pain with gripping, weakness, or swelling"
  },
  {
    issue: "wrist_pain",
    book_source: "Functional Training Handbook (Boyle)",
    exercises_to_avoid: [
      { exercise: "front_squat", reason: "Extended wrist position under heavy load" },
      { exercise: "push_up", reason: "Hyperextended wrist with bodyweight" },
      { exercise: "handstand_push_up", reason: "Extreme wrist extension" }
    ],
    exercise_substitutions: [
      { from: "front_squat", to: "back_squat", reason: "Eliminates wrist extension" },
      { from: "push_up", to: "push_up_on_dumbbells", reason: "Neutral wrist position" },
      { from: "barbell_bench", to: "dumbbell_bench", reason: "Allows wrist freedom" }
    ],
    prehab_exercises: [
      { exercise: "wrist_flexion_stretch", sets: 3, duration_s: 30, notes: "Extensor flexibility" },
      { exercise: "wrist_extension_stretch", sets: 3, duration_s: 30, notes: "Flexor flexibility" },
      { exercise: "wrist_curl", sets: 3, reps: 15, notes: "Flexor strength" },
      { exercise: "reverse_wrist_curl", sets: 3, reps: 15, notes: "Extensor strength" },
      { exercise: "wrist_rotation", sets: 2, reps: 10, notes: "Mobility" }
    ],
    warning_signs: [
      "Sharp pain with wrist extension or flexion",
      "Clicking or popping in wrist",
      "Weakness in grip",
      "Swelling around wrist joint"
    ],
    when_to_progress: "Full pain-free range of motion, normal grip strength",
    when_to_regress: "Increased pain, swelling, or reduced range of motion"
  },
  {
    issue: "rotator_cuff",
    book_source: "The Shoulder (Rockwood & Matsen)",
    exercises_to_avoid: [
      { exercise: "overhead_press", reason: "High rotator cuff load in overhead position" },
      { exercise: "bench_press", reason: "Anterior shoulder stress" },
      { exercise: "behind_neck_press", reason: "Extreme shoulder external rotation" }
    ],
    exercise_substitutions: [
      { from: "overhead_press", to: "landmine_press", reason: "Scapular plane" },
      { from: "bench_press", to: "floor_press", reason: "Limited range prevents excessive stretch" },
      { from: "pull_up", to: "lat_pulldown", reason: "Controlled movement" }
    ],
    prehab_exercises: [
      { exercise: "external_rotation", sets: 3, reps: 15, notes: "Rotator cuff strength" },
      { exercise: "internal_rotation", sets: 3, reps: 15, notes: "Balanced rotator cuff" },
      { exercise: "scapular_wall_slide", sets: 3, reps: 10, notes: "Scapular control" },
      { exercise: "face_pull", sets: 3, reps: 15, notes: "Posterior shoulder" },
      { exercise: "band_pull_apart", sets: 3, reps: 20, notes: "Scapular retraction" }
    ],
    warning_signs: [
      "Night pain",
      "Weakness in arm elevation",
      "Popping or clicking",
      "Pain with overhead activities"
    ],
    when_to_progress: "Pain-free overhead range of motion, rotator cuff strength restored",
    when_to_regress: "Return of night pain, weakness, or sharp pain"
  }
];

async function fillInjuryProtocols() {
  console.log("🏥 Filling injury protocols table...\n");

  let count = 0;

  for (const protocol of INJURY_PROTOCOLS) {
    try {
      await convex.mutation(api.mutations.saveInjuryProtocol, protocol);
      count++;
      console.log(`✅ [${count}/${INJURY_PROTOCOLS.length}] ${protocol.issue}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error adding ${protocol.issue}:`, error);
    }
  }

  console.log(`\n✨ Injury protocols complete: ${count} entries added`);
}

fillInjuryProtocols()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
