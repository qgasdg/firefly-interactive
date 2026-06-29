class FireflyEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fireflies = [];
    this.mouse = { x: -9999, y: -9999 };
    this.dims = { width: 0, height: 0 };
    this.rafId = null;
    this.running = false;

    this.options = {
      count:           options.count           ?? 55,
      color:           options.color           ?? [255, 210, 100],
      minOpacity:      options.minOpacity      ?? 0.2,
      maxOpacity:      options.maxOpacity      ?? 0.45,
      minSize:         options.minSize         ?? 2,
      maxSize:         options.maxSize         ?? 5,
      baseSpeed:       options.baseSpeed       ?? 0.35,   // normal drift (px/frame)
      burstSpeed:      options.burstSpeed      ?? 6,      // max burst on repulsion
      burstDecay:      options.burstDecay      ?? 0.92,   // decay rate back to base
      wanderStrength:  options.wanderStrength  ?? 0.04,
      repulsionRadius: options.repulsionRadius ?? 110,
    };

    this._onMouseMove      = this._onMouseMove.bind(this);
    this._onResize         = this._onResize.bind(this);
    this._onVisibility     = this._onVisibility.bind(this);
    this._animate          = this._animate.bind(this);
  }

  start() {
    this._updateDimensions();
    this._init();
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('resize',    this._onResize);
    document.addEventListener('visibilitychange', this._onVisibility);
    this.running = true;
    this._scheduleFrame();
  }

  stop() {
    this.running = false;
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('resize',    this._onResize);
    document.removeEventListener('visibilitychange', this._onVisibility);
    if (this.rafId)      { cancelAnimationFrame(this.rafId); this.rafId = null; }
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  _scheduleFrame() {
    // RAF when visible, setInterval fallback when hidden
    if (!document.hidden) {
      if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
      this.rafId = requestAnimationFrame(this._animate);
    } else {
      if (!this.intervalId) {
        this.intervalId = setInterval(this._animate, 16);
      }
    }
  }

  _updateDimensions() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w > 0 && h > 0) {
      this.canvas.width  = w;
      this.canvas.height = h;
      this.dims = { width: w, height: h };
    }
  }

  _init() {
    const { width, height } = this.dims;
    if (width === 0 || height === 0) return;
    const o = this.options;
    this.fireflies = Array.from({ length: o.count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const op    = o.minOpacity + Math.random() * (o.maxOpacity - o.minOpacity);
      return {
        x:             Math.random() * width,
        y:             Math.random() * height,
        angle,
        speed:         o.baseSpeed,           // current speed (mutable)
        size:          o.minSize + Math.random() * (o.maxSize - o.minSize),
        opacity:       op,
        targetOpacity: op,
      };
    });
  }

  _onMouseMove(e) {
    this.mouse = { x: e.clientX, y: e.clientY };
  }

  _onResize() {
    this._updateDimensions();
  }

  _onVisibility() {
    if (this.running) this._scheduleFrame();
  }

  _animate() {
    if (!this.running) return;

    const { width, height } = this.dims;
    if (width === 0 || height === 0) {
      this.rafId = requestAnimationFrame(this._animate);
      return;
    }

    const ctx = this.ctx;
    const o   = this.options;
    const [r, g, b] = o.color;

    ctx.clearRect(0, 0, width, height);

    for (const f of this.fireflies) {
      // --- Wander: slowly rotate heading ---
      f.angle += (Math.random() - 0.5) * o.wanderStrength;

      // --- Repulsion: burst away from cursor ---
      const dx   = f.x - this.mouse.x;
      const dy   = f.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < o.repulsionRadius && dist > 0) {
        // Redirect angle away from cursor
        f.angle = Math.atan2(dy, dx);
        // Kick speed up proportionally to closeness
        const burst = (1 - dist / o.repulsionRadius) * o.burstSpeed;
        if (burst > f.speed) f.speed = burst;
      }

      // --- Decay speed back toward base ---
      if (f.speed > o.baseSpeed) {
        f.speed *= o.burstDecay;
        if (f.speed < o.baseSpeed) f.speed = o.baseSpeed;
      }

      // --- Integrate position ---
      f.x += Math.cos(f.angle) * f.speed;
      f.y += Math.sin(f.angle) * f.speed;

      // --- Boundary wrap ---
      if (f.x < -20)        f.x = width + 20;
      if (f.x > width + 20) f.x = -20;
      if (f.y < -20)        f.y = height + 20;
      if (f.y > height + 20) f.y = -20;

      // --- Opacity pulse ---
      if (Math.random() < 0.008) {
        f.targetOpacity = o.minOpacity + Math.random() * (o.maxOpacity - o.minOpacity);
      }
      f.opacity += (f.targetOpacity - f.opacity) * 0.04;

      // --- Draw glow ---
      const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 5);
      glow.addColorStop(0,   `rgba(${r},${g},${b},${f.opacity})`);
      glow.addColorStop(0.4, `rgba(${r},${g},${b},${f.opacity * 0.35})`);
      glow.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Only reschedule via RAF (interval drives itself automatically)
    if (!this.intervalId) {
      this.rafId = requestAnimationFrame(this._animate);
    }
  }
}
