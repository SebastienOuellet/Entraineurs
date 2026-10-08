import { describe, it, expect } from "vitest";
import { buildPasswordChangedEmail, buildWelcomeEmail } from "./AccountEmailBuilder.js";
import { buildTestEmail } from "./TestEmailBuilder.js";

describe("courriels de compte", () => {
  it("bienvenue : rôle, identifiants et lien de connexion", () => {
    const email = buildWelcomeEmail({ email: "a@example.com", name: "Alex", role: "manager", password: "Marbre-Gant-1234" });

    expect(email.subject).toContain("Votre accès");
    expect(email.text).toContain("Bonjour Alex,");
    expect(email.text).toContain("Un compte gestionnaire");
    expect(email.text).toContain("Mot de passe : Marbre-Gant-1234");
    expect(email.text).toContain("/login");
    expect(email.html).toContain("Marbre-Gant-1234");
  });

  it("sans mot de passe : aucune ligne « Mot de passe »", () => {
    const email = buildWelcomeEmail({ email: "a@example.com", name: null, role: "admin", password: null });

    expect(email.text).toContain("Bonjour,");
    expect(email.text).not.toContain("Mot de passe");
    expect(email.html).not.toContain("Mot de passe");
  });

  it("échappe les valeurs saisies dans le HTML", () => {
    const email = buildPasswordChangedEmail({ email: "a@example.com", name: "<b>Alex</b>", password: "<script>" });

    expect(email.html).not.toContain("<b>Alex</b>");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    // Le texte brut garde la valeur exacte : c'est le mot de passe à saisir.
    expect(email.text).toContain("Mot de passe : <script>");
  });

  it("courriel de test : nomme l'administrateur qui l'a lancé", () => {
    const email = buildTestEmail({ requestedBy: "admin@example.com" });

    expect(email.subject).toContain("Courriel de test");
    expect(email.text).toContain("admin@example.com");
    expect(email.html).toContain("admin@example.com");
  });
});
