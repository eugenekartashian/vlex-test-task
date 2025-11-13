import { LitElement, html, css } from 'lit';
import './components/sidebar/feature-sidebar.js';
import './components/character/character-list.js';
import './components/character/character-profile.js';
import './components/header/header-bar.js';
import { BgElement } from './icons/icons.js';
import { Router } from './router.js';

export class AppRoot extends LitElement {
  static properties = {
    route: { type: String },
    selectedId: { type: Number },
    searchQuery: { type: String }
  };

  constructor() {
    super();
    this.route = 'list';
    this.selectedId = null;
    this.searchQuery = '';
    this.router = new Router({ onRoute: (p) => this._handleRoute(p) });
  }

  connectedCallback() {
    super.connectedCallback();
    this.router.start();
  }
  disconnectedCallback() {
    this.router.stop();
    super.disconnectedCallback();
  }

  updated(changed) {
    if (changed.has('route')) {
      if (this.route === 'detail') {
        this.updateComplete.then(() =>
          this.renderRoot
            .querySelector('character-profile')
            ?.shadowRoot?.getElementById('profile-title')
            ?.focus?.()
        );
      } else {
        this.updateComplete.then(() =>
          this.renderRoot
            .querySelector('header-bar')
            ?.shadowRoot?.querySelector('#search-inp')
            ?.focus?.()
        );
      }
    }
  }

  _handleRoute(path) {
    if (path === '/' || path === '') {
      this.route = 'list';
      this.selectedId = null;
      return;
    }
    if (path === '/about') {
      this.route = 'about';
      this.selectedId = null;
      return;
    }
    const m = path.match(/^\/character\/(\d+)$/);
    if (m) {
      this.route = 'detail';
      this.selectedId = Number(m[1]);
      return;
    }
    // fallback
    this.route = 'list';
    this.selectedId = null;
  }

  /* ─────────── UI sections ─────────── */

  renderHeader() {
    return html`
      <div class="header-layer">
        <header-bar
          .value=${this.searchQuery}
          placeholder="Search for Star Wars characters"
          @search=${this.onSearchEvent}
        ></header-bar>
      </div>
    `;
  }

  renderHero() {
    return html`
      <section class="hero" aria-describedby="hero-desc">
        <h1 class="hero-title">Welcome to StarFolk Wiki</h1>

        <p id="hero-desc" class="hero-text">
          Step into a galaxy of heroes, villains, rebels, and rulers. StarFolk
          Wiki is your guide to the characters who shaped the Star Wars universe
          — from the legendary Jedi and Sith, to smugglers, droids, and everyone
          in between.
        </p>

        <p class="hero-text">Here you’ll find:</p>

        <ul class="hero-list">
          <li>Detailed profiles of characters across the saga</li>
          <li>Backgrounds, homeworlds, and key appearances</li>
          <li>Connections between stories, films, and series</li>
          <li>Fun facts and trivia that bring the galaxy to life</li>
        </ul>

        <p class="hero-text">
          Whether you’re a long-time fan or just beginning your journey,
          StarFolk Wiki is the one place where every story, big or small, finds
          its place among the stars.
        </p>

        <p class="hero-text">
          So grab your lightsaber, choose your side, and start exploring!
        </p>
      </section>
    `;
  }

  renderAbout() {
    return html`
      <section class="about" aria-labelledby="about-title">
        <h1 id="about-title">About StarFolk Wiki</h1>
        <p>
          StarFolk Wiki is a lightweight demo app built with Lit web components
          and a FastAPI backend. It showcases client-side routing, accessible
          UI, debounced search, request cancellation and a clean component
          structure.
        </p>
        <ul>
          <li>Frontend: Lit + History API Router</li>
          <li>Backend: FastAPI + SQLite (auto-seeded)</li>
          <li>
            Endpoints: <code>/characters</code>, <code>/characters/:id</code>
          </li>
        </ul>
      </section>
    `;
  }

  renderMain() {
    if (this.route === 'detail' && this.selectedId) {
      return html`<character-profile
        .characterId=${this.selectedId}
      ></character-profile>`;
    }
    if (this.route === 'about') {
      return this.renderAbout();
    }
    const showList = (this.searchQuery?.trim()?.length ?? 0) >= 1;
    return html`
      ${showList
        ? html`<character-list
            .search=${this.searchQuery}
            @char-select=${this.onCharSelect}
          ></character-list>`
        : this.renderHero()}
    `;
  }

