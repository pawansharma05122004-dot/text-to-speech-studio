# Text-to-Speech Studio

Text-to-Speech Studio is an elegant, responsive workspace for turning written scripts into natural-sounding narration previews. It includes a speech-ready text editor, character and word counts, language and voice controls, speed and pitch tuning, backend validation, browser audio preview, replay, download, and recent-generation history.

## Technology

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4 and custom design tokens |
| Backend | Node.js, Express, and tRPC |
| Validation | Zod |
| Testing | Vitest |
| Deployment | Vercel-compatible static frontend and serverless API |

## Project structure

```text
text-to-speech-studio/
├── api/trpc/[...path].ts       # Vercel serverless tRPC handler
├── client/
│   └── src/
│       ├── pages/Home.tsx      # Main editor, controls, preview, and history
│       ├── components/ui/      # Reusable interface primitives
│       ├── contexts/           # Theme and shared UI context
│       ├── lib/trpc.ts         # Typed frontend API client
│       ├── App.tsx             # Application route and providers
│       └── index.css           # Global design system and responsive styles
├── server/
│   ├── routers.ts              # Text-to-speech procedures
│   ├── tts.generate.test.ts    # Router validation tests
│   ├── vercel.route.test.ts    # Serverless request integration tests
│   └── _core/                  # Express, Vite, and tRPC infrastructure
├── vercel.json                 # Vercel build configuration
├── todo.md                     # Feature checklist and change history
└── README.md                   # Project documentation
```

## Run locally on Windows

Open a terminal in the project root and install dependencies:

```cmd
npm install --legacy-peer-deps
```

Start the local server in Windows CMD:

```cmd
set NODE_ENV=development&& npx tsx watch server/_core/index.ts
```

Then open `http://localhost:3000` in your browser. To validate the project before delivery, run:

```cmd
npm run check
npm test
npm run build
```

## Backend API

The application exposes a typed `tts.generate` mutation under the tRPC API. It accepts `text`, `language`, `voice`, `speed`, and `pitch`. The server validates that text is present, limits scripts to 5,000 characters, and constrains speed and pitch to safe ranges.

The `tts.voices` query returns the available voice catalog used by the interface. Speech generation uses a server-side provider request so browser code does not need to contain provider credentials.

## Vercel deployment

The repository is configured with `vercel.json` for a Vite frontend built into `dist/public`. The `/api/trpc/*` route is handled by `api/trpc/[...path].ts` as a serverless Node function.

Use these Vercel settings if they are requested manually:

```text
Framework Preset: Vite
Root Directory: .
Install Command: npm install --legacy-peer-deps
Build Command: npm run build
Output Directory: dist/public
```

Third-party speech credentials should remain server-side. Never place a provider API key in React code or commit a `.env` file. Production deployments should also add provider rate limiting, request size limits, HTTPS, and abuse monitoring.
