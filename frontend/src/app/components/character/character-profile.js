/**
 * <character-profile>
 * Detail view (center content + right info panel).
 * Left sidebar stays in <app-root>. Header stays above.
 */
import { LitElement, html, css } from 'lit';
import { iconTemplateFor } from '../../icons/icons.js';
import { fetchJSON } from '../../lib/http.js';
import { cachedJSON } from '../../lib/cache.js';

export class CharacterProfile extends LitElement {
  static properties = {
    characterId: { type: Number, attribute: 'character-id' },
    loading: { type: Boolean },
    error: { type: String },
    profile: { type: Object }
  };

  constructor() {
    super();
    this.characterId = null;
    this.loading = false;
    this.error = '';
    this.profile = null;
    this._abort = null;
    this._reqKey = 0;
  }

  updated(changed) {
    if (changed.has('characterId') && this.characterId) {
      this.fetchProfile(this.characterId);
    }
  }

  disconnectedCallback() {
    if (this._abort) this._abort.abort();
    super.disconnectedCallback();
  }

  async fetchProfile(id) {
    if (this._abort) this._abort.abort();
    this._abort = new AbortController();
    const myKey = ++this._reqKey;

    this.loading = true;
    this.profile = null;
    this.error = '';
    try {
      const data = await cachedJSON(
        `character:${id}`,
        () =>
          fetchJSON(`/characters/${id}`, {
            signal: this._abort.signal,
            timeoutMs: 10000
          }),
        { ttl: 60_000 }
      );
      if (myKey === this._reqKey) this.profile = data;
    } catch (err) {
      if (!(err?.name !== 'AbortError' || err?.code === 20))
        this.error = 'Could not load character.';
    } finally {
      this.loading = false;
    }
  }

  // Helper: render a big faded emblem on the side card
  renderSideIcon() {
    const p = this.profile;
    return html`
      <div class="emblem" aria-hidden="true">
        ${p ? iconTemplateFor(p) : ''}
      </div>
    `;
  }

  // Temporary hardcoded fields (couldn't find info for API)
  get hardMeta() {
    return {
      name: this.profile?.name ?? 'Leia Organa',
      gender: this.profile?.gender ?? 'Female',
      homeworld: 'Tatooine', // mock
      films: ['Star Wars', 'Empire Strikes Back', 'Return of the Jedi']
    };
  }

