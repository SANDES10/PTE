import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import { createApp } from "../server/_core/app";

const app = createApp();
const handler = serverless(app);

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
