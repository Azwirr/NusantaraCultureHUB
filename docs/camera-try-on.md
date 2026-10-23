# Camera try-on

Requested by zwirr on 24 October 2026. The studio replaces full rectangular
reference photographs with 27 transparent garment components for the nine
published costumes: headwear, upper garment and lower garment. Parts are
interpretive OpenAI illustrations; exact prompts are in `try-on-prompts.json`.
These are separate from the documentary photos and covers in the library.

## What works

- Start/stop the front camera, with permission and unavailable-camera messages.
- Choose a local JPG, PNG or WebP (up to 15 MB), without opening a camera.
- Solo/couple mode, with independent costume and part controls for each person.
- Head/upper/lower visibility, drag, size, position, rotation, opacity and reset.
- Optional on-device pose fitting; shoulders/hips position garments and visible
  ankles set skirt length. Missing bodies or unavailable inference fall back to
  manual placement. Left/right in couple mode refer to screen position.
- A PNG download uses the same cover crop, mirroring, part bounds and rotation
  as the preview, plus a permanent Nusantara Culture Hub/AI watermark.
- Each costume detail page links directly to the studio with that dress chosen.

## Privacy and runtime

Camera access starts only after a button press. No microphone is requested.
Tracks stop on stop, navigation, document hiding and cancelled late permission
responses. Object URLs and workers are disposed when no longer needed.
Photos never pass through Next Image, an API route or a remote image service.

MediaPipe Tasks Vision 1.1.1 and the official Pose Landmarker Lite float16 v1
model are bundled under `public/try-on/`. They are fetched only after an image
source and automatic fitting are enabled. CPU inference runs in a Web Worker
at most four times a second with one frame in flight. The model finds up to
two bodies; all pixel processing stays on-device. Static studio assets bypass
locale rewrites while `/try-on` remains a localized page.

Bundled model SHA-256:
`59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a`.

Runtime regeneration: `node scripts/prepare-try-on-runtime.mjs`. Garment atlas
installation: `node scripts/install-try-on-assets.mjs` with the ignored working
job file `tmp/try-on/jobs.json`. Atlas splitting follows transparent gutters;
no garment artwork is painted or reconstructed by the script.

Sources:
- https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js
- https://github.com/google-ai-edge/mediapipe
- https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE
- https://developers.google.com/static/ml-kit/images/vision/pose-detection/pose_model_card.pdf

The runtime's upstream licence is bundled in `public/try-on/vision/LICENSE`.
The camera is a 2D dress-up experience; cloth simulation, hand/body occlusion
and persistent person identity tracking are not implemented. Fitting quality
depends on lighting, framing and visible body landmarks. Manual controls remain
available, including on browsers without worker inference support.

## Verification (24 October 2026)

`npm run acceptance` passed: lint, TypeScript, 82 unit tests, 233 database
assertions, production build, secret scan and 136 browser tests (1 skipped).
Browser checks exercise the real local pose worker, fake camera start/stop,
part controls, couple mode, a 750×1000 PNG download, denied permissions and
local-photo validation. The privacy assertion observes no POST/upload while
the camera and export run. A separate inference probe detected a body in the
project's licensed Ulos photograph. Accessibility and 360px overflow gates
pass in Indonesian/light and English/dark. A ten-person physical-camera
quality study and manual screen-reader/device testing remain separate work.
