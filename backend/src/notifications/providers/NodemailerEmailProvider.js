import nodemailer from "nodemailer";
import { EmailProvider } from "./EmailProvider.js";
import { ConfigService } from "../../config/configService.js";
import { InternalServerError } from "../../errors/Errors.js";

const configService = new ConfigService();

export class NodemailerEmailProvider extends EmailProvider {
  constructor() {
    super();
    const host = configService.get("SMTP_HOST");
    if (!host) {
      throw new InternalServerError("Configuration SMTP incomplète: SMTP_HOST est requis.");
    }

    const user = configService.get("SMTP_USER");
    this.from = configService.get("SMTP_FROM") || user;
    this.transporter = nodemailer.createTransport({
      host,
      port: configService.get("SMTP_PORT"),
      // true = TLS implicite (465). false = STARTTLS (587/2525). Une mauvaise valeur donne
      // l'erreur OpenSSL « wrong version number ».
      secure: configService.get("SMTP_SECURE"),
      auth: user ? { user, pass: configService.get("SMTP_PASSWORD") } : undefined,
      // Sans ces délais, nodemailer attend jusqu'à 2 minutes (connexion) et 10 minutes
      // (socket) avant d'abandonner.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000
    });
  }

  async send({ to, subject, html, text, attachments, replyTo }) {
    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      replyTo,
      subject,
      html,
      text,
      attachments
    });
    return { providerMessageId: info.messageId };
  }
}
