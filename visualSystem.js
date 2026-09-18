/* ============================================================================
   Fórum UPB · "Relevo generacional: la ventaja que nadie está aprovechando"
   SISTEMA VISUAL — un organismo de agentes con relaciones estructurales.
============================================================================ */

const TAU = Math.PI * 2;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb(hex) {
  const clean = String(hex).replace("#", "");
  const n = parseInt(clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function detectCanvasFilter() {
  try {
    const probe = document.createElement("canvas").getContext("2d");
    probe.filter = "blur(2px)";
    return probe.filter !== "none" && probe.filter !== "";
  } catch (err) {
    return false;
  }
}

class VisualSystem {
  constructor(canvas) {
    const cfg = window.CONFIG || {};

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });

    // Lienzo oculto: memoria del movimiento.
    this.trailCanvas = document.createElement("canvas");
    this.trailCtx = this.trailCanvas.getContext("2d", { willReadFrequently: true });

    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this.time = 0;
    this.lastFrame = performance.now();

    this.current = null;
    this.colors = ["#00a2e0", "#f04b3a", "#ec779c"];

    // Variables para el LERP del color de fondo
    this.currentBgRgb = { r: 0, g: 162, b: 224 }; 
    this.targetBgRgb = { r: 0, g: 162, b: 224 };

    this.numAgents = cfg.particleCount || 140;
    this.linkRadius = cfg.connectionDistance || 165;
    this.restLength = this.linkRadius * (cfg.linkRestRatio || 0.52);
    this.paramEase = cfg.transitionSpeed || 0.055;
    this.maxDegreeExperience = cfg.maxDegreeExperience || 8;
    this.maxDegreeYouth = cfg.maxDegreeYouth || 5;

    this.supportsFilter = detectCanvasFilter();

    this.agents = [];
    this.links = [];
    this.crossLinks = 0;

    // Evasión de cursor
    this.mouse = { x: -1000, y: -1000 };

    this.readingZone = { x: 0.07, y: 0.54, w: 0.46, h: 0.34 };
    this.targetZone = { ...this.readingZone };
    this.orbit = 0; 
    this.targetOrbit = 0;

    this.params = { gravity: 0, clumping: 0, elasticity: 0, exploration: 0, intensity: 0.5 };
    this.targetParams = { ...this.params };

    this.resize();
    window.addEventListener("resize", () => this.resize(true));
    
    // Escuchar al mouse para la evasión volumétrica
    window.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    }, { passive: true });
    
    window.addEventListener("mouseleave", () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    this.initAgents();
    this._initNoise();
  }

  // ---------------------------------------------------------------
  // POBLACIÓN
  // ---------------------------------------------------------------
  initAgents() {
    const focus = this.gatheringFocus();
    this.agents.length = 0;

    for (let i = 0; i < this.numAgents; i += 1) {
      const isExperience = i % 5 < 2;

      this.agents.push({
        id: i,
        x: focus.x + (Math.random() - 0.5) * this.width * 0.6,
        y: focus.y + (Math.random() - 0.5) * this.height * 0.6,
        angle: Math.random() * TAU,
        fx: 0,
        fy: 0,
        degree: 0,
        isExperience,
        colorIndex: isExperience ? 0 : i % 2 ? 1 : 2,
        thickness: isExperience ? 2.5 : 1.0,
        baseSpeed: isExperience ? 0.7 : 1.6,
        clumpNode: isExperience ? -1 : 1,
      });
    }
  }

  resize(preserve = false) {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    let oldImg;
    if (preserve && this.trailCanvas.width > 0 && this.trailCanvas.height > 0) {
      try {
        oldImg = this.trailCtx.getImageData(0, 0, this.trailCanvas.width, this.trailCanvas.height);
      } catch (err) {
        oldImg = null;
      }
    }

    this.trailCanvas.width = Math.floor(this.width * this.dpr);
    this.trailCanvas.height = Math.floor(this.height * this.dpr);
    this.trailCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (oldImg) this.trailCtx.putImageData(oldImg, 0, 0);
  }

  setReadingZone(zone) {
    this.targetZone = {
      x: clamp(zone.x, 0, 1),
      y: clamp(zone.y, 0, 1),
      w: clamp(zone.w, 0.05, 1),
      h: clamp(zone.h, 0.05, 1),
    };
    const centerX = this.targetZone.x + this.targetZone.w / 2;
    this.targetOrbit = Math.abs(centerX - 0.5) < 0.09 ? 1 : 0;
  }

  readingRect() {
    const rz = this.readingZone;
    const pad = Math.min(this.width, this.height) * (0.05 + this.orbit * 0.03);
    return {
      left: rz.x * this.width - pad,
      top: rz.y * this.height - pad,
      right: (rz.x + rz.w) * this.width + pad,
      bottom: (rz.y + rz.h) * this.height + pad,
      cx: (rz.x + rz.w / 2) * this.width,
      cy: (rz.y + rz.h / 2) * this.height,
    };
  }

  gatheringFocus() {
    const rz = this.readingZone;
    const cx = rz.x + rz.w / 2;
    const cy = rz.y + rz.h / 2;
    if (this.orbit > 0.5) {
      return { x: cx * this.width, y: cy * this.height };
    }
    return {
      x: clamp(1 - cx, 0.22, 0.82) * this.width,
      y: clamp(1 - cy, 0.24, 0.78) * this.height,
    };
  }

  setMoment(moment) {
    const isNewMoment = this.current?.id !== moment.id;
    this.current = moment;
    this.colors = moment.colors;

    // Actualizamos el target del color de fondo cinemático
    this.targetBgRgb = hexToRgb(this.colors[0]);
    this.targetParams = { ...moment.behavior, intensity: moment.intensity };

    if (isNewMoment) {
      this.trailCtx.globalCompositeOperation = "destination-out";
      this.trailCtx.fillStyle = "rgba(0, 0, 0, 0.18)";
      this.trailCtx.fillRect(0, 0, this.width, this.height);
      this.trailCtx.globalCompositeOperation = "source-over";
    }
  }

  hasBackgroundAsset() {
    const configuredAsset = window.CONFIG?.assets?.byMoment?.[this.current?.id];
    const asset = configuredAsset === false ? null : configuredAsset || this.current?.asset;
    return asset?.placement === "background";
  }

  // ---------------------------------------------------------------
  // RUIDO DE VALOR 2D
  // ---------------------------------------------------------------
  _initNoise() {
    this.perm = new Uint8Array(512);
    const p = [...Array(256).keys()];
    for (let i = 255; i > 0; i -= 1) {
      const j = (Math.random() * (i + 1)) | 0;
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i += 1) this.perm[i] = p[i & 255];
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

  _grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -2 * v : 2 * v);
  }

  _noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this._fade(x);
    const v = this._fade(y);
    const aa = this.perm[this.perm[X] + Y];
    const ba = this.perm[this.perm[X + 1] + Y];
    const ab = this.perm[this.perm[X] + Y + 1];
    const bb = this.perm[this.perm[X + 1] + Y + 1];
    const x1 = lerp(this._grad(aa, x, y), this._grad(ba, x - 1, y), u);
    const x2 = lerp(this._grad(ab, x, y - 1), this._grad(bb, x - 1, y - 1), u);
    return lerp(x1, x2, v);
  }

  _curl(x, y, t) {
    const scale = 0.0022;
    const e = 0.25;
    const sx = x * scale;
    const sy = y * scale + t * 0.035;
    const n1 = this._noise2D(sx, sy + e);
    const n2 = this._noise2D(sx, sy - e);
    const n3 = this._noise2D(sx + e, sy);
    const n4 = this._noise2D(sx - e, sy);
    return { x: (n1 - n2) / (2 * e), y: -(n3 - n4) / (2 * e) };
  }

  // ---------------------------------------------------------------
  // RELACIONES ESTRUCTURALES
  // ---------------------------------------------------------------
  buildLinks() {
    const links = this.links;
    links.length = 0;
    this.crossLinks = 0;

    const elasticity = this.params.elasticity;
    if (elasticity < 0.06) return;

    const degreeExperience = Math.max(1, Math.round(lerp(1, this.maxDegreeExperience, elasticity)));
    const degreeYouth = Math.max(1, Math.round(lerp(1, this.maxDegreeYouth, elasticity)));

    const r = this.linkRadius;
    const cols = Math.max(1, Math.ceil(this.width / r));
    const rows = Math.max(1, Math.ceil(this.height / r));
    const cells = new Array(cols * rows).fill(null);

    for (const a of this.agents) {
      const cx = clamp(Math.floor(a.x / r), 0, cols - 1);
      const cy = clamp(Math.floor(a.y / r), 0, rows - 1);
      const key = cy * cols + cx;
      if (!cells[key]) cells[key] = [];
      cells[key].push(a);
    }

    const r2 = r * r;

    for (let cy = 0; cy < rows; cy += 1) {
      for (let cx = 0; cx < cols; cx += 1) {
        const bucket = cells[cy * cols + cx];
        if (!bucket) continue;

        for (let dy = 0; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dy === 0 && dx < 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const other = cells[ny * cols + nx];
            if (!other) continue;
            const sameCell = dx === 0 && dy === 0;

            for (let i = 0; i < bucket.length; i += 1) {
              const a = bucket[i];
              const maxA = a.isExperience ? degreeExperience : degreeYouth;
              if (a.degree >= maxA) continue;

              for (let j = sameCell ? i + 1 : 0; j < other.length; j += 1) {
                const b = other[j];
                const maxB = b.isExperience ? degreeExperience : degreeYouth;
                if (b.degree >= maxB) continue;
                if (a.degree >= maxA) break;

                const vx = b.x - a.x;
                const vy = b.y - a.y;
                const d2 = vx * vx + vy * vy;
                if (d2 > r2 || d2 < 4) continue;

                const cross = a.isExperience !== b.isExperience;
                const threshold = cross ? 0.1 : 0.48;
                if (elasticity < threshold) continue;

                const dist = Math.sqrt(d2);
                links.push({ a, b, dist, ux: vx / dist, uy: vy / dist, cross });
                a.degree += 1;
                b.degree += 1;
                if (cross) this.crossLinks += 1;
              }
            }
          }
        }
      }
    }
  }

  applyLinkForces() {
    const k = 0.0045 * this.params.elasticity;
    if (k <= 0) return;

    for (const l of this.links) {
      const f = (l.dist - this.restLength) * k;
      l.a.fx += l.ux * f;
      l.a.fy += l.uy * f;
      l.b.fx -= l.ux * f;
      l.b.fy -= l.uy * f;
    }
  }

  // ---------------------------------------------------------------
  // COMPORTAMIENTO
  // ---------------------------------------------------------------
  updateNature(dt, dtScale) {
    this.time += dt;

    const ease = clamp(this.paramEase * dtScale, 0, 1);

    if (this.targetParams) {
      for (const key of ["exploration", "gravity", "clumping", "elasticity", "intensity"]) {
        this.params[key] = lerp(this.params[key], this.targetParams[key] ?? 0, ease);
      }
    }

    const zoneEase = clamp(0.12 * dtScale, 0, 1);
    for (const key of ["x", "y", "w", "h"]) {
      this.readingZone[key] = lerp(this.readingZone[key], this.targetZone[key], zoneEase);
    }
    this.orbit = lerp(this.orbit, this.targetOrbit, zoneEase);

    const focus = this.gatheringFocus();
    const cx = focus.x;
    const cy = focus.y;
    const zone = this.readingRect();
    const damping = Math.pow(0.84, dtScale);

    for (const a of this.agents) {
      a.fx *= damping;
      a.fy *= damping;
      a.degree = 0;
    }

    this.buildLinks();
    this.applyLinkForces();

    const spread = Math.min(this.width, this.height) * 0.24;
    const pillars = [
      { x: cx - spread, y: cy - spread * 0.7 },
      { x: cx + spread, y: cy - spread * 0.7 },
      { x: cx, y: cy + spread * 0.95 },
    ];

    const state = this.current?.state;

    for (const a of this.agents) {
      const ox = a.x;
      const oy = a.y;

      // 1. INSTINTO BASE: flujo tipo fluido.
      const explorationGain = a.isExperience ? 0.45 : 1;
      const flow = this._curl(a.x, a.y, this.time);
      const flowAngle = Math.atan2(flow.y, flow.x);
      let diffFlow = flowAngle - a.angle;
      while (diffFlow < -Math.PI) diffFlow += TAU;
      while (diffFlow > Math.PI) diffFlow -= TAU;
      let targetAngle = a.angle + diffFlow * this.params.exploration * explorationGain * 0.5;

      // 2. AISLAMIENTO
      if (this.params.clumping > 0.1) {
        const axis = this.orbit > 0.5 ? Math.PI / 2 : 0;
        const offset = Math.min(this.width, this.height) * 0.27 * a.clumpNode;
        const clumpX = cx + Math.cos(axis) * offset;
        const clumpY = cy + Math.sin(axis) * offset;
        const angleToClump = Math.atan2(clumpY - a.y, clumpX - a.x);
        let diff = angleToClump - a.angle;
        while (diff < -Math.PI) diff += TAU;
        while (diff > Math.PI) diff -= TAU;
        targetAngle += diff * this.params.clumping * 0.15;
      }

      // 3. CONVOCATORIA DE FÓRUM
      if (this.params.gravity > 0.1) {
        let angleToCenter = 0;

        if (state === "mixing") {
          let closest = pillars[0];
          let minDist = Infinity;
          for (const p of pillars) {
            const d = Math.hypot(p.x - a.x, p.y - a.y);
            if (d < minDist) {
              minDist = d;
              closest = p;
            }
          }
          angleToCenter = Math.atan2(closest.y - a.y, closest.x - a.x);
        } else {
          angleToCenter = Math.atan2(cy - a.y, cx - a.x);
        }

        let diff = angleToCenter - a.angle;
        while (diff < -Math.PI) diff += TAU;
        while (diff > Math.PI) diff -= TAU;
        targetAngle += diff * this.params.gravity * 0.08;
      }

      // 4. LA PALABRA MANDA: evasión estática
      if (a.x > zone.left && a.x < zone.right && a.y > zone.top && a.y < zone.bottom) {
        const halfW = Math.max(1, (zone.right - zone.left) / 2);
        const halfH = Math.max(1, (zone.bottom - zone.top) / 2);
        const nx = (a.x - zone.cx) / halfW;
        const ny = (a.y - zone.cy) / halfH;
        const escape = Math.abs(nx) > Math.abs(ny) ? (nx >= 0 ? 0 : Math.PI) : ny >= 0 ? Math.PI / 2 : -Math.PI / 2;
        const depth = 1 - clamp(Math.max(Math.abs(nx), Math.abs(ny)), 0, 1);
        let diff = escape - targetAngle;
        while (diff < -Math.PI) diff += TAU;
        while (diff > Math.PI) diff -= TAU;
        targetAngle += diff * clamp(0.35 + depth, 0, 1) * 0.62;
      }

      // 5. INTERACCIÓN MOUSE: Evasión volumétrica orgánica
      const dxMouse = a.x - this.mouse.x;
      const dyMouse = a.y - this.mouse.y;
      const distMouse = Math.hypot(dxMouse, dyMouse);
      const mouseRadius = 140 * this.dpr;
      
      if (distMouse < mouseRadius && distMouse > 1) {
        const force = Math.pow(1 - distMouse / mouseRadius, 2); 
        const escapeAngle = Math.atan2(dyMouse, dxMouse);
        let diffMouse = escapeAngle - targetAngle;
        while (diffMouse < -Math.PI) diffMouse += TAU;
        while (diffMouse > Math.PI) diffMouse -= TAU;
        
        targetAngle += diffMouse * force * 0.8;
        a.fx += Math.cos(escapeAngle) * force * 8;
        a.fy += Math.sin(escapeAngle) * force * 8;
      }

      let finalDiff = targetAngle - a.angle;
      while (finalDiff < -Math.PI) finalDiff += TAU;
      while (finalDiff > Math.PI) finalDiff -= TAU;
      a.angle += finalDiff * clamp(0.1 * dtScale, 0, 1);

      const youthBoost = a.isExperience ? 1 : 1 + this.params.exploration * 0.35;
      const speed = a.baseSpeed * (0.6 + this.params.intensity * 0.8) * youthBoost;

      const vx = Math.cos(a.angle) * speed + clamp(a.fx, -6, 6);
      const vy = Math.sin(a.angle) * speed + clamp(a.fy, -6, 6);
      a.x += vx * dtScale;
      a.y += vy * dtScale;

      // ENTORNO INFINITO
      const margin = 20;
      let wrapped = false;
      if (a.x < -margin) {
        a.x = this.width + margin;
        wrapped = true;
      } else if (a.x > this.width + margin) {
        a.x = -margin;
        wrapped = true;
      }
      if (a.y < -margin) {
        a.y = this.height + margin;
        wrapped = true;
      } else if (a.y > this.height + margin) {
        a.y = -margin;
        wrapped = true;
      }
      if (wrapped) {
        a.fx = 0;
        a.fy = 0;
      }

      const distMoved = Math.hypot(a.x - ox, a.y - oy);
      if (!wrapped && distMoved < speed * 3 + 6) {
        const colorHex = this.colors[a.colorIndex % this.colors.length];
        const pulse = 1 + Math.sin(this.time * 2.4 + a.id) * 0.16;
        
        const alphaBoost = this.supportsFilter ? 0.7 : 1.2;
        const alpha = (a.isExperience ? 0.4 : 0.2) * alphaBoost;

        this.trailCtx.fillStyle = colorHex;
        this.trailCtx.globalAlpha = clamp(alpha, 0, 1);

        const steps = 4;
        for (let s = 0; s <= steps; s += 1) {
          const t = s / steps;
          const px = lerp(ox, a.x, t);
          const py = lerp(oy, a.y, t);
          const rad = a.thickness * pulse * (0.82 + 0.3 * Math.sin(t * Math.PI));
          this.trailCtx.beginPath();
          this.trailCtx.arc(px, py, rad, 0, TAU);
          this.trailCtx.fill();
        }
        this.trailCtx.globalAlpha = 1;
      }
    }
  }

  // ---------------------------------------------------------------
  // DIBUJO
  // ---------------------------------------------------------------
  drawLinks(ctx) {
    const elasticity = this.params.elasticity;
    if (!this.links.length || elasticity < 0.08) return;

    const state = this.current?.state;
    const crystal = state === "trust" || state === "future" ? 1.3 : 1;
    const crossHex = this.colors[2 % this.colors.length];

    ctx.globalCompositeOperation = "screen";
    ctx.lineCap = "round";

    for (const l of this.links) {
      const strain = clamp(Math.abs(l.dist - this.restLength) / this.restLength, 0, 1);
      const base = l.cross ? 0.35 : 0.15;
      const alpha = clamp(base * elasticity * (1 - strain * 0.55), 0, 0.7);
      if (alpha < 0.02) continue;

      const hex = l.cross ? crossHex : this.colors[l.a.colorIndex % this.colors.length];
      ctx.strokeStyle = rgba(hex, alpha);
      ctx.lineWidth = (l.cross ? 1.35 : 0.8) * crystal;
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      ctx.lineTo(l.b.x, l.b.y);
      ctx.stroke();
    }
  }

  drawHeads(ctx) {
    const state = this.current?.state;
    const elderGlow = state === "present" ? 0.4 : 1;
    const youthGlow = state === "present" ? 1.5 : 1;

    ctx.globalCompositeOperation = "screen";
    for (const a of this.agents) {
      const colorHex = this.colors[a.colorIndex % this.colors.length];
      const glow = a.isExperience ? elderGlow : youthGlow;
      ctx.fillStyle = rgba(colorHex, clamp(0.55 * glow, 0, 1));
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.thickness * 1.2 * (a.isExperience ? 1 : glow), 0, TAU);
      ctx.fill();
    }
  }

  drawReadabilityShield(ctx) {
    const zone = this.readingRect();
    const rx = Math.max(1, (zone.right - zone.left) * 0.95);
    const ry = Math.max(1, (zone.bottom - zone.top) * 1.05);
    const radius = Math.max(rx, ry);

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.translate(zone.cx, zone.cy);
    ctx.scale(rx / radius, ry / radius);

    const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    pool.addColorStop(0, "#08090a");
    pool.addColorStop(0.44, "#1b1d1f");
    pool.addColorStop(0.74, "#82868a");
    pool.addColorStop(1, "#ffffff");
    ctx.fillStyle = pool;
    ctx.fillRect(-this.width * 3, -this.height * 3, this.width * 6, this.height * 6);
    ctx.restore();

    ctx.globalCompositeOperation = "source-over";
  }

  render() {
    const now = performance.now();
    let dt = (now - this.lastFrame) / 1000;
    this.lastFrame = now;
    dt = clamp(dt, 1 / 240, 1 / 30);
    const dtScale = dt * 60;

    // Interpolamos el color de fondo orgánico
    this.currentBgRgb.r = lerp(this.currentBgRgb.r, this.targetBgRgb.r, 0.05);
    this.currentBgRgb.g = lerp(this.currentBgRgb.g, this.targetBgRgb.g, 0.05);
    this.currentBgRgb.b = lerp(this.currentBgRgb.b, this.targetBgRgb.b, 0.05);

    this.updateNature(dt, dtScale);

    const ctx = this.ctx;
    const hasPhoto = this.hasBackgroundAsset();

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. FONDO CON LERP ORGÁNICO
    if (!hasPhoto) {
      const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
      gradient.addColorStop(0, "#050607");
      
      const bgHex = `rgba(${Math.round(this.currentBgRgb.r)}, ${Math.round(this.currentBgRgb.g)}, ${Math.round(this.currentBgRgb.b)}, 0.05)`;
      gradient.addColorStop(0.5, bgHex);
      
      gradient.addColorStop(1, "#0a0c0e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. DESVANECIMIENTO LENTO
    this.trailCtx.globalCompositeOperation = "destination-out";
    this.trailCtx.fillStyle = `rgba(0, 0, 0, ${clamp(0.015 * dtScale, 0, 1)})`;
    this.trailCtx.fillRect(0, 0, this.width, this.height);
    this.trailCtx.globalCompositeOperation = "source-over";

    // 3. RASTRO 
    ctx.save();
    if (this.supportsFilter) {
      const blurAmt = lerp(4, 12, this.params.elasticity);
      const contrastAmt = lerp(16, 11, this.params.elasticity); 
      ctx.filter = `blur(${blurAmt}px) contrast(${contrastAmt}) saturate(1.1)`;
    }
    ctx.globalCompositeOperation = hasPhoto ? "screen" : "lighten";
    ctx.drawImage(this.trailCanvas, 0, 0, this.width, this.height);
    ctx.restore();

    // 4. ESTRUCTURA VIVA y 5. CABEZAS
    this.drawLinks(ctx);
    this.drawHeads(ctx);

    // 6. ESCUDO DE LEGIBILIDAD.
    this.drawReadabilityShield(ctx);
  }

  getStats() {
    return {
      moment: this.current?.id || "—",
      state: this.current?.state || "—",
      layout: this.current?.layout || "—",
      agents: this.agents.length,
      links: this.links.length,
      crossLinks: this.crossLinks,
      gravity: this.params.gravity,
      clumping: this.params.clumping,
      elasticity: this.params.elasticity,
      exploration: this.params.exploration,
      intensity: this.params.intensity,
      orbit: this.orbit,
      filter: this.supportsFilter,
    };
  }
}

window.VisualSystem = VisualSystem;