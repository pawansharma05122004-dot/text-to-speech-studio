import express from "express";
import { createServer, type Server } from "http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import handler from "../api/trpc/[...path]";

let server: Server;
let baseUrl: string;

function startTestServer(): Promise<void> {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.json());
    app.use("/api/trpc", handler);
    server = createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Test server did not start.");
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
}

describe("Vercel tRPC handler", () => {
  beforeAll(async () => {
    await startTestServer();
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("serves the voice catalog through the deployed API shape", async () => {
    const input = encodeURIComponent(JSON.stringify({ 0: { json: null } }));
    const response = await fetch(`${baseUrl}/api/trpc/tts.voices?batch=1&input=${input}`);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload[0].result.data.json).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "aria" })]),
    );
  });

  it("accepts a JSON generation request through the deployed API shape", async () => {
    const response = await fetch(`${baseUrl}/api/trpc/tts.generate?batch=1`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        0: {
          json: {
            text: "A short narration for a deployment check.",
            language: "English (US)",
            voice: "aria",
            speed: 1,
            pitch: 1,
          },
        },
      }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload[0].result.data.json.success).toBe(true);
    expect(payload[0].result.data.json.text).toContain("deployment check");
  });
});
