import express, { type Express } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
// Photos are sent as downscaled base64 data URLs.
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Single-service deploys (e.g. Render): serve the built web app from the API
// server when its build output exists. Local dev keeps using Vite's server.
const WEB_DIST = [
  path.resolve(process.cwd(), "../listing-check/dist/public"),
  path.resolve(process.cwd(), "artifacts/listing-check/dist/public"),
].find((d) => existsSync(path.join(d, "index.html")));
if (WEB_DIST) {
  app.use(express.static(WEB_DIST, { index: false, redirect: false, maxAge: "1h" }));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(WEB_DIST, "index.html")));
}

export default app;
