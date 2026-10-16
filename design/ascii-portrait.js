(() => {
  if (customElements.get('ascii-portrait')) return;
  const RAMP = ' .\'`:-~=+*cox#%&8@';
  const GLYPHS = '01<>/\\{}[]$#_=+*';
  const CELL_H = 1.75;
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const LO = hex('#2E2E33'), HI = hex('#EDEBE6'), ACC = hex('#FF5B14');
  const mix = (a, b, t) => `rgb(${a[0] + (b[0] - a[0]) * t | 0},${a[1] + (b[1] - a[1]) * t | 0},${a[2] + (b[2] - a[2]) * t | 0})`;

  class AsciiPortrait extends HTMLElement {
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>:host{display:block;position:relative}canvas{display:block;width:100%;height:auto}</style><canvas></canvas>';
      this.canvas = root.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.cols = +(this.getAttribute('cols') || 84);
      this.mouse = null; this.glitch = new Map(); this.start = 0; this.visible = false;
      this.legacy = this.getAttribute('variant') === 'legacy';
      this.reduced = this.legacy || matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.onMove = (e) => { const r = this.canvas.getBoundingClientRect(); this.mouse = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
      this.onLeave = () => { this.mouse = null; };
      this.addEventListener('pointermove', this.onMove);
      this.addEventListener('pointerleave', this.onLeave);
      this.ro = new ResizeObserver(() => this.layout()); this.ro.observe(this);
      this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible && !this.start) this.start = performance.now(); }, { threshold: 0.15 });
      this.io.observe(this);
      const img = new Image();
      img.onload = () => { this.img = img; this.sample(); this.layout(); this.loop(); };
      img.src = this.getAttribute('src');
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); this._init = false; this.shadowRoot && (this.shadowRoot.innerHTML = ''); }
    sample() {
      const { img, cols } = this;
      const rows = Math.round(cols * (img.height / img.width) / CELL_H);
      const c = document.createElement('canvas'); c.width = cols; c.height = rows;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, cols, rows);
      const d = x.getImageData(0, 0, cols, rows).data;
      const lum = new Float32Array(cols * rows);
      let mn = 1, mx = 0;
      for (let i = 0; i < cols * rows; i++) {
        const a = d[i * 4 + 3] / 255;
        const l = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
        lum[i] = a < 0.15 ? -1 : l;
        if (a >= 0.15) { mn = Math.min(mn, l); mx = Math.max(mx, l); }
      }
      for (let i = 0; i < lum.length; i++) if (lum[i] >= 0) lum[i] = Math.pow((lum[i] - mn) / (mx - mn || 1), 0.85) * 0.9 + 0.1;
      this.rows = rows; this.lum = lum;
    }
    layout() {
      if (!this.rows) return;
      const w = this.clientWidth || 400, dpr = Math.min(devicePixelRatio || 1, 2);
      this.cw = w / this.cols; this.ch = this.cw * CELL_H;
      const h = this.ch * this.rows;
      this.canvas.width = w * dpr; this.canvas.height = h * dpr; this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.font = this.legacy ? `bold ${this.cw * 1.68}px 'Courier New', Courier, monospace` : `500 ${this.cw * 1.62}px 'JetBrains Mono', ui-monospace, monospace`;
      this.ctx.textBaseline = 'top';
      this.dirty = true;
    }
    loop() {
      let last = 0;
      const tick = (t) => {
        this.raf = requestAnimationFrame(tick);
        if (!this.visible || t - last < 33) return;
        if (this.legacy && !this.dirty) return;
        last = t; this.dirty = false; this.draw(t);
      };
      this.raf = requestAnimationFrame(tick);
    }
    draw(t) {
      const { ctx, cols, rows, lum, cw, ch } = this;
      const reveal = this.reduced ? rows : Math.min(rows, ((t - this.start) / 1600) * rows);
      if (!this.reduced && Math.random() < 0.6) {
        for (let k = 0; k < 6; k++) { const i = Math.random() * lum.length | 0; if (lum[i] > 0.2) this.glitch.set(i, t + 120 + Math.random() * 220); }
      }
      ctx.clearRect(0, 0, cols * cw, rows * ch);
      const m = this.legacy ? null : this.mouse, R = 9;
      for (let y = 0; y < rows; y++) {
        if (y > reveal) break;
        const edge = reveal - y < 2 && reveal < rows;
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x, l = lum[i];
          if (l < 0) continue;
          if (this.legacy) { const c = RAMP[Math.min(RAMP.length - 1, (1 - l) * 0.95 * RAMP.length | 0)]; if (c !== ' ') { ctx.fillStyle = '#000'; ctx.fillText(c, x * cw, y * ch); } continue; }
          let ch_ = RAMP[Math.min(RAMP.length - 1, l * RAMP.length | 0)];
          let color = mix(LO, HI, l);
          const g = this.glitch.get(i);
          if (g) { if (g < t) this.glitch.delete(i); else { ch_ = GLYPHS[Math.random() * GLYPHS.length | 0]; color = mix(LO, ACC, 0.85); } }
          if (m) {
            const dx = x - m.x * cols, dy = (y - m.y * rows) * CELL_H, d = Math.sqrt(dx * dx + dy * dy);
            if (d < R) { const k = 1 - d / R; color = mix(HI, ACC, Math.min(1, k * 1.6)); if (k > 0.55) ch_ = RAMP[Math.min(RAMP.length - 1, (l + 0.25) * RAMP.length | 0)]; }
          }
          if (edge) { color = mix(LO, ACC, 1); ch_ = GLYPHS[(x + y) % GLYPHS.length]; }
          if (ch_ === ' ') continue;
          ctx.fillStyle = color;
          ctx.fillText(ch_, x * cw, y * ch);
        }
      }
    }
  }
  customElements.define('ascii-portrait', AsciiPortrait);
})();
