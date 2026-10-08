import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");
config({ path: envPath });

// Postgres géré (DigitalOcean) : SSL requis. Postgres local : DB_SSL=false.
const useSsl = process.env.DB_SSL !== "false";

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME || "entraineurs",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  logging: false
};

export default {
  development: base,
  staging: base,
  production: base,
  // Tests d'intégration (vitest) : base distincte, jamais celle de développement.
  test: { ...base, database: process.env.TEST_DB_NAME || "entraineurs_test" }
};
