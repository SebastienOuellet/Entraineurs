import { ConfigService } from "../config/configService.js";
import { escapeHtml, wrapEmailHtml } from "./emailFormat.js";

const configService = new ConfigService();

/**
 * Courriel de test envoyé depuis Paramètres › Courriel pour valider la configuration SMTP.
 * @param {{ requestedBy: string }} params - Courriel de l'administrateur qui lance le test.
 * @returns {{ subject: string, html: string, text: string }}
 */
export const buildTestEmail = ({ requestedBy }) => {
  const appName = configService.get("APP_NAME");
  const intro = `Ce message confirme que l'envoi de courriels de l'application ${appName} fonctionne.`;
  const footer = `Test lancé par ${requestedBy}. Aucune action n'est requise.`;
  return {
    subject: `Courriel de test — ${appName}`,
    html: wrapEmailHtml(`    <p>Bonjour,</p>
    <p>${escapeHtml(intro)}</p>
    <p style="font-size: 13px; color: #7a8591;">${escapeHtml(footer)}</p>`),
    text: ["Bonjour,", "", intro, "", footer].join("\n")
  };
};
