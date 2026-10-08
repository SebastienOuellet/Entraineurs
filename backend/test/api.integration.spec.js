import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { hasTestDb, resetTestDb } from "./testDb.js";

/**
 * Test de bout en bout par HTTP : vrai serveur Express, vraies routes, vraie base.
 * Seuls Firebase (vérification du token, comptes) et le fournisseur de courriel sont simulés.
 */

const PORT = 5988;
const BASE = `http://127.0.0.1:${PORT}/api`;

const firebase = vi.hoisted(() => ({ users: new Map(), nextUid: 1 }));
const mailbox = vi.hoisted(() => ({ sent: [], fail: false }));

// Jeton de test « uid:courriel » à la place d'un vrai ID token Firebase.
vi.mock("../src/config/firebase.js", () => ({
  verifyIdToken: vi.fn(async (token) => {
    const [uid, email] = token.split(":");
    if (!uid || !email) throw new Error("token invalide");
    return { uid, email, name: null };
  }),
  getFirebaseAuth: () => ({
    createUser: async ({ email, password }) => {
      if (firebase.users.has(email)) throw Object.assign(new Error("existe"), { code: "auth/email-already-exists" });
      const user = { uid: `fb-${firebase.nextUid++}`, email, password };
      firebase.users.set(email, user);
      return user;
    },
    getUserByEmail: async (email) => firebase.users.get(email),
    updateUser: async (uid, changes) => {
      const user = [...firebase.users.values()].find((candidate) => candidate.uid === uid);
      if (!user) throw Object.assign(new Error("introuvable"), { code: "auth/user-not-found" });
      return Object.assign(user, changes);
    },
    deleteUser: async () => {}
  })
}));

// Courriels : capturés, jamais envoyés.
vi.mock("../src/notifications/providerFactory.js", () => ({
  isSmtpConfigured: () => true,
  isEmailDryRun: () => false,
  isEmailLive: () => true,
  getEmailProvider: () => ({
    send: async (message) => {
      if (mailbox.fail) throw new Error("SMTP indisponible");
      mailbox.sent.push(message);
      return { providerMessageId: "test" };
    }
  })
}));

const call = async (method, path, { token, body } = {}) => {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: response.status, body: json };
};

const ADMIN = "uid-admin:admin@example.com";
const MANAGER = "uid-manager:gestion@example.com";
const NEWCOMER = "uid-new:nouveau@example.com";