  /* ─────────── Events / routing ─────────── */
  navigateToChar = (id) => {
    this.router.navigate(`/character/${id}`);
  };
  navigateHome = () => {
    this.router.navigate(`/`);
  };
  onSearch = (q) => {
    this.searchQuery = q ?? '';
    const hasQuery = (this.searchQuery?.trim()?.length ?? 0) >= 1;
    // If we are NOT on the list (detail/about/other) and the user starts typing, we go to the main page
    if (hasQuery && this.route !== 'list') {
      this.router.navigate('/', { replace: true });
      return;
    }
    if (!hasQuery && this.route === 'detail') {
      this.navigateHome();
    }
  };

  onSearchEvent = (e) => this.onSearch(e.detail?.query ?? e.detail ?? '');
  onCharSelect = (e) => this.navigateToChar(e.detail);

  /* ─────────── Render ─────────── */
  render() {
    return html`
      <div class="layout">
        <!-- Background illustration (decorative) -->
        <div class="bg-illustration" aria-hidden="true" role="presentation">
          ${BgElement()}
        </div>

        ${this.renderHeader()}
        <div class="main-wrapper" role="main" aria-live="polite">
          <aside>
            <feature-sidebar
              .value=${this.route === 'detail' ? this.selectedId : null}
              @char-select=${this.onCharSelect}
            ></feature-sidebar>
          </aside>
          <div class="content">${this.renderMain()}</div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: #f7f6f4;
      color: #3c3a33;
      font-synthesis-weight: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .layout {
      position: relative;
      max-width: 1268px;
      margin: 0 auto;
      padding: 16px;
      --pad-x: 16px;
    }

    .header-layer,
    .main-wrapper {
      position: relative;
      z-index: 1;
    }
    .main-wrapper {
      display: grid;
      grid-template-columns: 294px minmax(0, 1fr);
      gap: 24px;
      margin-top: 24px;
    }

    .bg-illustration {
      --bg-w: 680px;
      --bg-h: 651.61px;
      --bg-left: -210px;
      --bg-top: -70px;
      --bg-scale: clamp(0.72, (100vw - 360px) / (1268 - 360), 1);

      position: absolute;
      left: calc(var(--pad-x) + var(--bg-left));
      top: calc(var(--pad-x) + var(--bg-top));

      width: var(--bg-w);
      height: var(--bg-h);

      transform-origin: top left;
      transform: scale(var(--bg-scale));

      opacity: 0.8;
      pointer-events: none;
      user-select: none;
      z-index: 0;
    }

    .bg-illustration svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    aside {
      display: block;
    }

    .content {
      position: relative;
      min-height: 330px;
    }

    /* Hero */
    .hero {
      position: relative;
      z-index: 1;
      padding: 10px 20px;
      margin: 0 auto;
      max-width: 620px;
      background: transparent;
    }
    .hero-title {
      font-size: 2rem;
      line-height: 2.375rem;
      font-weight: 400;
      margin: 0 0 20px;
      color: #464343;
      letter-spacing: -0.03em;
    }
    .hero-text {
      margin: 0 0 16px;
      color: #464343;
      font-size: 0.875rem;
      font-weight: 400;
      letter-spacing: 0;
      line-height: 1.6;
    }
    .hero-list {
      margin: 0;
      padding-left: 18px;
      font-size: 0.875rem;
      line-height: 1.6;
      font-weight: 400;
      color: #3f3f46;
      letter-spacing: 0;
    }
    .hero-list li {
      margin: 12px 0;
    }

    .about {
      max-width: 720px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #e7e4e4;
      border-radius: 16px;
      box-shadow: 0 10px 24px #e9e5df66, 0 1px 0 #ffffff inset;
      padding: 18px 20px;
    }
    .about h1 {
      margin: 0 0 12px;
      font-size: 1.35rem;
      color: #2f2a22;
      letter-spacing: -0.01em;
    }
    .about p {
      margin: 0 0 12px;
      color: #5b5348;
      line-height: 1.6;
    }
    .about ul {
      margin: 0 0 12px;
      padding-left: 18px;
      color: #5b5348;
      line-height: 1.6;
    }
    .about code {
      background: #f6f2ee;
      border: 1px solid #e7e4e4;
      border-radius: 6px;
      padding: 0 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.92em;
    }

    /* Mobile-first: content-first layout */
    @media (max-width: 900px) {
      .layout {
        padding: 12px;
      }
      .bg-illustration {
        display: none;
      }
      .main-wrapper {
        grid-template-columns: 1fr;
      }
      .hero-title {
        font-size: 1.35rem;
      }
    }

    @media (max-width: 700px) {
      .layout {
        padding: 8px;
      }
    }
  `;
}

customElements.define('app-root', AppRoot);
