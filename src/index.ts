import express from "express";
import "dotenv/config";
import cors from "cors";
import errorHandler from "strong-error-handler";

import rootRouter from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// check if env is set
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined");
}

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3030",
      "https://cric-admin.onrender.com",
    ],
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
