/** État du mailer tel que configuré sur le serveur (GET /api/mail/status, admin seulement). */
export interface MailStatus {
  /** SMTP_HOST est renseigné. */
  configured: boolean;
  /** EMAIL_DRY_RUN=true : rien ne part, même si SMTP est configuré. */
  dryRun: boolean;
  /** Un courriel partirait réellement. */
  live: boolean;
  host: string | null;
  port: number;
  secure: boolean;
  from: string | null;
}

export interface MailTestResult {
  to: string;
  /** Faux : le courriel a seulement été journalisé sur le serveur. */
  live: boolean;
}
