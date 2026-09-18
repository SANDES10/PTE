import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { mapSupabaseUserToProfile, verifySupabaseAccessToken } from "./supabase";

export function registerAuthRoutes(app: any) {
  app.post("/api/auth/session", async (req: any, res: any) => {
    const accessToken =
      typeof req.body?.access_token === "string" ? req.body.access_token : null;

    if (!accessToken) {
      res.status(400).json({ error: "access_token is required" });
      return;
    }

    try {
      const supabaseUser = await verifySupabaseAccessToken(accessToken);
      if (!supabaseUser) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }

      const profile = mapSupabaseUserToProfile(supabaseUser);
      await db.upsertUser({
        ...profile,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(profile.openId, {
        name: profile.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Session establishment failed", error);
      res.status(500).json({ error: "Failed to establish session" });
    }
  });

  /** Legacy OAuth callback — redirects to login for old bookmarks */
  app.get("/api/oauth/callback", (_req: any, res: any) => {
    res.redirect(302, "/login");
  });
}
