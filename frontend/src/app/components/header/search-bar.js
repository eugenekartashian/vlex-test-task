// // /**
// //  * <search-bar> — search input with a11y and debounced event
// //  */
// // import { LitElement, html, css } from 'lit';

// // export class SearchBar extends LitElement {
// //   static properties = {
// //     value: { type: String }
// //   };
// //   constructor() {
// //     super();
// //     this.value = '';
// //     this._debounceTimeout = null;
// //   }
// //   render() {
// //     return html`
// //       <div class="searchbar" role="search">
// //         <label for="search" class="visually-hidden"
// //           >Search Star Wars characters</label
// //         >
// //         <input
// //           id="search"
// //           type="search"
// //           name="search"
// //           placeholder="Search for Star Wars characters"
// //           .value=${this.value}
// //           autocomplete="off"
// //           autocapitalize="off"
// //           spellcheck="false"
// //           enterkeyhint="search"
// //           aria-label="Search Star Wars characters"
// //           @input=${this.handleInput}
// //         />
// //         <span class="icon-search" aria-hidden="true"
// //           >${this.renderSearchIcon()}</span
// //         >
// //       </div>
// //     `;
// //   }

// //   renderSearchIcon() {
// //     return html`<svg width="19" height="19" fill="none" viewBox="0 0 19 19">
// //       <circle stroke="#BABABA" stroke-width="2" cx="9" cy="9" r="7.5" />
// //       <path
// //         stroke="#BABABA"
// //         stroke-width="2"
// //         stroke-linecap="round"
// //         d="M16 16l-3.2-3.2"
// //       />
// //     </svg>`;
// //   }
// //   handleInput(e) {
// //     this.value = e.target.value;
// //     if (this._debounceTimeout) clearTimeout(this._debounceTimeout);
// //     this._debounceTimeout = setTimeout(() => {
// //       this.dispatchEvent(
// //         new CustomEvent('search', {
// //           detail: { query: this.value.trim() },
// //           bubbles: true,
// //           composed: true
// //         })
// //       );
// //     }, 300); // 300ms debounce
// //   }

// //   disconnectedCallback() {
// //     if (this._debounceTimeout) clearTimeout(this._debounceTimeout);
// //     super.disconnectedCallback();
// //   }

// //   static styles = css`
// //     .visually-hidden {
// //       position: absolute !important;
// //       width: 1px;
// //       height: 1px;
// //       padding: 0;
// //       margin: -1px;
// //       overflow: hidden;
// //       clip: rect(0 0 0 0);
// //       white-space: nowrap;
// //       border: 0;
// //     }

// //     .searchbar {
// //       display: flex;
// //       align-items: center;
// //       width: 100%;
// //       position: relative;
// //       margin-bottom: 18px;
// //     }
// //     input[type='search'] {
// //       font-family: inherit;
// //       font-size: 1.1rem;
// //       width: 100%;
// //       padding: 10px 38px 10px 14px;
// //       background: #fff;
// //       color: #382f22;
// //       border: 1.5px solid #e3e1dc;
// //       border-radius: 10px;
// //       outline: none;
// //       box-sizing: border-box;
// //       transition: border 0.18s;
// //     }
// //     input[type='search']:focus {
// //       border-color: #eb7f39;
// //       background: #fffaf6;
// //     }
// //     .icon-search {
// //       position: absolute;
// //       right: 13px;
// //       top: 9px;
// //       pointer-events: none;
// //     }
// //     @media (max-width: 700px) {
// //       .searchbar {
// //         margin-bottom: 12px;
// //       }
// //       input[type='search'] {
// //         font-size: 1rem;
// //         padding: 9px 33px 9px 12px;
// //       }
// //       .icon-search {
// //         right: 8px;
// //         top: 7px;
// //         width: 17px;
// //         height: 17px;
// //       }
// //     }
// //   `;
// // }
// // customElements.define('search-bar', SearchBar);

