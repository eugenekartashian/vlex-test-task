/**
 * <search-bar> — search input with a11y and debounced event
 */
import { LitElement, html, css } from 'lit';

export class SearchBar extends LitElement {
  static properties = {
    value: { type: String }
  };
  constructor() {
    super();
    this.value = '';
    this._debounceTimeout = null;
  }
  render() {
    return html`
      <div class="searchbar" role="search">
        <label for="search" class="visually-hidden"
          >Search Star Wars characters</label
        >
        <input
          id="search"
          type="search"
          name="search"
          placeholder="Search for Star Wars characters"
          .value=${this.value}
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="search"
          aria-label="Search Star Wars characters"
          @input=${this.handleInput}
        />
        <span class="icon-search" aria-hidden="true"
          >${this.renderSearchIcon()}</span
        >
      </div>
    `;
  }

  renderSearchIcon() {
    return html`<svg width="19" height="19" fill="none" viewBox="0 0 19 19">
      <circle stroke="#BABABA" stroke-width="2" cx="9" cy="9" r="7.5" />
      <path
        stroke="#BABABA"
        stroke-width="2"
        stroke-linecap="round"
        d="M16 16l-3.2-3.2"
      />
    </svg>`;
  }
  handleInput(e) {
    this.value = e.target.value;
    if (this._debounceTimeout) clearTimeout(this._debounceTimeout);
    this._debounceTimeout = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('search', {
          detail: { query: this.value.trim() },
          bubbles: true,
          composed: true
        })
      );
    }, 300); // 300ms debounce
  }

  disconnectedCallback() {
    if (this._debounceTimeout) clearTimeout(this._debounceTimeout);
    super.disconnectedCallback();
  }

  static styles = css`
    .visually-hidden {
      position: absolute !important;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }

    .searchbar {
      display: flex;
      align-items: center;
      width: 100%;
      position: relative;
      margin-bottom: 18px;
    }
    input[type='search'] {
      font-family: inherit;
      font-size: 1.1rem;
      width: 100%;
      padding: 10px 38px 10px 14px;
      background: #fff;
      color: #382f22;
      border: 1.5px solid #e3e1dc;
      border-radius: 10px;
      outline: none;
      box-sizing: border-box;
      transition: border 0.18s;
    }
    input[type='search']:focus {
      border-color: #eb7f39;
      background: #fffaf6;
    }
    .icon-search {
      position: absolute;
      right: 13px;
      top: 9px;
      pointer-events: none;
    }
    @media (max-width: 700px) {
      .searchbar {
        margin-bottom: 12px;
      }
      input[type='search'] {
        font-size: 1rem;
        padding: 9px 33px 9px 12px;
      }
      .icon-search {
        right: 8px;
        top: 7px;
        width: 17px;
        height: 17px;
      }
    }
  `;
}
customElements.define('search-bar', SearchBar);
