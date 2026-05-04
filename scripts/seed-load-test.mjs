// Load-test seed script
// Usage:
//   node scripts/seed-load-test.mjs                          ← auto-picks gym (errors if multiple)
//   node scripts/seed-load-test.mjs --gym-id <uuid>          ← use specific gym
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from apps/admin/.env.local

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Env loading ────────────────────────────────────────────────────────────
function loadEnv() {
  const paths = [
    resolve(ROOT, "apps/admin/.env.local"),
    resolve(ROOT, ".env.local"),
  ];
  for (const p of paths) {
    try {
      const text = readFileSync(p, "utf8");
      const env = {};
      for (const line of text.split("\n")) {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (m) env[m[1]] = m[2].trim();
      }
      if (env.NEXT_PUBLIC_SUPABASE_URL) return env;
    } catch {}
  }
  throw new Error("Could not find .env.local — tried apps/admin/.env.local and .env.local");
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
if (!SERVICE_KEY) {
  console.error([
    "✗ Missing SUPABASE_SERVICE_ROLE_KEY in apps/admin/.env.local",
    "",
    "  Add this line to apps/admin/.env.local:",
    "  SUPABASE_SERVICE_ROLE_KEY=eyJ...",
    "",
    "  Get it from: Supabase dashboard → Project Settings → API → service_role key",
  ].join("\n"));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Config ─────────────────────────────────────────────────────────────────
const TOTAL_PLAYERS = 500;
const BATCH_SIZE = 100;

const PLANS_SEED = [
  { name: "لياقة - شهري",          exercise_type: "fitness",      duration_months: 1,  price: 25000 },
  { name: "لياقة - ربع سنوي",      exercise_type: "fitness",      duration_months: 3,  price: 65000 },
  { name: "لياقة - نصف سنوي",      exercise_type: "fitness",      duration_months: 6,  price: 120000 },
  { name: "لياقة - سنوي",          exercise_type: "fitness",      duration_months: 12, price: 220000 },
  { name: "بناء جسم - شهري",       exercise_type: "bodybuilding", duration_months: 1,  price: 35000 },
  { name: "بناء جسم - ربع سنوي",   exercise_type: "bodybuilding", duration_months: 3,  price: 90000 },
  { name: "بناء جسم - نصف سنوي",   exercise_type: "bodybuilding", duration_months: 6,  price: 160000 },
  { name: "بناء جسم - سنوي",       exercise_type: "bodybuilding", duration_months: 12, price: 300000 },
];

const FIRST_NAMES = [
  "علي", "أحمد", "محمد", "عمر", "حسن", "حسين", "مصطفى", "يوسف", "إبراهيم", "خالد",
  "زيد", "سامر", "كريم", "ليث", "نور", "عبدالله", "طارق", "رامي", "فارس", "ماهر",
  "سارة", "نور", "زينب", "رنا", "لارا", "هدى", "مريم", "دانا", "ريم", "سلمى",
];

const LAST_NAMES = [
  "الحسن", "الأحمد", "الكريم", "العلي", "الجابر", "النجار", "السعيد",
  "الطائي", "الزبيدي", "الربيعي", "الشمري", "العبيدي", "الجنابي", "الدليمي",
];

// ── Helpers ────────────────────────────────────────────────────────────────
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function subMonths(dateStr, months) {
  return addMonths(dateStr, -months);
}

function randomPhone() {
  const prefixes = ["0770", "0771", "0772", "0773", "0780", "0781", "0782", "0783", "0790", "0791"];
  const suffix = String(randInt(1000000, 9999999));
  return `${rand(prefixes)}${suffix}`;
}

function pickEndDate(today) {
  const roll = Math.random();
  if (roll < 0.60) return addDays(today, randInt(1, 365));      // active
  if (roll < 0.75) return addDays(today, randInt(0, 7));        // expiring
  return addDays(today, -randInt(1, 180));                      // expired
}

// ── CLI args ───────────────────────────────────────────────────────────────
const cliArgs = process.argv.slice(2);
const gymIdArgIdx = cliArgs.indexOf("--gym-id");
const CLI_GYM_ID = gymIdArgIdx !== -1 ? cliArgs[gymIdArgIdx + 1] : null;

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // 1. Resolve gym
  let gym;

  if (CLI_GYM_ID) {
    const { data, error } = await supabase
      .from("gyms").select("id, name").eq("id", CLI_GYM_ID).single();
    if (error || !data) {
      console.error(`✗ Gym not found for id: ${CLI_GYM_ID}`);
      process.exit(1);
    }
    gym = data;
  } else {
    const { data: allGyms, error: gymErr } = await supabase
      .from("gyms").select("id, name, status").order("created_at");
    if (gymErr) throw gymErr;

    const activeGyms = (allGyms ?? []).filter((g) => g.status === "active");
    if (activeGyms.length === 0) {
      console.error("✗ No active gym found. Create and approve a gym first.");
      process.exit(1);
    }
    if (activeGyms.length > 1) {
      console.error("✗ Multiple active gyms found. Specify which one with --gym-id:\n");
      activeGyms.forEach((g) => console.error(`  ${g.name.padEnd(30)}  ${g.id}`));
      console.error("\nExample:\n  node scripts/seed-load-test.mjs --gym-id <id>\n");
      process.exit(1);
    }
    gym = activeGyms[0];
  }

  console.log(`✓ Gym: ${gym.name} (${gym.id})`);

  // 2. Insert plans — skip any that already exist by name
  const { data: existingPlans, error: existErr } = await supabase
    .from("subscription_plans")
    .select("name")
    .eq("gym_id", gym.id);

  if (existErr) throw existErr;

  const existingNames = new Set((existingPlans ?? []).map((p) => p.name));
  const newPlans = PLANS_SEED
    .filter((p) => !existingNames.has(p.name))
    .map((p) => ({ ...p, gym_id: gym.id, is_active: true }));

  if (newPlans.length > 0) {
    const { error: planErr } = await supabase.from("subscription_plans").insert(newPlans);
    if (planErr) throw planErr;
    console.log(`✓ ${newPlans.length} new plans inserted`);
  } else {
    console.log(`✓ Plans already exist — skipped`);
  }

  // Fetch all active plans for this gym
  const { data: allPlans, error: fetchErr } = await supabase
    .from("subscription_plans")
    .select("id, name, exercise_type, duration_months, price")
    .eq("gym_id", gym.id)
    .eq("is_active", true);

  if (fetchErr) throw fetchErr;

  const fitPlans = allPlans.filter((p) => p.exercise_type === "fitness");
  const bbPlans  = allPlans.filter((p) => p.exercise_type === "bodybuilding");

  if (fitPlans.length === 0 || bbPlans.length === 0) {
    console.error("✗ Need at least one fitness and one bodybuilding plan.");
    process.exit(1);
  }

  // 3. Insert players in batches
  const today = new Date().toISOString().slice(0, 10);
  const batches = Math.ceil(TOTAL_PLAYERS / BATCH_SIZE);

  for (let b = 0; b < batches; b++) {
    const batchStart = b * BATCH_SIZE + 1;
    const batchEnd   = Math.min((b + 1) * BATCH_SIZE, TOTAL_PLAYERS);
    const batchSize  = batchEnd - batchStart + 1;

    const rows = [];
    for (let i = 0; i < batchSize; i++) {
      const exerciseType = Math.random() < 0.5 ? "fitness" : "bodybuilding";
      const plan = exerciseType === "fitness" ? rand(fitPlans) : rand(bbPlans);
      const endDate   = pickEndDate(today);
      const startDate = subMonths(endDate, plan.duration_months);

      rows.push({
        gym_id:            gym.id,
        name:              `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`,
        phone:             randomPhone(),
        email:             null,
        notes:             null,
        exercise_type:     exerciseType,
        plan_id:           plan.id,
        subscription_type: plan.name,
        start_date:        startDate,
        end_date:          endDate,
        amount_paid:       plan.price,
      });
    }

    const { error: insertErr } = await supabase.from("players").insert(rows);
    if (insertErr) throw insertErr;

    console.log(`✓ Batch ${b + 1}/${batches} — players ${batchStart}–${batchEnd} inserted`);
  }

  console.log(`\n✓ Done. ${TOTAL_PLAYERS} players seeded for "${gym.name}".`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err.message ?? err);
  process.exit(1);
});
