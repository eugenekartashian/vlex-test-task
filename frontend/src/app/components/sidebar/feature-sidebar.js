/**
 * <feature-sidebar>
 * Featured Characters card (pixel-perfect to the mock).
 *
 * Accessibility:
 * - <nav role="region"> with aria-label
 * - <ul role="listbox"> and <li role="option">
 * - Keyboard: Enter/Space to select, focus-visible ring
 *
 * Data flow:
 * - Loads /characters (expects array with { id, name, faction? })
 * - Prefers a specific "featured" order by names from the mock
 *   (Lando Calrissian, Leia Organa, Darth Vader); falls back to first 3
 * - If faction is missing, hydrates from /characters/:id
 *
 * State:
 * - loading, error, characters[]
 * - selectedId + value (externally controlled)
 */
import { LitElement, html, css } from 'lit';
import { iconTemplateFor } from '../../icons/icons.js';

const API_BASE = 'http://localhost:8000';
const FEATURED_NAMES = ['Lando Calrissian', 'Leia Organa', 'Darth Vader'];

export class FeatureSidebar extends LitElement {
  static properties = {
    characters: { type: Array },
    loading: { type: Boolean, reflect: true },
    error: { type: String },
    value: { type: Number, attribute: 'value', reflect: true }
  };

  constructor() {
    super();
    this.characters = [];
    this.loading = true;
    this.error = '';
    this.value = null;
    this._abort = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchFeatured();
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
    super.disconnectedCallback();
  }

  async _fetchFeatured() {
    this.loading = true;
    this.error = '';
    if (this._abort) this._abort.abort();
    this._abort = new AbortController();

    try {
      const listResp = await fetch(`${API_BASE}/characters`, {
        signal: this._abort.signal
      });
      if (!listResp.ok) throw new Error(`API error: ${listResp.status}`);
      const all = (await listResp.json()) ?? [];

      const byName = FEATURED_NAMES.map((n) =>
        all.find((c) => c?.name === n)
      ).filter(Boolean);
      const basePick =
        byName.length === FEATURED_NAMES.length ? byName : all.slice(0, 3);

      const hydrated = await Promise.all(
        basePick.map(async (c) => {
          if (c && 'faction' in c && 'description' in c) return c;
          try {
            const r = await fetch(`${API_BASE}/characters/${c.id}`, {
              signal: this._abort.signal
            });
            if (!r.ok) return c;
            const d = await r.json();
            return { ...c, faction: d.faction, description: d.description };
          } catch {
            return c;
          }
        })
      );

      this.characters = hydrated;
    } catch (e) {
      if (e.name !== 'AbortError') {
        this.error = 'Could not load featured characters.';
        this.characters = [];
      }
    } finally {
      this.loading = false;
      this._abort = null;
    }
  }

  _select(id) {
    this.value = id;
    this.dispatchEvent(
      new CustomEvent('char-select', {
        detail: id,
        bubbles: true,
        composed: true
      })
    );
  }
  _onKeydown(e, id) {
    if (
      e.key === 'Enter' ||
      e.key === ' ' ||
      e.key === 'Spacebar' ||
      e.code === 'Space'
    ) {
      e.preventDefault();
      this._select(id);
    }
  }

  render() {
    return html`
      <nav
        class="card"
        role="region"
        aria-label="Featured Characters"
        aria-busy=${this.loading ? 'true' : 'false'}
      >
        <h2 id="feat-title" class="title">Featured Characters:</h2>

        ${this.loading
          ? html`<div class="state" role="status" aria-live="polite">
              Loading…
            </div>`
          : this.error
          ? html`<div class="state error" role="alert">${this.error}</div>`
          : html`
              <ul class="list" role="listbox" aria-labelledby="feat-title">
                ${this.characters.map(
                  (char) => html`
                    <li
                      role="option"
                      aria-selected="${char.id === this.value}"
                      tabindex="0"
                      class="item ${char.id === this.value
                        ? 'is-selected'
                        : ''}"
                      @click=${() => this._select(char.id)}
                      @keydown=${(e) => this._onKeydown(e, char.id)}
                    >
                      <span class="icon" aria-hidden="true"
                        >${iconTemplateFor(char)}</span
                      >
                      <span class="name" title=${char.name}>${char.name}</span>
                    </li>
                  `
                )}
              </ul>
            `}

        <div class="footer">
          <span class="org">2025 Star Wardens LTD.</span>
          <span class="sep" aria-hidden="true">|</span>
          <a class="about" href="/about">About us</a>
        </div>
      </nav>
    `;
  }

  static styles = css`
    :host {
      display: block;
      color: #3b372e;
      --sf-orange: #eb6a00;
      --sf-pill: #f9f7f7;
      --sf-pill-hover: #ebe8e6;
      --sf-border: #e7e3df;
      --sf-shadow: 0 6px 18px #e4e0da80, 0 1px 0 #ffffffa0 inset;
      --sf-text-dim: #98928a;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      min-height: 302px;
      box-shadow: var(--sf-shadow);
      border: 1px solid #e7e4e4;
      padding: 16px 16px 12px 16px;
      display: flex;
      flex-direction: column;
    }
    .title {
      margin: 0 2px 24px;
      font-size: 1.25rem;
      line-height: 1;
      font-weight: 500;
      color: #464343;
      letter-spacing: 0;
    }
    .list {
      list-style: none;
      padding: 0;
      margin: 0 0 6px;
      display: grid;
      gap: 8px;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: var(--sf-pill);
      border-radius: 8px;
      cursor: pointer;
      outline: none;
      border: 1px solid transparent;
      transition: background 120ms ease, color 120ms ease,
        border-color 120ms ease, box-shadow 120ms ease;
      color: #464343;
    }
    .icon {
      width: 28px;
      height: 28px;
      display: inline-grid;
      place-items: center;
      color: #b7b2ad;
      flex: 0 0 28px;
    }
    .icon :where(svg) {
      width: 28px;
      height: 28px;
      display: block;
    }
    .icon :where(path, circle, rect, polygon) {
      fill: currentColor !important;
      transition: fill 120ms ease;
    }
    .name {
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: 0;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item:hover {
      background: var(--sf-pill-hover);
      color: #2d2b25;
    }
    .item:focus-visible {
      background: var(--sf-pill-hover);
      border-color: #f2d3bf;
      box-shadow: 0 0 0 3px #f6e5dc;
    }
    .item:hover .icon,
    .item:focus-visible .icon {
      color: #9b958f;
    }
    .item.is-selected {
      background: var(--sf-orange);
      color: #fff;
    }
    .item.is-selected .icon {
      color: #fff;
    }
    .state {
      text-align: center;
      color: var(--sf-text-dim);
      padding: 14px 0 10px;
      font-weight: 500;
      min-height: 36px;
    }
    .state.error {
      color: #9e2f2f;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: auto;
      white-space: nowrap;
    }
    .org {
      font-size: 1rem;
      font-weight: 400;
      line-height: 1;
      letter-spacing: -0.03em;
      color: #aaa5a5;
    }
    .sep {
      color: #d8d4cf;
    }
    .about {
      color: var(--sf-orange);
      font-size: 1rem;
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 2px;
      letter-spacing: -0.03em;
    }
    .about:focus-visible {
      outline: 3px solid #f6e5dc;
      border-radius: 4px;
    }
    @media (min-width: 700px) {
      .icon,
      .icon :where(svg) {
        width: 24px;
        height: 24px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .item,
      .icon :where(path, circle, rect, polygon) {
        transition: none;
      }
    }
  `;
}

customElements.define('feature-sidebar', FeatureSidebar);
