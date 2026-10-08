import { Component, computed, inject } from "@angular/core";
import { AuthStore } from "../../../core/auth/auth.store";
import { USER_ROLE_LABELS } from "../../../core/models/user.model";

/** Page d'accueil provisoire : à remplacer par le premier écran du domaine. */
@Component({
  selector: "app-home",
  template: `
    <div class="page-header">
      <div class="page-header__title">
        <h1>Bonjour{{ name() ? " " + name() : "" }}</h1>
        <p class="page-subtitle">Connecté en tant que {{ roleLabel() }}.</p>
      </div>
    </div>

    <div class="card">
      <h2>Socle en place</h2>
      <p class="empty-state">Les écrans du projet viendront ici.</p>
    </div>
  `
})
export class Home {
  private readonly authStore = inject(AuthStore);

  readonly name = computed(() => this.authStore.dbUser()?.Name ?? null);
  readonly roleLabel = computed(() => {
    const role = this.authStore.role();
    return role ? USER_ROLE_LABELS[role].toLowerCase() : "";
  });
}
