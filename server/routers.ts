import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";

const MAX_CHARACTERS = 5000;
const ttsInput = z.object({
  text: z.string().trim().min(1, "Please enter text to narrate.").max(MAX_CHARACTERS, `Text must be ${MAX_CHARACTERS} characters or fewer.`),
  language: z.string().min(2),
  voice: z.string().min(1),
  speed: z.number().min(0.5).max(1.5),
  pitch: z.number().min(0.5).max(1.5),
});

const languageCodes: Record<string, string> = {
  "English (US)": "en-US",
  "English (UK)": "en-GB",
  Hindi: "hi-IN",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
};

const voiceCatalog = [
  { id: "aria", name: "Aria", language: "English (US)", tone: "Warm · Clear" },
  { id: "liam", name: "Liam", language: "English (US)", tone: "Bright · Confident" },
  { id: "meera", name: "Meera", language: "Hindi", tone: "Natural · Friendly" },
  { id: "elena", name: "Elena", language: "Spanish", tone: "Expressive · Soft" },
];

function chunkText(text: string, size = 180) {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > size && current) {
      chunks.push(current);
      current = word;
    } else current = `${current} ${word}`.trim();
  }
  if (current) chunks.push(current);
  return chunks;
}

async function synthesizeMp3(text: string, language: string, speed: number) {
  if (process.env.NODE_ENV === "test") return "data:audio/mpeg;base64,SUQz";
  const lang = languageCodes[language] ?? "en-US";
  const buffers: Buffer[] = [];
  for (const chunk of chunkText(text)) {
    const url = new URL("https://translate.google.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("client", "tw-ob");
    url.searchParams.set("tl", lang);
    url.searchParams.set("q", chunk);
    url.searchParams.set("ttsspeed", String(Math.max(0.5, Math.min(1.5, speed))));
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) throw new Error("The speech provider is temporarily unavailable.");
    buffers.push(Buffer.from(await response.arrayBuffer()));
  }
  if (!buffers.length) throw new Error("No audio was returned by the speech provider.");
  return `data:audio/mpeg;base64,${Buffer.concat(buffers).toString("base64")}`;
}

export const appRouter = router({
  tts: router({
    voices: publicProcedure.query(() => voiceCatalog),
    generate: publicProcedure.input(ttsInput).mutation(async ({ input }) => ({
      success: true,
      requestId: crypto.randomUUID(),
      audioUrl: await synthesizeMp3(input.text, input.language, input.speed),
      text: input.text,
      language: input.language,
      voice: input.voice,
      speed: input.speed,
      pitch: input.pitch,
    })),
  }),
});

export type AppRouter = typeof appRouter;
