import { ConfigService } from "../config/configService.js";
import { USER_ROLES } from "../components/user/user.constants.js";
import { BRAND_COLOR, escapeHtml, wrapEmailHtml } from "./emailFormat.js";

const configService = new ConfigService();

const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "administrateur",
  [USER_ROLES.MANAGER]: "gestionnaire",
  [USER_ROLES.USER]: "utilisateur"
};

const getAppName = () => configService.get("APP_NAME");

const getLoginUrl = () => `${configService.get("PUBLIC_BASE_URL").replace(/\/$/, "")}/login`;

/**
 * Gabarit des courriels de compte. Courriel transactionnel (accès à l'application) : pas de lien de
 * désabonnement, ce n'est pas un message commercial au sens de la LCAP.
 */
const wrapHtml = ({ greeting, intro, email, password, loginUrl }) =>
  wrapEmailHtml(`    <p>${greeting}</p>
    <p>${intro}</p>
    <table style="margin: 16px 0; font-size: 16px;">
      <tr><td style="padding: 4px 16px 4px 0; color: #7a8591;">Courriel</td><td><strong>${escapeHtml(email)}</strong></td></tr>
      ${password ? `<tr><td style="padding: 4px 16px 4px 0; color: #7a8591;">Mot de passe</td><td><strong style="font-family: monospace; font-size: 18px;">${escapeHtml(password)}</strong></td></tr>` : ""}
    </table>
    <p style="margin: 24px 0;">
      <a href="${loginUrl}" style="background: ${BRAND_COLOR}; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Ouvrir l'application</a>
    </p>
    <p style="font-size: 13px; color: #7a8591;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />${loginUrl}</p>
    <p style="font-size: 13px; color: #7a8591;">Conservez ce courriel en lieu sûr et ne le transférez à personne.</p>`);

const buildText = ({ greetingText, introText, email, password, loginUrl }) =>
  [
    greetingText,
    "",
    introText,
    "",
    `Courriel : ${email}`,
    ...(password ? [`Mot de passe : ${password}`] : []),
    "",
    `Ouvrir l'application : ${loginUrl}`,
    "",
    "Conservez ce courriel en lieu sûr et ne le transférez à personne."
  ].join("\n");

/**
 * @param {{ email: string, name?: string|null, role: string, password?: string|null }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const buildWelcomeEmail = ({ email, name, role, password }) => {
  const loginUrl = getLoginUrl();
  const roleLabel = ROLE_LABELS[role] ?? "utilisateur";
  const greetingText = name ? `Bonjour ${name},` : "Bonjour,";
  const appName = getAppName();
  const introText = `Un compte ${roleLabel} a été créé pour vous sur l'application ${appName}. Voici vos informations de connexion :`;
  return {
    subject: `Votre accès à l'application ${appName}`,
    html: wrapHtml({
      greeting: name ? `Bonjour ${escapeHtml(name)},` : "Bonjour,",
      intro: `Un compte <strong>${roleLabel}</strong> a été créé pour vous sur l'application ${escapeHtml(appName)}. Voici vos informations de connexion :`,
      email,
      password,
      loginUrl
    }),
    text: buildText({ greetingText, introText, email, password, loginUrl })
  };
};

/**
 * @param {{ email: string, name?: string|null, password?: string|null }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const buildPasswordChangedEmail = ({ email, name, password }) => {
  const loginUrl = getLoginUrl();
  const greetingText = name ? `Bonjour ${name},` : "Bonjour,";
  const introText = `Le mot de passe de votre compte ${getAppName()} a été modifié par un administrateur.`;
  return {
    subject: `Votre mot de passe ${getAppName()} a été modifié`,
    html: wrapHtml({
      greeting: name ? `Bonjour ${escapeHtml(name)},` : "Bonjour,",
      intro: introText,
      email,
      password,
      loginUrl
    }),
    text: buildText({ greetingText, introText, email, password, loginUrl })
  };
};