describe.skipIf(!hasTestDb)("API (intégration HTTP)", () => {
  let db;
  let server;

  beforeAll(async () => {
    db = await resetTestDb();
    await db.sequelize.truncate({ cascade: true, restartIdentity: true });

    const { ConfigService } = await import("../src/config/configService.js");
    const configService = new ConfigService();
    configService.set("PORT", PORT);

    const { Server } = await import("../src/server/Server.js");
    const { Routes } = await import("../src/routes/Routes.js");
    server = new Server(configService.getAll());
    server.setRoutes(new Routes(server).routes());
    server.setHandleErrors();
    await new Promise((resolve) => setTimeout(resolve, 300));

    await db.User.create({ FirebaseUid: "uid-admin", Email: "admin@example.com", Role: "admin" });
    await db.User.create({ FirebaseUid: "uid-manager", Email: "gestion@example.com", Role: "manager" });
  });

  afterAll(async () => {
    await new Promise((resolve) => server?.httpServer.close(resolve));
    await db?.sequelize.close();
  });

  it("santé publique, base connectée", async () => {
    const { status, body } = await call("GET", "/health");
    expect(status).toBe(200);
    expect(body).toMatchObject({ status: "ok", db: "connected" });
  });

  it("route inconnue : 404 en JSON", async () => {
    const { status, body } = await call("GET", "/n-existe-pas");
    expect(status).toBe(404);
    expect(body.error.status).toBe(404);
  });

  it("sans jeton : 401 ; première connexion : compte créé sans rôle, sans accès admin", async () => {
    expect((await call("GET", "/user/me")).status).toBe(401);
    expect((await call("GET", "/user/me", { token: "pas-un-jeton" })).status).toBe(401);

    const me = await call("GET", "/user/me", { token: NEWCOMER });
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ Email: "nouveau@example.com", Role: "user" });

    expect((await call("GET", "/user", { token: NEWCOMER })).status).toBe(403);
    expect((await call("GET", "/user", { token: MANAGER })).status).toBe(403);
  });

  it("gestion des rôles par l'admin, avec ses garde-fous", async () => {
    const users = await call("GET", "/user", { token: ADMIN });
    expect(users.status).toBe(200);
    expect(users.body).toHaveLength(3);
    // Le FirebaseUid reste interne.
    expect(Object.keys(users.body[0]).sort()).toEqual(["Email", "Id", "Name", "Role", "createdAt"]);

    const newcomer = users.body.find((user) => user.Email === "nouveau@example.com");
    const promoted = await call("PUT", `/user/${newcomer.Id}/role`, { token: ADMIN, body: { role: "manager" } });
    expect(promoted.body.Role).toBe("manager");

    expect((await call("PUT", `/user/${newcomer.Id}/role`, { token: ADMIN, body: { role: "bidon" } })).status).toBe(400);
    expect((await call("PUT", `/user/${newcomer.Id}/role`, { token: MANAGER, body: { role: "admin" } })).status).toBe(403);
    expect((await call("PUT", "/user/99999/role", { token: ADMIN, body: { role: "manager" } })).status).toBe(404);

    // Un admin ne peut pas se rétrograder lui-même (il se verrouillerait dehors).
    const self = users.body.find((user) => user.Email === "admin@example.com");
    expect((await call("PUT", `/user/${self.Id}/role`, { token: ADMIN, body: { role: "user" } })).status).toBe(400);
  });

  it("création d'un compte par l'admin : Firebase, base et courriel de bienvenue", async () => {
    const payload = { email: " Coach@Example.com ", name: "Coach Test", role: "manager", password: "Marbre-Gant-1234" };

    expect((await call("POST", "/user", { token: MANAGER, body: payload })).status).toBe(403);
    expect((await call("POST", "/user", { token: ADMIN, body: { ...payload, password: "court" } })).status).toBe(400);
    expect((await call("POST", "/user", { token: ADMIN, body: { ...payload, email: "pas-un-courriel" } })).status).toBe(400);

    const created = await call("POST", "/user", { token: ADMIN, body: payload });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ Email: "coach@example.com", Name: "Coach Test", Role: "manager", emailStatus: "sent" });
    expect(firebase.users.get("coach@example.com").password).toBe("Marbre-Gant-1234");

    expect(mailbox.sent).toHaveLength(1);
    expect(mailbox.sent[0].to).toBe("coach@example.com");
    expect(mailbox.sent[0].text).toContain("Mot de passe : Marbre-Gant-1234");

    // Même courriel, autre casse : refusé.
    expect((await call("POST", "/user", { token: ADMIN, body: { ...payload, email: "COACH@example.com" } })).status).toBe(409);

    // Sans courriel : le compte est créé, rien ne part.
    const quiet = await call("POST", "/user", {
      token: ADMIN,
      body: { ...payload, email: "discret@example.com", sendEmail: false }
    });
    expect(quiet.body.emailStatus).toBe("skipped");
    expect(mailbox.sent).toHaveLength(1);
  });

  it("mot de passe remplacé par l'admin ; une panne SMTP ne bloque pas l'opération", async () => {
    const users = (await call("GET", "/user", { token: ADMIN })).body;
    const coach = users.find((user) => user.Email === "coach@example.com");

    mailbox.fail = true;
    const changed = await call("PUT", `/user/${coach.Id}/password`, {
      token: ADMIN,
      body: { password: "Circuit-Balle-9876", includePassword: false }
    });
    mailbox.fail = false;

    expect(changed.status).toBe(200);
    expect(changed.body).toEqual({ emailStatus: "failed" });
    expect(firebase.users.get("coach@example.com").password).toBe("Circuit-Balle-9876");

    expect((await call("PUT", `/user/${coach.Id}/password`, { token: ADMIN, body: { password: "court" } })).status).toBe(400);
    expect((await call("PUT", "/user/99999/password", { token: ADMIN, body: { password: "Circuit-Balle-9876" } })).status).toBe(404);
  });

  it("mailer : état réservé à l'admin, courriel de test, erreur SMTP visible", async () => {
    expect((await call("GET", "/mail/status", { token: MANAGER })).status).toBe(403);

    const status = await call("GET", "/mail/status", { token: ADMIN });
    expect(status.status).toBe(200);
    expect(status.body).toMatchObject({ configured: true, dryRun: false, live: true });
    expect(JSON.stringify(status.body)).not.toMatch(/password/i);

    const before = mailbox.sent.length;
    const sent = await call("POST", "/mail/test", { token: ADMIN, body: {} });
    expect(sent.status).toBe(200);
    expect(sent.body).toEqual({ to: "admin@example.com", live: true });
    expect(mailbox.sent).toHaveLength(before + 1);
    expect(mailbox.sent.at(-1).subject).toContain("Courriel de test");

    const elsewhere = await call("POST", "/mail/test", { token: ADMIN, body: { to: "Autre@Example.com" } });
    expect(elsewhere.body.to).toBe("autre@example.com");

    expect((await call("POST", "/mail/test", { token: ADMIN, body: { to: "pas-un-courriel" } })).status).toBe(400);
    expect((await call("POST", "/mail/test", { token: MANAGER, body: {} })).status).toBe(403);

    mailbox.fail = true;
    const failed = await call("POST", "/mail/test", { token: ADMIN, body: {} });
    mailbox.fail = false;
    expect(failed.status).toBe(502);
    expect(failed.body.error.message).toContain("SMTP indisponible");
  });
});
