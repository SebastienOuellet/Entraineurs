import { Routes } from "@angular/router";
import { authGuard, guestGuard } from "./core/auth/auth.guard";
import { roleGuard } from "./core/auth/role.guard";
import { homeGuard } from "./core/auth/home.guard";

export const routes: Routes = [
  {
    path: "login",
    canMatch: [guestGuard],
    loadComponent: () => import("./pages/login/login").then((m) => m.Login)
  },
  {
    path: "acces-en-attente",
    canMatch: [authGuard],
    loadComponent: () => import("./pages/pending-access/pending-access").then((m) => m.PendingAccess)
  },
  {
    path: "",
    canMatch: [authGuard, homeGuard],
    loadComponent: () => import("./pages/admin/admin-shell/admin-shell").then((m) => m.AdminShell),
    children: [
      { path: "", pathMatch: "full", redirectTo: "accueil" },
      {
        path: "accueil",
        loadComponent: () => import("./pages/admin/home/home").then((m) => m.Home)
      },
      {
        path: "parametres",
        canMatch: [roleGuard("admin")],
        loadComponent: () => import("./pages/admin/settings/users-settings").then((m) => m.UsersSettings)
      },
      {
        path: "parametres/courriel",
        canMatch: [roleGuard("admin")],
        loadComponent: () => import("./pages/admin/settings/mail-settings").then((m) => m.MailSettings)
      }
    ]
  },
  { path: "**", redirectTo: "" }
];
