/**
 * <header-bar>
 * StarFolk header: logo + brand + divider + two-line tagline + search.
 */
import { LitElement, html, css } from 'lit';
import { MainLogo } from '../../icons/icons.js';
import './search-bar.js';

export class HeaderBar extends LitElement {
  static properties = {
    value: { type: String },
    placeholder: { type: String }
  };

  constructor() {
    super();
    this.value = '';
    this.placeholder = 'Search for Star Wars characters';
  }

  _onSearch(e) {
    const query = e.detail?.query ?? '';
    this.value = query;

    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { query },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <header class="sfbar" role="banner">
        <div class="brand-wrap" aria-label="StarFolk">
          <a
            class="brand-link"
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

          <span class="brand-tag" aria-hidden="true">
            <span>All the characters.</span>
            <span>One galaxy</span>
          </span>
        </div>

        <search-bar
          .value=${this.value}
          .placeholder=${this.placeholder}
          @search=${this._onSearch}
        ></search-bar>
      </header>
    `;
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

    .brand-wrap {
      display: inline-grid;
      grid-auto-flow: column;
      align-items: center;
      column-gap: 14px;
      min-width: 0;
      flex: 0 1 auto;
    }

    .brand-link,
    .brand-link:hover,
    .brand-link:focus,
    .brand-link:active,
    .brand-link:visited {
      text-decoration: none;
    }

    .brand-link {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      outline: none;
      gap: 0.5rem;
      padding: 6px 2px 0 10px;
      border-radius: 14px;
    }

    .brand-link:focus-visible {
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
      padding-left: 10px;
      min-width: 200px;
      color: #464343;
      font-size: 0.98rem;
      line-height: 1.05;
    }

    search-bar {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      overflow: visible;
    }

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

    @media (max-width: 900px) {
      .sfbar {
        flex-direction: column;
        align-items: stretch;
        border-radius: 36px;
      }
      .brand-wordmark {
        font-size: 1.45rem;
      }

      search-bar {
        width: 100%;
        justify-content: stretch;
      }
    }
  `;
}

customElements.define('header-bar', HeaderBar);
