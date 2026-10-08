import { describe, it, expect, afterEach } from "vitest";
import { ConfigService } from "../config/configService.js";
import { getEmailProvider, isEmailLive, resetProviders } from "./providerFactory.js";
import { DryRunEmailProvider } from "./providers/DryRunEmailProvider.js";
import { NodemailerEmailProvider } from "./providers/NodemailerEmailProvider.js";

const configService = new ConfigService();
const initial = { host: configService.get("SMTP_HOST"), dryRun: configService.get("EMAIL_DRY_RUN") };

const configure = ({ host, dryRun }) => {
  configService.set("SMTP_HOST", host);
  configService.set("EMAIL_DRY_RUN", dryRun);
  resetProviders();
};

describe("choix du fournisseur de courriel", () => {
  afterEach(() => configure(initial));

  it("sans SMTP_HOST : rien ne part, tout est journalisé", async () => {
    configure({ host: "", dryRun: false });

    expect(getEmailProvider()).toBeInstanceOf(DryRunEmailProvider);
    expect(isEmailLive()).toBe(false);
    await expect(getEmailProvider().send({ to: "a@example.com", subject: "Test", text: "Bonjour" })).resolves.toMatchObject({
      providerMessageId: expect.stringContaining("dry-run")
    });
  });

  it("SMTP configuré : envoi réel par nodemailer", () => {
    configure({ host: "smtp.example.com", dryRun: false });

    expect(getEmailProvider()).toBeInstanceOf(NodemailerEmailProvider);
    expect(isEmailLive()).toBe(true);
  });

  it("EMAIL_DRY_RUN=true : mode essai même avec SMTP configuré", () => {
    configure({ host: "smtp.example.com", dryRun: true });

    expect(getEmailProvider()).toBeInstanceOf(DryRunEmailProvider);
    expect(isEmailLive()).toBe(false);
  });
});
