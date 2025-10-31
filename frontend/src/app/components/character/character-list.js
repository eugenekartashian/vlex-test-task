/**
 * <character-list>
 * Search results list (icon on the left, name + description on the right).
 * - A11y: listbox/option roles, focus-visible, live regions.
 * - Keyboard: Enter/Space select.
 * - UX: min 2 chars to search, graceful empty/error states.
 */
import { LitElement, html, css } from 'lit';
import { iconTemplateFor } from '../../icons/icons.js';
import { fetchJSON } from '../../lib/http.js';
import { cachedJSON } from '../../lib/cache.js';

export class CharacterList extends LitElement {
  static properties = {
    characters: { type: Array },
    search: { type: String },
    loading: { type: Boolean },
    error: { type: String },
    selectedId: { type: Number }
  };

  constructor() {
    super();
    this.characters = [];
    this.search = '';
    this.loading = false;
    this.error = '';
    this.selectedId = null;
    this._abort = null;
  }

  updated(changed) {
    if (changed.has('search')) {
      this.fetchCharacters(this.search);
    }
  }

  disconnectedCallback() {
    if (this._abort) this._abort.abort();
    super.disconnectedCallback();
  }

  // Fetch characters for a query (abort in-flight requests on new input).
  async fetchCharacters(query) {
    const q = (query || '').trim();
    if (q.length < 2) {
      this.characters = [];
      this.loading = false;
      this.error = '';
      return;
    }

    if (this._abort) this._abort.abort();
    this._abort = new AbortController();

    this.loading = true;
    this.error = '';

    try {
      const data = await cachedJSON(
        `search:${q}`,
        () =>
          fetchJSON(`/characters?search=${encodeURIComponent(q)}`, {
            signal: this._abort.signal,
            timeoutMs: 8000
          }),
        { ttl: 30_000 }
      );

      this.characters = Array.isArray(data) ? data : [];
      this.selectedId = null;
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.error = 'Failed to load characters.';
        this.characters = [];
      }
    } finally {
      this.loading = false;
    }
  }

  // Emit selected character id to parent (navigates in app-root).
  handleSelect(id) {
    this.selectedId = id;
    this.dispatchEvent(
      new CustomEvent('char-select', {
        detail: id,
        bubbles: true,
        composed: true
      })
    );
  }

  // Keyboard activation: Enter/Space.
  handleKey(e, id) {
    if (
      e.key === 'Enter' ||
      e.key === ' ' ||
      e.key === 'Spacebar' ||
      e.code === 'Space'
    ) {
      e.preventDefault();
      this.handleSelect(id);
    }
  }

  // Render one list row (icon + name + description).
  renderRow(char) {
    // Guard: description can be empty/null — show en dash.
    const desc = (char.description || '—').trim();

    return html`
      <li
        class="row${char.id === this.selectedId ? ' selected' : ''}"
        role="option"
        tabindex="0"
        aria-selected="${char.id === this.selectedId}"
        @click=${() => this.handleSelect(char.id)}
        @keydown=${(e) => this.handleKey(e, char.id)}
      >
        <span class="icon" aria-hidden="true">${iconTemplateFor(char)}</span>

        <span class="text">
          <span class="name">${char.name}</span>
          <span class="meta"
            >Age: ${char.birth_year ? char.birth_year : '—'}
          </span>
          <span class="desc" title=${desc}>${desc}</span>
        </span>
      </li>
    `;
  }

  render() {
    const q = (this.search || '').trim();
    const showHint = !this.loading && !this.error && q.length < 2;

    return html`
      <section aria-busy=${this.loading ? 'true' : 'false'}>
        ${this.loading
          ? html`
              <ul class="results" role="listbox" aria-label="Loading results">
                ${Array.from({ length: 5 }).map(
                  () => html`
                    <li class="row skeleton" aria-hidden="true">
                      <span class="icon">
                        <span class="sk-ic"></span>
                      </span>
                      <span class="text">
                        <span class="sk-line sk-name"></span>
                        <span class="sk-line sk-meta"></span>
                        <span class="sk-line sk-desc"></span>
                      </span>
                    </li>
                  `
                )}
              </ul>
            `
          : this.error
          ? html`<div class="state error" role="alert">${this.error}</div>`
          : showHint
          ? html`<div class="state hint">
              Type at least 2 characters to search.
            </div>`
          : this.characters.length === 0
          ? html`<div class="state empty">No characters found.</div>`
          : html`
              <ul
                class="results"
                role="listbox"
                aria-label="Search results for ${q}"
              >
                ${this.characters.map((c) => this.renderRow(c))}
              </ul>
            `}
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
      color: #2f2a22;
      --sep: #d8d4d4;
      --hover-bg: #f1efef;
      --focus: #eadfd3;
      --icon: #aaa5a5;
      --icon-hover: #828282;
      --name: #1f1a12;
      --meta: #6f675d;
      --desc: #6f675d;
    }

    section {
      width: 100%;
      margin-top: 10px;
    }

    /* List container */
    .results {
      list-style: none;
      margin: 0;
      padding: 0;
      max-width: 620px;
      margin: 0 auto;
    }

    /* Row: icon + text block */
    .row {
      display: grid;
      grid-template-columns: 72px 1fr;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
      cursor: pointer;
      outline: none;
      background: transparent;
      transition: box-shadow 0.15s ease;
      position: relative;
    }

    /* Divider between rows (matches the screenshot with thin lines) */
    .row:not(:first-of-type)::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 1px;
      background: var(--sep);
      opacity: 0.9;
      z-index: 1;
    }

    .row:hover,
    .row:focus-visible {
      background: var(--hover-bg);
    }

    .row.selected {
      background: #fff8f2;
    }

    /* Icon column: big muted crest */
    .icon {
      display: grid;
      place-items: center;
      width: 72px;
      height: 72px;
      border-radius: 12px;
    }
    .icon svg {
      width: 56px;
      height: 56px;
      display: block;
    }
    .icon svg path,
    .icon svg circle,
    .icon svg g {
      fill: var(--icon) !important;
      stroke: var(--icon) !important;
    }
    .row:hover .icon svg path,
    .row:hover .icon svg circle,
    .row:hover .icon svg g,
    .row:focus-visible .icon svg path,
    .row:focus-visible .icon svg circle,
    .row:focus-visible .icon svg g {
      fill: var(--icon-hover) !important;
      stroke: var(--icon-hover) !important;
    }

    /* Text column */
    .text {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      line-height: 1.35;
    }
    .name {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--name);
      letter-spacing: -0.01em;
    }
    .meta {
      color: var(--meta);
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.2;
    }
    /* Description under the name, 2-line clamp */
    .desc {
      color: var(--desc);
      font-size: 0.98rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* State messages */
    .state {
      text-align: center;
      padding: 22px 0 14px;
      color: #a5895e;
      font-weight: 500;
    }
    .state.error {
      color: #b44c1f;
    }
    .state.hint {
      color: #9e8d74;
    }

    /* Skeletons */

    @keyframes sk-shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: 200px 0;
      }
    }

    .skeleton .icon {
      display: grid;
      place-items: center;
    }

    .sk-ic {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(90deg, #ece9e6 25%, #f4f2f0 37%, #ece9e6 63%);
      background-size: 400px 100%;
      animation: sk-shimmer 1.2s infinite linear;
    }

    .sk-line {
      display: block;
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #ece9e6 25%, #f4f2f0 37%, #ece9e6 63%);
      background-size: 400px 100%;
      animation: sk-shimmer 1.2s infinite linear;
    }

    .sk-name {
      width: 40%;
      height: 16px;
      margin: 2px 0 8px;
    }
    .sk-meta {
      width: 22%;
      height: 12px;
      margin: 0 0 10px;
    }
    .sk-desc {
      width: 92%;
      height: 12px;
    }

    /* Mobile */
    @media (max-width: 700px) {
      .row {
        grid-template-columns: 56px 1fr;
        gap: 12px;
        padding: 12px 14px;
      }
      .icon {
        width: 56px;
        height: 56px;
        border-radius: 10px;
      }
      .icon svg {
        width: 44px;
        height: 44px;
      }
      .name {
        font-size: 1rem;
      }
      .desc {
        font-size: 0.95rem;
        -webkit-line-clamp: 3;
      }
    }
  `;
}

customElements.define('character-list', CharacterList);
