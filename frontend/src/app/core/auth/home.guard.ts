import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { AuthStore } from "./auth.store";
import { UserService } from "../user.service";
import { STAFF_ROLES } from "../models/user.model";
import { ensureDbUser, loginRedirect, PENDING_ACCESS_PATH, pendingAccessRedirect } from "./auth-redirect";

/**
 * Garde du "/" racine : laisse entrer les rôles de STAFF_ROLES, et envoie les comptes
 * sans rôle vers la page d'attente plutôt que vers /login, pour éviter une boucle
 * infinie avec guestGuard (qui renvoie tout utilisateur authentifié vers "/").
 */
export const homeGuard: CanMatchFn = async () => {
  const authStore = inject(AuthStore);
  const userService = inject(UserService);
  const router = inject(Router);

  if (!(await ensureDbUser(authStore, userService))) {
    // Profil injoignable : ne pas passer par /login (guestGuard renverrait vers "/"
    // et on perdrait la page demandée), mais vers une page qui permet de réessayer.
    return authStore.isAuthenticated() ? pendingAccessRedirect(router) : loginRedirect(router);
  }

  const role = authStore.role();
  if (role && STAFF_ROLES.includes(role)) return true;

  // Authentifié mais sans rôle : ne PAS renvoyer vers /login (boucle avec guestGuard).
  return router.createUrlTree([PENDING_ACCESS_PATH]);
};
