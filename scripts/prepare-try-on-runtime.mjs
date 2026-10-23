import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = "public/try-on";
await mkdir(`${root}/vision`, { recursive: true });
const source = "node_modules/@mediapipe/tasks-vision";
const version = JSON.parse(await readFile(`${source}/package.json`, "utf8")).version;
if (version !== "1.1.1") throw new Error("Review the runtime update before replacing the bundled 1.1.1 files.");
await copyFile(`${source}/vision_bundle.js`, `${root}/vision/vision_bundle.js`);
for (const name of ["vision_wasm_internal", "vision_wasm_nosimd_internal"]) for (const ext of ["js", "wasm"]) await copyFile(`${source}/wasm/${name}.${ext}`, `${root}/vision/${name}.${ext}`);
const files = [
  ["pose_landmarker_lite.task", "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"],
  ["vision/LICENSE", "https://raw.githubusercontent.com/google-ai-edge/mediapipe/master/LICENSE"],
];
for (const [file, url] of files) {
  const response = await fetch(url); if (!response.ok) throw new Error(`${url}: ${response.status}`);
  await writeFile(`${root}/${file}`, Buffer.from(await response.arrayBuffer()));
}
const model = await readFile(`${root}/pose_landmarker_lite.task`);
console.log({ runtime: version, modelSha256: createHash("sha256").update(model).digest("hex") });
