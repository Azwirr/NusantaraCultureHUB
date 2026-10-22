// Runs the migrations, the seed and the pgTAP suite against an in-memory
// Postgres (PGlite) with a small Supabase stand-in. No Docker needed, so it
// works in CI and on machines without WSL.
//
// The reference run is still `npm run test:db:supabase` (supabase test db)
// on a real local stack; this script mirrors its order: migrations, seed,
// then every file in supabase/tests/database in name order.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { pgtap } from "@electric-sql/pglite-pgtap";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(root, "supabase", "migrations");
const testsDir = path.join(root, "supabase", "tests", "database");

const read = (file) => readFile(file, "utf8");

async function sqlFiles(dir) {
  return (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();
}

function tapLines(results) {
  const lines = [];
  for (const result of results) {
    for (const row of result.rows ?? []) {
      for (const value of Object.values(row)) {
        if (typeof value === "string") lines.push(...value.split("\n"));
      }
    }
  }
  return lines.filter((line) => /^(ok|not ok) \d+|^1\.\.\d+|^\s*#/.test(line));
}

async function main() {
  const db = await PGlite.create({ extensions: { pgtap } });
  await db.exec(await read(path.join(root, "scripts", "pglite", "supabase-shim.sql")));
  await db.exec("set search_path to public, extensions;");

  for (const file of await sqlFiles(migrationsDir)) {
    try {
      await db.exec(await read(path.join(migrationsDir, file)));
      console.log(`migrated  ${file}`);
    } catch (error) {
      console.error(`FAILED migration ${file}: ${error.message}`);
      process.exit(1);
    }
  }

  try {
    await db.exec(await read(path.join(root, "supabase", "seed.sql")));
    console.log("seeded    supabase/seed.sql");
  } catch (error) {
    console.error(`FAILED seed: ${error.message}`);
    process.exit(1);
  }

  let failedFiles = 0;
  let totalTests = 0;
  for (const file of await sqlFiles(testsDir)) {
    let lines;
    try {
      // pg_prove gives every file a fresh session; pgTAP keeps its plan in
      // session temp tables, so drop them between files.
      await db.exec("discard temp;");
      lines = tapLines(await db.exec(await read(path.join(testsDir, file))));
    } catch (error) {
      await db.exec("rollback;").catch(() => {});
      console.error(`\nFAIL ${file}\n  error: ${error.message}`);
      failedFiles += 1;
      continue;
    }

    const results = lines.filter((line) => /^(ok|not ok) \d+/.test(line));
    const failures = results.filter((line) => line.startsWith("not ok"));
    const plan = lines.find((line) => /^1\.\.\d+/.test(line));
    const planned = plan ? Number(plan.slice(3)) : NaN;
    totalTests += results.length;

    if (failures.length || planned !== results.length) {
      failedFiles += 1;
      console.error(`\nFAIL ${file} (${results.length - failures.length}/${results.length} passed, plan ${plan ?? "missing"})`);
      // Print each failing test with the diagnostics pgTAP emits after it.
      lines.forEach((line, index) => {
        if (!line.startsWith("not ok")) return;
        console.error(`  ${line}`);
        for (const next of lines.slice(index + 1)) {
          if (!/^\s*#/.test(next)) break;
          console.error(`  ${next}`);
        }
      });
    } else {
      console.log(`ok        ${file} (${results.length} tests)`);
    }
  }

  await db.close();
  if (failedFiles) {
    console.error(`\n${failedFiles} test file(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll database tests passed (${totalTests} assertions).`);
}

await main();
