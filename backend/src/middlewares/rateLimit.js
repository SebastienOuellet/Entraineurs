import rateLimit from "express-rate-limit";

const tooManyRequests = { error: { message: "Trop de requêtes. Réessayez plus tard.", status: 429 } };

/** Limite générale pour les routes publiques (sans authentification). */
export const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooManyRequests
});

/** Courriel de test : assez pour régler une configuration SMTP, pas pour inonder une boîte. */
export const mailTestRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooManyRequests
});
