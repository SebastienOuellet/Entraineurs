export type UserRole = "admin" | "manager" | "user";

export interface User {
  Id: number;
  FirebaseUid: string;
  Email: string;
  Name: string | null;
  Role: UserRole;
}

/** Utilisateur tel que retourné par l'API de gestion (GET /api/user, admin seulement). */
export interface ManagedUser {
  Id: number;
  Email: string;
  Name: string | null;
  Role: UserRole;
  createdAt: string;
}

export interface NewUserRequest {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  sendEmail: boolean;
  includePassword: boolean;
}

export type AccountEmailStatus = "sent" | "logged" | "failed" | "skipped";

export const ACCOUNT_EMAIL_STATUS_LABELS: Record<AccountEmailStatus, string> = {
  sent: "Courriel envoyé à l'utilisateur.",
  logged: "Courriel NON envoyé : SMTP non configuré sur le serveur (journalisé seulement).",
  failed: "Échec de l'envoi du courriel : communiquez les informations vous-même.",
  skipped: "Aucun courriel envoyé (option décochée)."
};

/** Miroir de MIN_PASSWORD_LENGTH côté backend. */
export const MIN_PASSWORD_LENGTH = 8;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  manager: "Gestionnaire",
  user: "Aucun accès"
};

/** Rôles qui entrent dans l'application (miroir du backend : admin et manager). */
export const STAFF_ROLES: UserRole[] = ["admin", "manager"];