  render() {
    if (this.loading)
      return html`<div class="state" role="status" aria-live="polite">
        Loading…
      </div>`;

    if (this.error) {
      return html`<div class="state error" role="alert">${this.error}</div>`;
    }
    if (!this.profile) {
      return html``;
    }

    const meta = this.hardMeta;

    return html`
      <div class="detail-grid" aria-busy=${this.loading ? 'true' : 'false'}>
        <!-- MAIN COLUMN -->
        <article class="main" aria-labelledby="profile-title">
          <h1 id="profile-title" tabindex="-1">${this.profile.name}</h1>

          <!-- Description (mock text because couldn't find info for DB) -->
          <p class="lead">
            ${this.profile.description ??
            'One of the most iconic figures in the Star Wars saga. She grew up as a princess, yet her destiny led her beyond royal duties — becoming a senator, a general, and a key leader of the Rebel Alliance.'}
          </p>

          <p>
            Leia combined courage, diplomacy, and compassion with sharp
            political instincts. She stood as a symbol of resistance against
            tyranny, inspiring generations of rebels and freedom fighters across
            the galaxy.
          </p>

          <h2 class="hsec">Core Traits</h2>
          <ul class="bullets">
            <li>Intelligent and persuasive, with strong diplomatic skills.</li>
            <li>Brave and decisive in moments of crisis.</li>
            <li>
              Deeply loyal to her allies, but unafraid to challenge them when
              needed.
            </li>
            <li>
              Naturally strong in the Force, though she focused more on
              leadership than training as a Jedi.
            </li>
          </ul>

          <h2 class="hsec">Key Moments in Her Journey</h2>
          <ul class="bullets">
            <li>
              Battle of Yavin: played a pivotal role in transmitting the Death
              Star plans.
            </li>
            <li>
              Escape from Jabba’s Palace; later led the ground assault on the
              second Death Star.
            </li>
            <li>
              Founding of the New Republic; later founded the Resistance to
              oppose the First Order.
            </li>
          </ul>

          <h2 class="hsec">Important Relationships</h2>
          <ul class="bullets">
            <li>Luke Skywalker — her twin brother.</li>
            <li>Han Solo — partner and eventual husband.</li>
            <li>Bail Organa — adoptive father.</li>
          </ul>

          <p>
            Even as she aged, Leia remained central to galactic affairs. In the
            Force Awakens, she led the Resistance in their fight against the
            First Order. In the Last Jedi, she demonstrated resilience and
            determination, guiding younger leaders like Poe Dameron.
          </p>

          <p class="foot">
            Her story is a testament to resilience, leadership, and the enduring
            power of hope.
          </p>
        </article>

        <!-- RIGHT INFO PANEL -->
        <aside class="side">
          <div class="card">
            ${this.renderSideIcon()}
            <dl class="meta">
              <dt>Name:</dt>
              <dd>${meta.name}</dd>
              <dt>Gender:</dt>
              <dd>${meta.gender}</dd>
              <dt>Homeworld:</dt>
              <dd>${meta.homeworld}</dd>
              <dt>Films:</dt>
              <dd>
                <ul class="list-plain">
                  ${meta.films.map((f) => html`<li>${f}</li>`)}
                </ul>
              </dd>
            </dl>
          </div>
        </aside>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      color: #464343;
    }

    /* Grid: center main column + right info panel. Left sidebar is outside. */
    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 293px;
      gap: 32px;
      align-items: start;
    }

    /* Main content */
    .main {
      max-width: min(38.75rem, 100%);
    }

    #profile-title {
      margin: 0 0 8px;
      font-size: 1.35rem;
      letter-spacing: -0.01em;
      color: #2f2a22;
    }

    .lead {
      margin: 0 0 10px;
      line-height: 1.6;
      color: #5b5348;
    }

    .hsec {
      margin: 18px 0 8px;
      font-size: 1.05rem;
      color: #4c463b;
    }

    .bullets {
      margin: 0 0 8px;
      padding-left: 18px;
      line-height: 1.6;
      color: #5b5348;
    }
    .bullets li {
      margin: 8px 0;
    }

    .foot {
      margin-top: 10px;
      color: #5b5348;
    }

    /* Right card */
    .side .card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e7e4e4;
      box-shadow: 0 1px 0 #ffffff inset, 0 10px 30px rgba(232, 227, 219, 0.5);
      padding: 16px;
      position: sticky;
      top: 16px;
    }

    .emblem {
      display: grid;
      place-items: center;
      padding: 32px 24px;
      border-radius: 12px;
      background: #f9f7f7;
      margin-bottom: 16px;
    }
    .emblem svg {
      max-width: 261px;
      width: 100%;
      height: auto;
    }
    .emblem svg * {
      fill: #b7b2ad !important;
      stroke: #b7b2ad !important;
      opacity: 0.9;
    }

    .meta {
      margin: 0;
      color: #464343;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: -0.03rem;
    }
    .meta dt {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.03rem;
      color: #aaa5a5;
      margin: 12px 0 6px;
      border-bottom: 1px solid #d8d4d4;
    }
    .meta dd {
      margin: 0 0 8px;
    }

    .meta dd:last-of-type {
      margin-bottom: 0;
      border-bottom: 0;
      padding-bottom: 0;
    }

    .list-plain {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .chip {
      display: none;
    }

    .state {
      text-align: center;
      padding: 20px 0;
      color: #a68548;
      font-weight: 500;
    }
    .state.error {
      color: #b44c1f;
    }

    @media (max-width: 900px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
      .side .card {
        position: static;
      }
    }
  `;
}

customElements.define('character-profile', CharacterProfile);
