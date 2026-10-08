import { booleanAttribute, Component, input } from "@angular/core";

const NAME = "Entraîneurs";

/**
 * Identité de l'application. PROVISOIRE : un monogramme dessiné ici, en attendant un
 * vrai logo. Pour le remplacer, déposer les fichiers dans public/images/ et mettre un
 * <img> à la place du <svg> (une version pour fond clair, une pour fond foncé).
 *
 * `onDark` : couleurs inversées, pour les fonds bleu marine (menu, barre du haut).
 * `showName` : ajoute le nom en texte à côté ou sous le monogramme.
 * Taille : variable CSS --brand-size sur l'élément hôte.
 */
@Component({
  selector: "app-brand",
  template: `
    <svg
      class="brand__logo"
      [class.brand__logo--on-dark]="onDark()"
      viewBox="0 0 32 32"
      role="img"
      [attr.aria-label]="showName() ? null : name"
      [attr.aria-hidden]="showName() ? 'true' : null"
    >
      <rect class="brand__tile" width="32" height="32" rx="7" />
      <path class="brand__letter" d="M11 8.5h10.5v3H14.4v3h6v3h-6v3h7.1v3H11z" />
    </svg>
    @if (showName()) {
      <span class="brand__name">{{ name }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.625rem;
    }
    :host(.brand--inline) {
      flex-direction: row;
    }
    .brand__logo {
      width: var(--brand-size, 64px);
      height: var(--brand-size, 64px);
      flex-shrink: 0;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .brand__tile {
      fill: var(--color-primary);
    }
    .brand__letter {
      fill: #fff;
    }
    .brand__logo--on-dark .brand__tile {
      fill: #fff;
    }
    .brand__logo--on-dark .brand__letter {
      fill: var(--color-primary);
    }
    .brand__name {
      /* Masquable par le parent (menu réduit) : --brand-name-display: none */
      display: var(--brand-name-display, block);
      font-weight: 700;
      font-size: 1.0625rem;
      line-height: 1.2;
      white-space: nowrap;
    }
    @media (prefers-reduced-motion: reduce) {
      .brand__logo {
        transition: none;
      }
    }
  `
})
export class Brand {
  protected readonly name = NAME;
  readonly onDark = input(false, { transform: booleanAttribute });
  readonly showName = input(false, { transform: booleanAttribute });
}