// /**
//  * <search-bar> — search input with a11y, debounced "search" event and clear button
//  */
// import { LitElement, html, css } from 'lit';

// export class SearchBar extends LitElement {
//   static properties = {
//     value: { type: String },
//     placeholder: { type: String }
//   };

//   constructor() {
//     super();
//     this.value = '';
//     this.placeholder = 'Search for Star Wars characters';
//     this._debounceId = null;
//   }

//   _emitSearch(query) {
//     this.dispatchEvent(
//       new CustomEvent('search', {
//         detail: { query },
//         bubbles: true,
//         composed: true
//       })
//     );
//   }

//   _onInput(e) {
//     this.value = e.target.value;
//     if (this._debounceId) clearTimeout(this._debounceId);
//     this._debounceId = setTimeout(
//       () => this._emitSearch(this.value.trim()),
//       300
//     );
//   }

//   _onSubmit(e) {
//     e.preventDefault();
//     this._emitSearch(this.value.trim());
//   }

//   _clear() {
//     this.value = '';
//     if (this._debounceId) clearTimeout(this._debounceId);
//     this._emitSearch('');
//     this.updateComplete.then(() =>
//       this.renderRoot?.querySelector('.sf-bar-input')?.focus()
//     );
//   }

//   disconnectedCallback() {
//     if (this._debounceId) clearTimeout(this._debounceId);
//     super.disconnectedCallback();
//   }

//   render() {
//     return html`
//       <form class="sfbar-search" role="search" @submit=${this._onSubmit}>
//         <label class="sr" for="search-inp">Search characters</label>
//         <div class="sfbar-pill">
//           <span class="sfbar-ic" aria-hidden="true">
//             ${this._searchIcon()}
//           </span>
//           <input
//             id="search-inp"
//             class="sf-bar-input"
//             type="search"
//             .value=${this.value}
//             @input=${this._onInput}
//             placeholder=${this.placeholder}
//             autocomplete="off"
//             autocapitalize="off"
//             spellcheck="false"
//             enterkeyhint="search"
//             aria-label=${this.placeholder}
//           />
//           ${this.value
//             ? html`
//                 <button
//                   type="button"
//                   class="sfbar-clear"
//                   @click=${this._clear}
//                   aria-label="Clear search"
//                 >
//                   ${this._clearIcon()}
//                 </button>
//               `
//             : null}
//         </div>
//       </form>
//     `;
//   }

//   _searchIcon() {
//     return html`<svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       aria-hidden="true"
//     >
//       <circle
//         cx="10.5"
//         cy="10.5"
//         r="6.5"
//         fill="none"
//         stroke="#5d5854"
//         stroke-width="1.6"
//       />
//       <path
//         d="M15.6 15.6 L20.2 20.2"
//         stroke="#5d5854"
//         stroke-width="1.6"
//         stroke-linecap="round"
//       />
//     </svg>`;
//   }

//   _clearIcon() {
//     return html`<svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       aria-hidden="true"
//     >
//       <circle cx="12" cy="12" r="10" fill="#75706b" />
//       <path
//         d="M8.5 8.5 L15.5 15.5 M15.5 8.5 L8.5 15.5"
//         stroke="#ffffff"
//         stroke-width="1.8"
//         stroke-linecap="round"
//       />
//     </svg>`;
//   }

//   static styles = css`
//     :host {
//       display: block;
//       width: 100%;
//       min-width: 0;
//     }

//     .sr {
//       position: absolute !important;
//       width: 1px;
//       height: 1px;
//       padding: 0;
//       margin: -1px;
//       overflow: hidden;
//       clip: rect(0 0 0 0);
//       white-space: nowrap;
//       border: 0;
//     }

//     .sfbar-search {
//       flex: 1 1 auto;
//       min-width: 0;
//       display: flex;
//       align-items: center;
//       justify-content: flex-end;
//       overflow: visible;
//       width: 100%;
//     }

