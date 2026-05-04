// Fix script — move seeded players + plans from wrong gym_id to correct gym_id
//
// Step 1 — list gyms:
//   node scripts/fix-gym-seed.mjs
//
// Step 2 — move data:
//   node scripts/fix-gym-seed.mjs --from <wrong-gym-id> --to <correct-gym-id>

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

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
  throw new Error("Could not find .env.local");
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Parse --from and --to from CLI args
const args = process.argv.slice(2);
const fromIdx = args.indexOf("--from");
const toIdx   = args.indexOf("--to");
const FROM_GYM = fromIdx !== -1 ? args[fromIdx + 1] : null;
const TO_GYM   = toIdx   !== -1 ? args[toIdx + 1]   : null;

async function listGyms() {
  const { data, error } = await supabase
    .from("gyms")
    .select("id, name, status, city")
    .order("created_at");

  if (error) throw error;

  console.log("\nAll gyms in your database:\n");
  console.log("  #  Status      Name                          ID");
  console.log("  " + "─".repeat(75));
  data.forEach((g, i) => {
    const status = g.status.padEnd(10);
    const name   = (g.name + (g.city ? ` (${g.city})` : "")).padEnd(30);
    console.log(`  ${String(i + 1).padStart(2)}  ${status}  ${name}  ${g.id}`);
  });

  console.log("\nTo move seeded data, run:");
  console.log("  node scripts/fix-gym-seed.mjs --from <wrong-id> --to <correct-id>\n");
}

async function moveData(fromGym, toGym) {
  // Verify both gyms exist
  const { data: gyms } = await supabase
    .from("gyms")
    .select("id, name")
    .in("id", [fromGym, toGym]);

  const fromRecord = gyms?.find((g) => g.id === fromGym);
  const toRecord   = gyms?.find((g) => g.id === toGym);

  if (!fromRecord) { console.error(`✗ FROM gym not found: ${fromGym}`); process.exit(1); }
  if (!toRecord)   { console.error(`✗ TO gym not found: ${toGym}`);   process.exit(1); }

  console.log(`\nMoving data:`);
  console.log(`  FROM: ${fromRecord.name} (${fromGym})`);
  console.log(`  TO:   ${toRecord.name} (${toGym})\n`);

  // Count what we're about to move
  const [{ count: planCount }, { count: playerCount }] = await Promise.all([
    supabase.from("subscription_plans").select("*", { count: "exact", head: true }).eq("gym_id", fromGym),
    supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", fromGym),
  ]);

  console.log(`  Plans to move:   ${planCount}`);
  console.log(`  Players to move: ${playerCount}\n`);

  if (planCount === 0 && playerCount === 0) {
    console.log("Nothing to move — the FROM gym has no plans or players.");
    process.exit(0);
  }

  // Move subscription_plans first (players reference them via plan_id)
  if (planCount > 0) {
    const { error: planErr } = await supabase
      .from("subscription_plans")
      .update({ gym_id: toGym })
      .eq("gym_id", fromGym);
    if (planErr) throw planErr;
    console.log(`✓ ${planCount} subscription plans moved`);
  }

  // Move players
  if (playerCount > 0) {
    const { error: playerErr } = await supabase
      .from("players")
      .update({ gym_id: toGym })
      .eq("gym_id", fromGym);
    if (playerErr) throw playerErr;
    console.log(`✓ ${playerCount} players moved`);
  }

  console.log(`\n✓ Done. All data is now under "${toRecord.name}".`);
  console.log(`  Refresh your admin dashboard to see the data.\n`);
}

async function main() {
  if (!FROM_GYM && !TO_GYM) {
    await listGyms();
    return;
  }

  if (!FROM_GYM || !TO_GYM) {
    console.error("✗ Provide both --from <id> and --to <id>");
    process.exit(1);
  }

  if (FROM_GYM === TO_GYM) {
    console.error("✗ --from and --to are the same gym");
    process.exit(1);
  }

  await moveData(FROM_GYM, TO_GYM);
}

main().catch((err) => {
  console.error("✗ Failed:", err.message ?? err);
  process.exit(1);
});
