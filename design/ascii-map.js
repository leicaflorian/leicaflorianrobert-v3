(() => {
  if (customElements.get('ascii-map')) return;
  const load = (src, integrity) => new Promise((res, rej) => {
    const ex = document.querySelector(`script[src="${src}"]`);
    if (ex) { if (ex.dataset.loaded) return res(); ex.addEventListener('load', res); ex.addEventListener('error', rej); return; }
    const s = document.createElement('script'); s.src = src; s.integrity = integrity; s.crossOrigin = 'anonymous';
    s.onload = () => { s.dataset.loaded = '1'; res(); }; s.onerror = rej; document.head.appendChild(s);
  });
  let libs;
  const getLibs = () => libs || (libs = (async () => {
    if (!window.d3) await load('https://unpkg.com/d3@7.9.0/dist/d3.min.js', 'sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i');
    if (!window.topojson) await load('https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js', 'sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67');
    const topo = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')).json();
    return topojson.feature(topo, topo.objects.countries).features;
  })());
  const CELL_H = 1.7;

  class AsciiMap extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>:host{display:block;position:relative}canvas{display:block;width:100%}</style><canvas></canvas>';
      this.canvas = root.querySelector('canvas'); this.ctx = this.canvas.getContext('2d');
      this.cols = +(this.getAttribute('cols') || 64);
      this.lon = +(this.getAttribute('lon') || 11.55); this.lat = +(this.getAttribute('lat') || 45.55);
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.ro = new ResizeObserver(() => this.layout()); this.ro.observe(this);
      getLibs().then(f => { this.features = f; this.build(); this.layout(); this.loop(); }).catch(e => console.warn('ascii-map', e));
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this._init = false; this.shadowRoot && (this.shadowRoot.innerHTML = ''); }
    build() {
      const cols = this.cols, rows = Math.round(cols * 1.15 / CELL_H) * 1;
      const W = cols, H = Math.round(rows * CELL_H);
      const ita = this.features.find(f => +f.id === 380);
      const proj = d3.geoMercator().fitExtent([[1, 1], [W - 1, H - 1]], ita);
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      const path = d3.geoPath(proj, x);
      const near = this.features.filter(f => [250, 756, 40, 705, 191, 70, 499, 8, 674, 336, 470].includes(+f.id) || ['France', 'Switzerland', 'Austria', 'Slovenia', 'Croatia'].includes(f.properties.name));
      x.fillStyle = '#f00'; near.forEach(f => { x.beginPath(); path(f); x.fill(); });
      x.fillStyle = '#0f0'; x.beginPath(); path(ita); x.fill();
      const d = x.getImageData(0, 0, W, H).data;
      const grid = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        const py = Math.min(H - 1, Math.round((r + 0.5) * CELL_H)), i = (py * W + q) * 4;
        grid[r * cols + q] = d[i + 1] > 120 ? 2 : d[i] > 120 ? 1 : 0;
      }
      const [px, py] = proj([this.lon, this.lat]);
      this.rows = rows; this.grid = grid; this.pin = { x: px, y: py / CELL_H };
    }
    layout() {
      if (!this.rows) return;
      const w = this.clientWidth || 400, dpr = Math.min(devicePixelRatio || 1, 2);
      this.cw = w / this.cols; this.ch = this.cw * CELL_H;
      const h = this.ch * this.rows;
      this.canvas.width = w * dpr; this.canvas.height = h * dpr; this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.font = `500 ${this.cw * 1.55}px 'JetBrains Mono', ui-monospace, monospace`;
      this.ctx.textBaseline = 'middle'; this.ctx.textAlign = 'center';
    }
    loop() {
      let last = 0;
      const tick = (t) => { this.raf = requestAnimationFrame(tick); if (t - last < 40) return; last = t; this.draw(t); };
      this.raf = requestAnimationFrame(tick);
    }
    draw(t) {
      const { ctx, cols, rows, grid, cw, ch, pin } = this;
      ctx.clearRect(0, 0, cols * cw, rows * ch);
      const wave = this.reduced ? -1 : ((t / 90) % 40);
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        const g = grid[r * cols + q];
        const dx = q - pin.x, dy = (r - pin.y) * CELL_H, dist = Math.sqrt(dx * dx + dy * dy);
        let chr, col;
        if (g === 2) { chr = '#'; col = '#8F8C85'; if (dist < 9) { col = '#EDEBE6'; chr = '@'; } }
        else if (g === 1) { chr = '+'; col = '#2E2E33'; }
        else { if ((q + r) % 2) continue; chr = '·'; col = '#1F1F23'; }
        if (wave >= 0 && Math.abs(dist - wave) < 0.9) { col = g ? '#FF5B14' : '#7A2E0C'; if (!g) chr = '·'; }
        ctx.fillStyle = col; ctx.fillText(chr, (q + 0.5) * cw, (r + 0.5) * ch);
      }
      const on = this.reduced || Math.floor(t / 500) % 2 === 0;
      ctx.fillStyle = '#FF5B14';
      ctx.fillText(on ? '◉' : '●', (pin.x + 0.5) * cw, (pin.y + 0.5) * ch);
    }
  }
  customElements.define('ascii-map', AsciiMap);
})();
