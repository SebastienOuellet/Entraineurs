import "dotenv/config";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Les tests d'intégration tournent sur une vraie base Postgres, distincte de celle de
 * développement : TEST_DB_NAME dans backend/.env (ex. entraineurs_test). Sans cette
 * variable, ils sont sautés et seuls les tests unitaires s'exécutent.
 */
export const hasTestDb = Boolean(process.env.TEST_DB_NAME);

/**
 * Repart d'une base vide et y applique les VRAIES migrations (pas sequelize.sync) :
 * les tests valident ainsi le schéma qui sera réellement déployé, contraintes uniques
 * comprises. Refuse toute base dont le nom ne se termine pas par _test.
 */
export const resetTestDb = async () => {
  const { default: db } = await import("../models/index.js");
  const database = db.sequelize.config.database;
  if (!database?.endsWith("_test")) {
    throw new Error(`Refus de vider la base "${database}" : son nom doit se terminer par _test.`);
  }

  await db.sequelize.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  execSync("npx sequelize-cli db:migrate --config ./migrations-config.js --env entraineurs", {
    cwd: backendDir,
    env: { ...process.env, NODE_ENV: "test" },
    stdio: "pipe"
  });
  return db;
};
