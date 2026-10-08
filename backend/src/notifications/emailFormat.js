/**
 * Mise en forme commune aux courriels. Tableaux et styles en ligne seulement, pour un
 * rendu fiable dans Gmail, Outlook et Apple Mail.
 */

/** Couleur principale de l'application (voir --color-primary dans frontend/src/styles.scss). */
export const BRAND_COLOR = "#213146";

/** Toute valeur saisie ou venue de l'extérieur est échappée avant insertion dans le HTML. */
export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/**
 * Enveloppe commune : `content` est du HTML déjà échappé par l'appelant.
 * @param {string} content
 * @returns {string}
 */
export const wrapEmailHtml = (content) => `<!doctype html>
<html lang="fr">
<body style="font-family: Arial, sans-serif; color: #2f3840; max-width: 600px; margin: 0 auto; padding: 16px;">
  <div style="border-top: 4px solid ${BRAND_COLOR}; padding-top: 16px;">
${content}
  </div>
</body>
</html>`;
