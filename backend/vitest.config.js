import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Les tests d'intégration partagent une seule base : pas d'exécution en parallèle.
    fileParallelism: false,
    env: { LOG_LEVEL: "error" }
  }
});
