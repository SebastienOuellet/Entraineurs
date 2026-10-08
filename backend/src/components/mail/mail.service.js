import { ConfigService } from "../../config/configService.js";
import { logger } from "../../config/logger.js";
import { BadGatewayError, BadRequestError } from "../../errors/Errors.js";
import { getEmailProvider, isEmailDryRun, isSmtpConfigured } from "../../notifications/providerFactory.js";
import { buildTestEmail } from "../../notifications/TestEmailBuilder.js";

const configService = new ConfigService();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * État du mailer tel que configuré dans backend/.env. Aucun secret : ni l'identifiant
 * ni le mot de passe SMTP ne sortent de l'API.
 */
export const getMailStatus = () => {
  const configured = isSmtpConfigured();
  const dryRun = isEmailDryRun();
  return {
    configured,
    dryRun,
    /** Vrai si un courriel partirait réellement. */
    live: configured && !dryRun,
    host: configService.get("SMTP_HOST") || null,
    port: configService.get("SMTP_PORT"),
    secure: configService.get("SMTP_SECURE"),
    from: configService.get("SMTP_FROM") || configService.get("SMTP_USER") || null
  };
};

/**
 * Envoie un courriel de test. Contrairement aux courriels de compte (user.service.js),
 * un échec remonte ici tel quel : le but est justement de voir l'erreur SMTP.
 *
 * @param {string|undefined} to - Destinataire ; par défaut, l'administrateur qui lance le test.
 * @param {{ Id: number, Email: string }} actor
 * @returns {Promise<{ to: string, live: boolean }>}
 */
export const sendTestEmail = async (to, actor) => {
  const recipient = typeof to === "string" && to.trim() ? to.trim().toLowerCase() : actor.Email;
  if (!EMAIL_PATTERN.test(recipient)) {
    throw new BadRequestError("Adresse courriel invalide.");
  }

  const { live } = getMailStatus();
  try {
    await getEmailProvider().send({ to: recipient, ...buildTestEmail({ requestedBy: actor.Email }) });
  } catch (error) {
    logger.error(`Échec du courriel de test à ${recipient}: ${error.message}`);
    throw new BadGatewayError(`Échec de l'envoi : ${error.message}`);
  }
  logger.info(`Courriel de test ${live ? "envoyé" : "journalisé (mode essai)"} | à: ${recipient} - par: ${actor.Id}`);

  return { to: recipient, live };
};
