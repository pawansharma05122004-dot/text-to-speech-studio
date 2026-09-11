import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    req: { protocol: "http", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tts.generate", () => {
  it("validates a narration request and returns a generation id", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.tts.generate({
      text: "A short narration for a product demo.",
      language: "English (US)",
      voice: "Aria",
      speed: 1,
      pitch: 1,
    });

    expect(result.success).toBe(true);
    expect(result.requestId).toEqual(expect.any(String));
    expect(result.text).toContain("short narration");
  });

  it("rejects empty text", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.tts.generate({
      text: "   ",
      language: "English (US)",
      voice: "Aria",
      speed: 1,
      pitch: 1,
    })).rejects.toThrow();
  });
});
