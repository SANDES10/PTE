import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { registerAuthRoutes } from "./authRoutes";
import { createContext } from "./context";
import { sdk } from "./sdk";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  registerAuthRoutes(app);

  app.post(
    "/api/upload-audio",
    express.raw({ type: "audio/*", limit: "10mb" }),
    async (req, res) => {
      try {
        let user = null;
        try {
          user = await sdk.authenticateRequest(req);
        } catch {
          user = null;
        }
        if (!user) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        const { storagePut } = await import("../storage");
        const { nanoid } = await import("nanoid");
        const key = `audio/user-${user.id}/${nanoid()}.webm`;
        const buffer = req.body as Buffer;
        const { url } = await storagePut(key, buffer, "audio/webm");
        res.json({ url, key });
      } catch (err) {
        console.error("Audio upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
