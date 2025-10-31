/**
 * <header-bar>
 * StarFolk header: logo + brand + divider + two-line tagline + search.
 */
import { LitElement, html, css } from 'lit';
import { MainLogo } from '../../icons/icons.js';

export class HeaderBar extends LitElement {
  static properties = {
    value: { type: String },
    placeholder: { type: String }
  };
  constructor() {
    super();
    this.value = '';
    this.placeholder = 'Search for Star Wars characters';
    this._debounceId = null;
  }

  _emitSearch(query) {
    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { query },
        bubbles: true,
        composed: true
      })
    );
  }

  _onInput(e) {
    this.value = e.target.value;
    this.requestUpdate();
    if (this._debounceId) clearTimeout(this._debounceId);
    this._debounceId = setTimeout(
      () => this._emitSearch(this.value.trim()),
      300
    );
  }
  _onSubmit(e) {
    e.preventDefault();
    // Immediate search on Enter (kept), but input already debounces as you type
    this._emitSearch(this.value.trim());
  }
  _clear() {
    this.value = '';
    if (this._debounceId) clearTimeout(this._debounceId);
    this._emitSearch('');
    this.updateComplete.then(() =>
      this.renderRoot?.querySelector('.sf-bar-input')?.focus()
    );
  }

  render() {
    return html`
      <header class="sfbar" role="banner">
        <div class="brand" aria-label="StarFolk">
          <a
            class="brand"
            href="/"
            aria-label="StarFolk — Home"
            title="Home page"
          >
            <span class="brand-logo" aria-hidden="true">${MainLogo()}</span>
            <span class="brand-wordmark">
              <span class="wm-star">Star</span><span class="wm-folk">Folk</span>
            </span>
          </a>
          <span class="brand-sep" aria-hidden="true"></span>
          <span class="brand-tag" aria-hidden="true"
            ><span>All the characters.</span><span>One galaxy</span></span
          >
        </div>
        <form class="sfbar-search" role="search" @submit=${this._onSubmit}>
          <label class="sr" for="search-inp">Search characters</label>
          <div class="sfbar-pill">
            <span class="sfbar-ic" aria-hidden="true"
              >${this._searchIcon()}</span
            >
            <input
              id="search-inp"
              class="sf-bar-input"
              type="search"
              .value=${this.value}
              @input=${this._onInput}
              placeholder=${this.placeholder}
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              aria-label="Search for Star Wars characters"
            />
            ${this.value
              ? html`<button
                  type="button"
                  class="sfbar-clear"
                  @click=${this._clear}
                  aria-label="Clear search"
                >
                  ${this._clearIcon()}
                </button>`
              : null}
          </div>
        </form>
      </header>
    `;
  }

  _searchIcon() {
    return html`<svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="6.5"
        fill="none"
        stroke="#5d5854"
        stroke-width="1.6"
      />
      <path
        d="M15.6 15.6 L20.2 20.2"
        stroke="#5d5854"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>`;
  }

  _clearIcon() {
    return html`<svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#75706b" />
      <path
        d="M8.5 8.5 L15.5 15.5 M15.5 8.5 L8.5 15.5"
        stroke="#ffffff"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>`;
  }

  static styles = css`
    :host {
      display: block;
    }
    .sfbar {
      width: 100%;
      margin-inline: auto;
      max-width: 1268px;
      min-height: 99px;
      margin-bottom: 2.625rem;
      box-sizing: border-box;
      padding: 12px clamp(12px, 4vw, 24px);
      background: #fff;
      border-radius: 7rem;
      border: 1px solid #e7e4e4;
      box-shadow: 0 10px 24px #e9e5df66, 0 1px 0 #ffffff inset;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: clamp(10px, 2vw, 16px);
      min-width: 0;
    }

    .brand {
      display: inline-grid;
      grid-auto-flow: column;
      align-items: center;
      column-gap: 14px;
      min-width: 0;
      flex: 0 1 auto;
    }
    a.brand,
    a.brand:hover,
    a.brand:focus,
    a.brand:active,
    a.brand:visited {
      text-decoration: none;
    }
    a.brand {
      text-decoration: none;
      outline: none;
      padding: 6px 2px 0 10px;
      border-radius: 14px;
    }
    a.brand:focus-visible {
      box-shadow: 0 0 0 6px #f4e9e2;
      background: #fff;
    }

    .brand-logo svg {
      width: 58px;
      height: 51px;
      display: block;
    }
    .brand-wordmark {
      letter-spacing: -0.03em;
      font-size: 2.65rem;
      line-height: 1.05;
      color: #3f3b37;
      margin-right: 6px;
      white-space: nowrap;
    }
    .wm-star {
      font-weight: 500;
    }
    .wm-folk {
      font-weight: 700;
    }
    .brand-sep {
      width: 1px;
      height: 34px;
      background: #aaa5a5;
      display: inline-block;
    }
    .brand-tag {
      display: grid;
      gap: 2px;
      padding-left: 2px;
      min-width: 200px;
      color: #464343;
      font-size: 0.98rem;
      line-height: 1.05;
    }

    .sfbar-search {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      overflow: visible;
    }
    .sfbar-pill {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      max-width: min(770px, 100%);
      height: 46px;
      border-radius: 999px;
      background: #fff;
      border: 1.2px solid #e1ded9;
      box-shadow: 0 6px 18px #e7e3dd40, 0 1px 0 #fff inset;
      padding: 0 12px;
      min-width: 0;
    }
    .sfbar-ic {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      color: #9c968f;
    }
    .sf-bar-input {
      flex: 1 1 0;
      min-width: 0;
      width: 0;
      border: 0;
      outline: 0;
      background: transparent;
      font: inherit;
      font-size: 0.98rem;
      color: #6c6874;
      padding: 0 4px;
    }
    .sf-bar-input::placeholder {
      color: #a7a3a0;
      opacity: 1;
    }
    .sf-bar-input::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
      display: none;
    }
    .sfbar-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 0;
      background: transparent;
      padding: 0;
      cursor: pointer;
    }
    .sfbar-clear:focus-visible {
      outline: 2px solid #d8cfc6;
      outline-offset: 2px;
      border-radius: 50%;
    }

    .sr {
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
    .sfbar-pill:focus-within {
      border-color: #dcd3c8;
      box-shadow: 0 6px 18px #e7e3dd40, 0 1px 0 #fff inset, 0 0 0 2px #eadfd3;
    }

    /* progressive compression */
    @media (max-width: 1280px) {
      .brand-wordmark {
        font-size: 1.72rem;
      }
      .brand-tag {
        font-size: 0.94rem;
      }
      .sfbar {
        gap: 12px;
      }
    }
    @media (max-width: 1120px) {
      .brand-sep,
      .brand-tag {
        display: none;
      }
      .sfbar-pill {
        max-width: 100%;
      }
    }
    @media (max-width: 900px) {
      .sfbar {
        flex-direction: column;
        align-items: stretch;
        border-radius: 36px;
      }
      .brand-wordmark {
        font-size: 1.45rem;
      }
      .sfbar-search {
        width: 100%;
      }
      .sfbar-pill {
        height: 42px;
        max-width: 100%;
      }
    }
  `;
}

customElements.define('header-bar', HeaderBar);
