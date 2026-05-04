import { createApp } from "./app.js";
import { connectDb } from "./db.js";
import { env } from "./env.js";

const start = async () => {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    process.stdout.write(`Server listening on http://localhost:${env.port}\n`);
  });
};

start().catch((err: unknown) => {
  process.stderr.write(String(err) + "\n");
  process.exit(1);
});

