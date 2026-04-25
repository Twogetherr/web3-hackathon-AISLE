import "dotenv/config";
import { createApp } from "./app.js";
import { getEnvConfig } from "./env.js";

const env = getEnvConfig();
const app = createApp();

app.listen(env.PORT, () => {
  console.info("AISLE server listening", {
    port: env.PORT
  });
});
