# AI portrait studio

Owner decision, 24 October 2026: replace the main manual camera-overlay flow
with a coherent face-based AI portrait, similar to Gemini. The earlier manual
component and on-device pose assets remain in the repository but are not the
main `/try-on` experience.

## Flow

1. Choose a published outfit. Headwear, upper garment and lower garment are
   prepared local references; the visitor does not assemble or align them.
2. Capture one clear face or choose a local JPG/PNG/WebP. Camera preview and
   validation are local. Capture stops the camera; removing a photo releases it.
3. Sign in, explicitly consent to AI processing, and press Generate. Only then
   does the photo leave the device.
4. The server sends the identity image and three garment references to Google
   through Vercel AI Gateway. It asks for one naturally worn, fully clothed,
   photorealistic portrait, preserving the face and regional outfit features.
5. Return a private WebP with a permanent AI watermark. Preview/download remain
   browser object URLs, not public storage URLs. Navigation discards the media.

## Provider and limits

AI SDK 7 `generateText`, `google/gemini-3.1-flash-image`, image output from
`result.files`. The ID was verified against the complete live gateway catalog.
Google image options request a 3:4 portrait at 1K. Gateway routing requires
zero-data-retention providers and disallows prompt training. If those provider
constraints cannot be met, generation fails instead of weakening them.

The API verifies the member session, same-origin request, versioned consent,
known costume slug and approved database row. Bodies are bounded, images must
decode as JPEG/PNG/WebP, pixel count is limited, and EXIF is stripped. Reference
paths and prompts are server-controlled; client prompt text or URLs are ignored.

Use the existing atomic `consume_assistant_question()` quota: 20 total AI
attempts/member/day, Asia/Jakarta, shared with Tanya Nusantara. Reserve one
attempt before invoking the provider; failed attempts count. No new schema or
permanent photo storage is needed. The SDK makes no paid retries; cancellation
and a 105-second timeout abort the provider request when possible.

Neither provider errors nor image bytes are logged. The response is
`Cache-Control: no-store, private`. Photo likeness/garment details remain
generative and must be checked with a real approved test before release.

## Activation

- `AI_GATEWAY_API_KEY`: server-only, already present locally.
- `TRY_ON_AI_ENABLED=true`: deliberate activation; defaults off.
- `TRY_ON_FAKE_PROVIDER=1`: local test output only, never on Vercel or a public
  API hostname. The output says TEST PROVIDER and is visibly not an AI portrait.
- Automated browser servers force paid generation off. Tests use deterministic
  provider output or mocked responses, never a paid call.

The initial project instructions require approval before the first real paid AI
call. Activation, live image-quality verification, commits and deployment wait
for the corresponding user approval; preparation and safe tests proceed first.

References checked:
- https://vercel.com/docs/ai-gateway/modalities/image-generation/ai-sdk
- https://ai-sdk.dev/providers/ai-sdk-providers/google
- https://ai-gateway.vercel.sh/v1/models
- Installed `node_modules/ai/docs/` and `node_modules/@ai-sdk/gateway/src/`.
