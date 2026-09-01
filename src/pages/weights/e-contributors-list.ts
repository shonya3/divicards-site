import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { Contributor } from "../../../gen/poeData";

@customElement("e-contributors-list")
export class ContributorsListElement extends LitElement {
  @property({ type: Array }) contributors: Contributor[] = [];

  protected render() {
    if (!this.contributors.length) return nothing;

    return html`
      <ul class="list">
        ${this.contributors.map(
          (c) =>
            html`<li>
              <span class="name">${c.name}</span><span class="amount">${c.totalCards.toLocaleString("en-US")}</span>
            </li>`,
        )}
      </ul>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .list {
      list-style: none;
      padding-inline: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    li {
      display: flex;
      justify-content: space-between;
      font-size: 1.15rem;
    }

    .name {
      font-weight: 600;
      color: var(--sl-color-gray-800);
    }

    .amount {
      color: var(--sl-color-gray-600);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "e-contributors-list": ContributorsListElement;
  }
}
