import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

async function ensureJsonBody(req: any) {
  if (req.method !== "POST" || req.body !== undefined) return;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  req.body = rawBody ? JSON.parse(rawBody) : undefined;
}

export default async function handler(req: any, res: any) {
  try {
    await ensureJsonBody(req);

    await new Promise<void>((resolve, reject) => {
      trpcMiddleware(req, res, (error?: unknown) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    if (!res.headersSent) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Invalid request.",
        }),
      );
    }
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
