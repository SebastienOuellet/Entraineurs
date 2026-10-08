import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// src/config -> backend/.env
const envPath = path.resolve(__dirname, "../../.env");
config({ path: envPath });

export const defaultConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5030,
  APP_NAME: process.env.APP_NAME || "Entraîneurs",
  /** URL du frontend (liens dans les courriels). */
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "http://localhost:4200",
  TIMEZONE: process.env.TIMEZONE || "America/Toronto",

  DB_USER: process.env.DB_USER,
  DB_PW: process.env.DB_PW,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME || "entraineurs",
  DB_PORT: Number(process.env.DB_PORT) || 5432,

  FIREBASE_CREDENTIAL_FILE: process.env.FIREBASE_CREDENTIAL_FILE,

  LOG_LEVEL: process.env.LOG_LEVEL || "debug",

  /* Courriel (SMTP). SMTP_SECURE : true = TLS implicite (port 465), false = STARTTLS (587/2525). */
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  SMTP_FROM: process.env.SMTP_FROM || "",
  /** true = aucun courriel réel, même si SMTP est configuré : tout est journalisé seulement (développement). */
  EMAIL_DRY_RUN: process.env.EMAIL_DRY_RUN === "true"
};
