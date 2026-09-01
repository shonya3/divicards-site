import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

const GAMES = "blue";
const SHEETS = "green";
const NINJA = "orange";
const WIKI = "purple";
const DERIVED = "gray";

type Color = typeof GAMES | typeof SHEETS | typeof NINJA | typeof WIKI | typeof DERIVED;

const fields = (label: string, source: string, color: Color = GAMES) =>
  html`<div class="row"><span class="field">${label}</span><span class="source ${color}">${source}</span></div>`;

@customElement("p-poe-data")
export class PoeDataPage extends LitElement {
  protected render() {
    return html`
      <div class="page">
        <h1>PoeData Model</h1>
        <p class="subtitle">Where each field comes from</p>

        <div class="diagram">
          <section class="container">
            <h2 class="container-label">PoeData</h2>

            <div class="models">
              <div class="model blue-border">
                <h3 class="model-title blue">ActArea</h3>
                ${fields("id", "WorldAreas.datc64 → Id")} ${fields("name", "WorldAreas.datc64 → Name")}
                ${fields("act", "WorldAreas.datc64 → Act")} ${fields("areaLevel", "WorldAreas.datc64 → AreaLevel")}
                ${fields("hasWaypoint", "WorldAreas.datc64 → HasWaypoint")}
                ${fields("isTown", "WorldAreas.datc64 → IsTown")}
                ${fields("hasLabyrinthTrial", "LabyrinthTrials.datc64 → FK")}
                ${fields("bossfights", "MonsterVarieties.datc64 → Name")}
                ${fields("imageUrl", "← derived from id", DERIVED)}
              </div>

              <div class="model green-border">
                <h3 class="model-title green">Card</h3>
                ${fields("name", "BaseItemTypes.datc64 → Name")} ${fields("id", "BaseItemTypes.datc64 → Id")}
                ${fields("minLevel", "BaseItemTypes.datc64 → DropLevel")}
                ${fields("stackSize", "CurrencyItems.datc64 → StackSize")}
                ${fields("artFilename", "DivinationCardArt.datc64 → VirtualFile")}
                ${fields("flavourText", "FlavourText.datc64 → Text")}
                ${fields("atlasMaps", "AtlasNode.datc64 + WorldAreas.datc64")}
                ${fields("weights", "Google Sheets", SHEETS)} ${fields("price", "poe.ninja exchange API", NINJA)}
                ${fields("league", "poewiki.net Cargo API", WIKI)} ${fields("slug", "← derived from name", DERIVED)}
                ${fields("disabled", "LEGACY_CARDS constant", DERIVED)}
                ${fields("weight", "← computed from weights", DERIVED)}
              </div>

              <div class="model blue-border">
                <h3 class="model-title blue">Map</h3>
                ${fields("name", "AtlasNode.datc64 → Area1 FK")} ${fields("tier", "AtlasNode.datc64 → Tier")}
                ${fields("unique", "AtlasNode.datc64 → IsUniqueMap")}
                ${fields("icon", "AtlasNode.datc64 → Node_DDSFile")} ${fields("slug", "← derived from name", DERIVED)}
                ${fields("atlasCards", "AtlasNode.datc64 → DivCards FK")}
                <div class="row">
                  <span class="field"></span><span class="source blue">BaseItemTypes.datc64 → Name</span>
                </div>
              </div>

              <div class="model blue-border">
                <h3 class="model-title blue">MapBoss</h3>
                ${fields("name", "MonsterVarieties.datc64 → Name")} ${fields("maps", "WorldAreas.datc64 → Name")}
                <p class="note">filtered to atlas/unique map rows</p>
              </div>
            </div>
          </section>

          <div class="arrow">↓</div>

          <section class="container">
            <h2 class="container-label">DivinationCardElementData</h2>

            <div class="models">
              <div class="model gray-border">
                <h3 class="model-title gray">From Card</h3>
                ${fields("slug", "← from Card", DERIVED)} ${fields("name", "← from Card", DERIVED)}
                ${fields("artFilename", "← from Card", DERIVED)} ${fields("flavourText", "← from Card", DERIVED)}
                ${fields("stackSize", "← from Card", DERIVED)}
              </div>

              <div class="model purple-border">
                <h3 class="model-title purple">Enriched</h3>
                ${fields("rewardHtml", "poewiki.net MediaWiki API", WIKI)}
                ${fields("unique", "RePoE → uniques.json", WIKI)}
                ${fields("unique.itemClass", "RePoE → base_items.json", WIKI)}
              </div>
            </div>
          </section>
        </div>

        <div class="legend">
          <div class="legend-item"><span class="dot blue"></span> Game Files (.datc64)</div>
          <div class="legend-item"><span class="dot green"></span> Google Sheets</div>
          <div class="legend-item"><span class="dot orange"></span> poe.ninja</div>
          <div class="legend-item"><span class="dot purple"></span> poewiki.net / RePoE</div>
          <div class="legend-item"><span class="dot gray"></span> Derived / constant</div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      --blue: #3b82f6;
      --green: #22c55e;
      --orange: #f97316;
      --purple: #a855f7;
    }

    .page {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h1 {
      text-align: center;
      margin-bottom: 0.3rem;
    }

    .subtitle {
      text-align: center;
      color: var(--sl-color-gray-500);
      margin-bottom: 2rem;
    }

    .container {
      border: 2px solid var(--sl-color-gray-300);
      border-radius: 12px;
      padding: 1rem 1.5rem;
    }

    .container-label {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--sl-color-gray-700);
      margin-bottom: 0.8rem;
    }

    .models {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .model {
      background: var(--sl-color-gray-50);
      border-radius: 8px;
      padding: 0.6rem 0.8rem;
      border-width: 1.5px;
      border-style: solid;
    }

    .blue-border {
      border-color: var(--blue);
    }
    .green-border {
      border-color: var(--green);
    }
    .purple-border {
      border-color: var(--purple);
    }
    .gray-border {
      border-color: var(--sl-color-gray-300);
    }

    .model-title {
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 0.3rem;
    }

    .blue {
      color: var(--blue);
    }
    .green {
      color: var(--green);
    }
    .orange {
      color: var(--orange);
    }
    .purple {
      color: var(--purple);
    }
    .gray {
      color: var(--sl-color-gray-400);
    }

    .row {
      display: flex;
      gap: 0.5rem;
      line-height: 1.4;
    }

    .field {
      font-weight: 600;
      color: var(--sl-color-gray-800);
      min-width: 100px;
      font-size: 0.8rem;
    }

    .source {
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--blue);
    }

    .source.green {
      color: var(--green);
    }
    .source.orange {
      color: var(--orange);
    }
    .source.purple {
      color: var(--purple);
    }
    .source.gray {
      color: var(--sl-color-gray-400);
    }

    .note {
      font-size: 0.8rem;
      color: var(--sl-color-gray-400);
      margin-top: 0.4rem;
    }

    .arrow {
      text-align: center;
      font-size: 1.2rem;
      color: var(--sl-color-gray-400);
      margin: 0.5rem 0;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: center;
      margin-top: 2rem;
      padding: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      color: var(--sl-color-gray-600);
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .dot.blue {
      background: var(--blue);
    }
    .dot.green {
      background: var(--green);
    }
    .dot.orange {
      background: var(--orange);
    }
    .dot.purple {
      background: var(--purple);
    }
    .dot.gray {
      background: var(--sl-color-gray-400);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "p-poe-data": PoeDataPage;
  }
}
