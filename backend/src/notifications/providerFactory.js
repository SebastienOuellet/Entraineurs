import { ConfigService } from "../config/configService.js";
import { NodemailerEmailProvider } from "./providers/NodemailerEmailProvider.js";
import { DryRunEmailProvider } from "./providers/DryRunEmailProvider.js";

const configService = new ConfigService();

let emailProvider = null;

export const isSmtpConfigured = () => Boolean(configService.get("SMTP_HOST"));

/** Mode essai forcé (EMAIL_DRY_RUN=true) : rien ne part, même si SMTP est configuré. */
export const isEmailDryRun = () => Boolean(configService.get("EMAIL_DRY_RUN"));

/**
 * Point d'entrée unique pour envoyer un courriel : `getEmailProvider().send({ to, subject, html, text })`.
 * Envoi réel dès que SMTP est configuré et que le mode essai est désactivé ; sinon repli
 * sur le dry-run (journalisation seulement), pour qu'un poste de développement ne puisse
 * écrire à personne par accident.
 */
export const getEmailProvider = () => {
  if (!emailProvider) {
    emailProvider = isSmtpConfigured() && !isEmailDryRun() ? new NodemailerEmailProvider() : new DryRunEmailProvider();
  }
  return emailProvider;
};

/** Vrai si un courriel partirait réellement (pas un dry-run). */
export const isEmailLive = () => !(getEmailProvider() instanceof DryRunEmailProvider);

/** Réinitialise l'instance (tests / changement de config à chaud). */
export const resetProviders = () => {
  emailProvider = null;
};
