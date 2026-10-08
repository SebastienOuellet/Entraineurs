import { Component, computed, DestroyRef, HostListener, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";
import { AuthStore } from "../../../core/auth/auth.store";
import { Brand } from "../../../shared/brand/brand";

type NavIcon = "home" | "settings";

interface NavItem {
  path: string;
  label: string;
  icon: NavIcon;
  /** Réservé à l'admin (les autres rôles ne le voient pas). */
  adminOnly?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { path: "/accueil", label: "Accueil", icon: "home" },
  { path: "/parametres", label: "Paramètres", icon: "settings", adminOnly: true }
];

/** Clé localStorage : préférence « menu réduit » propre à ce navigateur. */
const COLLAPSED_STORAGE_KEY = "entraineurs.sidebarCollapsed";

@Component({
  selector: "app-admin-shell",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Brand],
  templateUrl: "./admin-shell.html",
  styleUrl: "./admin-shell.scss"
})
export class AdminShell {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly dbUser = this.authStore.dbUser;

  readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.adminOnly || this.authStore.role() === "admin")
  );

  /** Menu latéral en tiroir (mobile/tablette seulement). */
  readonly menuOpen = signal(false);

  /** Menu réduit aux icônes (grand écran seulement ; ignoré sur mobile). */
  readonly collapsed = signal(readCollapsedPreference());

  constructor() {
    // Après chaque navigation : referme le tiroir (mobile).
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(() => this.closeMenu());
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  toggleCollapsed(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
    } catch {
      // Stockage indisponible (navigation privée) : la préférence vaut pour la session seulement.
    }
  }

  @HostListener("document:keydown.escape")
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  async logout(): Promise<void> {
    await this.authStore.logout();
    await this.router.navigate(["/login"]);
  }
}

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
