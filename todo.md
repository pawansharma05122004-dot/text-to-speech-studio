# Project TODO

- [x] Create an elegant responsive Text-to-Speech Studio workspace with a clear first-use experience.
- [x] Add speech-ready text editor with character count, word count, maximum length guidance, clear action, and validation.
- [x] Add language, voice, speed, and pitch controls with accessible labels and helpful descriptions.
- [x] Add generate-speech flow with loading, success, empty-state, and error feedback.
- [x] Add audio preview controls for play, pause, replay, seeking, and volume.
- [x] Add generated audio download support.
- [x] Add recent-generation history with replay and removal actions.
- [x] Implement backend speech-generation and voice-list APIs with validation and safe error responses.
- [x] Add server-side tests for validation and speech-generation behavior.
- [x] Add project documentation with local setup, API details, and environment-variable guidance.
- [x] Verify responsive UI, accessibility, build, and tests before delivery.

## Change History

- [x] Initial requirements captured from the user brief.
- [x] Package a clean source-code ZIP for local VS Code use, excluding node_modules, dist, and local environment files.
- [x] Remove unnecessary user-facing and nonessential platform references while preserving required runtime configuration.
- [x] Verify the cleaned source with tests and production build, then create a deployment-ready ZIP for GitHub and Vercel.
- [x] Make the backend entry point and deployment configuration compatible with Vercel runtime execution.
- [x] Verify the Vercel-compatible deployment with type-checks, tests, and production build.
- [x] Ensure the Vercel tRPC handler parses JSON request bodies before invoking the Express adapter.
- [x] Verify the Vercel API route handles the voice-list and speech-generation requests with request-level integration coverage.
- [x] Add a local request simulation for the Vercel tRPC handler covering `tts.voices` and `tts.generate`.
- [ ] Remove remaining unused auth/storage/platform dependencies and stale lockfile metadata from the distributable source.
- [ ] Scan every file included in the final ZIP and rerun tests and production build after the full cleanup.
