import http from "http";
import app from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";

async function start() {
  await connectDb();
  const server = http.createServer(app);
  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend API listening on port ${env.port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});
