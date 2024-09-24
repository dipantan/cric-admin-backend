import express from "express";
import "dotenv/config";
import cors from "cors";
import errorHandler from "strong-error-handler";
import "reflect-metadata";
import cron from "node-cron";
import serveIndex from "serve-index";

import rootRouter from "./routes";
import { callApiServer } from "./utils";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// check if env is set
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined");
}

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "./uploads")),
  serveIndex(path.join(__dirname, "./uploads"), {
    icons: true,
    view: "details",
  })
);

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3030", "https://cric-admin.onrender.com"],
  })
);

app.use("/", rootRouter);

app.get("/*", (req, res) => {
  res.status(404).send({
    message: "Not found",
  });
});

app.use(
  errorHandler({
    debug: app.get("env") === "development",
    log: true,
  })
);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

// Schedule a task to run every 14 minutes
cron.schedule("*/14 * * * *", async () => {
  await callApiServer();
});
