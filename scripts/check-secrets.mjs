// Build plan check 8: no secret appears in the client bundle.
//
// 1. No env var with a secret-looking name may carry the NEXT_PUBLIC_ prefix
//    (Next inlines NEXT_PUBLIC_ values into browser JavaScript).
// 2. After `next build`, scan every file under .next/static (what browsers
//    download) for the values of server-only env vars and for well-known
//    secret formats: Supabase secret keys, service_role JWTs, private keys.
//
// Usage: npm run build && npm run check:secrets

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];

async function walk(dir, filter) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      out.push(...(await walk(full, filter)));
    } else if (filter(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function parseEnv(text) {
  const vars = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) vars[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
  return vars;
}

const SECRET_NAME = /(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|TOKEN|API_KEY)/;

// 1. Secret-looking NEXT_PUBLIC_ names anywhere in source or env templates.
const sourceFiles = [
  ...(await walk(path.join(root, "src"), (n) => /\.(ts|tsx|js|mjs)$/.test(n))),
  ...[".env.example", ".env.local", "next.config.ts"].map((f) => path.join(root, f)).filter(existsSync),
];
for (const file of sourceFiles) {
  const text = await readFile(file, "utf8");
  for (const [name] of text.matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)) {
    if (SECRET_NAME.test(name)) problems.push(`${path.relative(root, file)}: public env var with a secret name: ${name}`);
  }
}

// 2. Scan the client bundle.
const staticDir = path.join(root, ".next", "static");
if (!existsSync(staticDir)) {
  console.error("No .next/static directory. Run `npm run build` first.");
  process.exit(1);
}

const env = { ...parseEnv(existsSync(path.join(root, ".env.local")) ? await readFile(path.join(root, ".env.local"), "utf8") : ""), ...process.env };
const serverOnlyValues = Object.entries(env)
  .filter(([name, value]) => !name.startsWith("NEXT_PUBLIC_") && SECRET_NAME.test(name) && value && value.length >= 12)
  .map(([name, value]) => ({ name, value }));

function isServiceRoleJwt(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return payload.role === "service_role" || payload.role === "supabase_admin";
  } catch {
    return false;
  }
}

const bundleFiles = await walk(staticDir, () => true);
for (const file of bundleFiles) {
  const text = await readFile(file, "utf8");
  const rel = path.relative(root, file);
  for (const { name, value } of serverOnlyValues) {
    if (text.includes(value)) problems.push(`${rel}: contains the value of server-only ${name}`);
  }
  if (/sb_secret_[A-Za-z0-9_-]{8,}/.test(text)) problems.push(`${rel}: contains a Supabase secret key (sb_secret_...)`);
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)) problems.push(`${rel}: contains a private key`);
  for (const [token] of text.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g)) {
    if (isServiceRoleJwt(token)) problems.push(`${rel}: contains a service_role JWT`);
  }
}

if (problems.length) {
  console.error(`Secret scan failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `Secret scan passed: ${bundleFiles.length} client files checked, ${serverOnlyValues.length} server-only env values searched.`,
);
