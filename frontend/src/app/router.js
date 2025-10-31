export class Router {
  constructor({ onRoute }) {
    this.onRoute = onRoute;
    this._onPop = this._onPop.bind(this);
  }
  start() {
    window.addEventListener('popstate', this._onPop);
    this._onPop();
  }
  stop() {
    window.removeEventListener('popstate', this._onPop);
  }
  navigate(path, { replace = false } = {}) {
    if (location.pathname === path) return;
    replace
      ? window.history.replaceState({}, '', path)
      : window.history.pushState({}, '', path);
    this._onPop();
  }
  _onPop() {
    const path = location.pathname || '/';
    this.onRoute(path);
  }
}