//     .sfbar-pill {
//       position: relative;
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       width: 100%;
//       max-width: min(770px, 100%);
//       height: 46px;
//       border-radius: 999px;
//       background: #fff;
//       border: 1.2px solid #e1ded9;
//       box-shadow: 0 6px 18px #e7e3dd40, 0 1px 0 #fff inset;
//       padding: 0 12px;
//       min-width: 0;
//       box-sizing: border-box;
//     }

//     .sfbar-ic {
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       width: 28px;
//       height: 28px;
//       color: #9c968f;
//     }

//     .sf-bar-input {
//       flex: 1 1 0;
//       min-width: 0;
//       width: 0;
//       border: 0;
//       outline: 0;
//       background: transparent;
//       font: inherit;
//       font-size: 0.98rem;
//       color: #6c6874;
//       padding: 0 4px;
//     }

//     .sf-bar-input::placeholder {
//       color: #a7a3a0;
//       opacity: 1;
//     }

//     .sf-bar-input::-webkit-search-cancel-button {
//       -webkit-appearance: none;
//       appearance: none;
//       display: none;
//     }

//     .sfbar-clear {
//       position: absolute;
//       right: 8px;
//       top: 50%;
//       transform: translateY(-50%);
//       width: 28px;
//       height: 28px;
//       border-radius: 50%;
//       border: 0;
//       background: transparent;
//       padding: 0;
//       cursor: pointer;
//     }

//     .sfbar-clear:focus-visible {
//       outline: 2px solid #d8cfc6;
//       outline-offset: 2px;
//       border-radius: 50%;
//     }

//     .sfbar-pill:focus-within {
//       border-color: #dcd3c8;
//       box-shadow: 0 6px 18px #e7e3dd40, 0 1px 0 #fff inset, 0 0 0 2px #eadfd3;
//     }

//     @media (max-width: 1120px) {
//       .sfbar-pill {
//         max-width: 100%;
//       }
//     }

//     @media (max-width: 900px) {
//       .sfbar-search {
//         width: 100%;
//         justify-content: stretch;
//       }
//       .sfbar-pill {
//         height: 42px;
//         max-width: 100%;
//       }
//     }
//   `;
// }

// customElements.define('search-bar', SearchBar);

/**
 * <search-bar> — search input with a11y, debounced "search" event and clear button
 */
import { LitElement, html, css } from 'lit';

export class SearchBar extends LitElement {
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
    if (this._debounceId) clearTimeout(this._debounceId);
    this._debounceId = setTimeout(
      () => this._emitSearch(this.value.trim()),
      300
    );
  }

  _onSubmit(e) {
    e.preventDefault();
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

  disconnectedCallback() {
    if (this._debounceId) clearTimeout(this._debounceId);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <form class="sfbar-search" role="search" @submit=${this._onSubmit}>
        <label class="sr" for="search-inp">Search characters</label>
        <div class="sfbar-pill">
          <span class="sfbar-ic" aria-hidden="true">
            ${this._searchIcon()}
          </span>
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
            enterkeyhint="search"
            aria-label=${this.placeholder}
          />
          ${this.value
            ? html`
                <button
                  type="button"
                  class="sfbar-clear"
                  @click=${this._clear}
                  aria-label="Clear search"
                >
                  ${this._clearIcon()}
                </button>
              `
            : null}
        </div>
      </form>
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
      width: 100%;
      min-width: 0;
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

    .sfbar-search {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      overflow: visible;
      width: 100%;
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
      box-sizing: border-box;
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

    .sfbar-pill:focus-within {
      border-color: #dcd3c8;
      box-shadow: 0 6px 18px #e7e3dd40, 0 1px 0 #fff inset, 0 0 0 2px #eadfd3;
    }

    @media (max-width: 1120px) {
      .sfbar-pill {
        max-width: 100%;
      }
    }

    @media (max-width: 900px) {
      .sfbar-search {
        width: 100%;
        justify-content: stretch;
      }
      .sfbar-pill {
        height: 42px;
        max-width: 100%;
      }
    }
  `;
}

customElements.define('search-bar', SearchBar);
