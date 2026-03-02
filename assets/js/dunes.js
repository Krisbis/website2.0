/**
 * Animated background for homepage.
 */
(function () {
  const canvas = document.getElementById('duneCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ─── tunables ─── */
  const LINE_GAP      = 8;
  const LINE_WIDTH    = 1;
  const SPEED         = 0.00006;
  const SEGS          = 300;    // horizontal segments per line
  const PAD           = 120;    // px overshoot past viewport edges

  /* Low-frequency wave layers */
  const WAVES = [
    { amp: 12, freq: 0.7,  speed: 0.4, yScale: 0.0006 },
    { amp:  6, freq: 1.4,  speed: 0.6, yScale: 0.0012 },
    { amp:  3, freq: 2.6,  speed: 0.3, yScale: 0.0020 },
  ];

  /* ─── Travelling S-wave fronts ───
   * Each wave travels in a direction (angle), displacing lines
   * perpendicular to its motion, creating visible S-bends that
   * sweep across the grid continuously.
   * speed = pixels per second travel rate
   */
  const S_WAVES = [
    { angle: 0.35, speed: 45, waveLen: 240, amp: 30 },
    { angle: 1.85, speed: 35, waveLen: 320, amp: 24 },
    { angle: 3.70, speed: 50, waveLen: 200, amp: 20 },
    { angle: 5.10, speed: 28, waveLen: 280, amp: 16 },
  ];

  let W, H, lineCount;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    lineCount = Math.ceil((H + PAD * 2) / LINE_GAP) + 2;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ─── blackhole mouse effect ─── */
  const mouse     = { x: -9999, y: -9999, active: false };
  const blackhole = { x: -9999, y: -9999 };  // eased position (trails mouse)

  const BH_DEAD_R     = 6;     // px — total line absence zone
  const BH_WARP_R     = 60;    // px — outer gravitational pull radius
  const BH_STRENGTH   = 110;   // max tangential + radial push
  const BH_EASE       = 0.08;  // lerp factor per frame (0→1, lower = more delay)

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  document.addEventListener('mouseleave', function () {
    mouse.active = false;
    dragging = false;
  });

  /* ─── click ripples ─── */
  const ripples = [];
  const RIPPLE_SPEED    = 180;
  const RIPPLE_MAX_R    = 350;
  const RIPPLE_STRENGTH = 35;
  const RIPPLE_WIDTH    = 60;

  document.addEventListener('click', function (e) {
    ripples.push({
      x: e.clientX, y: e.clientY,
      birth: performance.now(),
      maxRadius: RIPPLE_MAX_R,
      strength: RIPPLE_STRENGTH,
    });
  });

  /* ─── click-drag trail ripples ─── */
  let dragging = false;
  let lastDragRipple = 0;
  const DRAG_RIPPLE_INTERVAL = 80;
  const DRAG_RIPPLE_MAX_R    = 200;
  const DRAG_RIPPLE_STRENGTH = 20;

  document.addEventListener('mousedown', function () { dragging = true; });
  document.addEventListener('mouseup',   function () { dragging = false; });
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    const now = performance.now();
    if (now - lastDragRipple < DRAG_RIPPLE_INTERVAL) return;
    lastDragRipple = now;
    ripples.push({
      x: e.clientX, y: e.clientY,
      birth: now,
      maxRadius: DRAG_RIPPLE_MAX_R,
      strength: DRAG_RIPPLE_STRENGTH,
    });
  });

  /* ─── helpers ─── */
  function smoothstep(edge0, edge1, val) {
    const t = Math.max(0, Math.min(1, (val - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /* ─── colour ripple system ─── */
  const DEFAULT_COLOR = { r: 215, g: 220, b: 230 };

  let currentColor = { ...DEFAULT_COLOR };
  let prevColor    = { ...DEFAULT_COLOR };
  let targetColor  = { ...DEFAULT_COLOR };

  const COLOR_RIPPLE_SPEED = 600;  // px/s
  let colorRipple = null;

  /**
   * Spawn a colour ripple from (originX, originY).
   * colorInput is an {r,g,b} object.
   */
  function spawnColorRipple(originX, originY, colorInput) {
    const col = (colorInput && typeof colorInput === 'object')
      ? { r: colorInput.r|0, g: colorInput.g|0, b: colorInput.b|0 }
      : DEFAULT_COLOR;
    prevColor   = { ...currentColor };
    targetColor = col;
    const dx1 = originX, dx2 = W - originX;
    const dy1 = originY, dy2 = H - originY;
    const maxR = Math.sqrt(Math.max(dx1,dx2)**2 + Math.max(dy1,dy2)**2) + 100;
    colorRipple = { x: originX, y: originY, birth: performance.now(), maxRadius: maxR };
  }

  window.__duneColorRipple = spawnColorRipple;

  /**
   * Returns the interpolated {r,g,b} for a point at (px,py)
   * given the current colour ripple state.
   * Behind the front → targetColor, ahead → prevColor.
   */
  function getPointColor(px, py, front) {
    if (!colorRipple) return currentColor;
    const dx = px - colorRipple.x;
    const dy = py - colorRipple.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    /* transition band 80px wide around the front */
    const band = 80;
    if (dist < front - band) return targetColor;
    if (dist > front + band) return prevColor;
    const blend = smoothstep(front - band, front + band, dist);
    return {
      r: Math.round(targetColor.r + (prevColor.r - targetColor.r) * blend),
      g: Math.round(targetColor.g + (prevColor.g - targetColor.g) * blend),
      b: Math.round(targetColor.b + (prevColor.b - targetColor.b) * blend),
    };
  }

  /* ─── main draw loop ─── */
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const time = t * SPEED;
    const diag = Math.max(W, H);
    const now  = performance.now();

    /* cull expired ripples */
    for (let r = ripples.length - 1; r >= 0; r--) {
      const age = (now - ripples[r].birth) / 1000;
      if (age * RIPPLE_SPEED > ripples[r].maxRadius + RIPPLE_WIDTH) {
        ripples.splice(r, 1);
      }
    }

    /* pre-compute S-wave state */
    const sState = S_WAVES.map(sw => {
      const dirX  = Math.cos(sw.angle);
      const dirY  = Math.sin(sw.angle);
      const phase = -(now / 1000) * (sw.speed / sw.waveLen) * Math.PI * 2;
      return {
        dirX, dirY,
        perpX: -dirY, perpY: dirX,
        k: (Math.PI * 2) / sw.waveLen,
        amp: sw.amp,
        phase,
      };
    });

    /* pre-compute ripple state */
    const rState = ripples.map(rp => {
      const age = (now - rp.birth) / 1000;
      const front = age * RIPPLE_SPEED;
      const life = 1 - Math.min(1, front / rp.maxRadius);
      return { x: rp.x, y: rp.y, front: front, str: rp.strength * life, w: RIPPLE_WIDTH };
    });

    /* colour ripple progress */
    let colorFront = -1;
    if (colorRipple) {
      const age = (now - colorRipple.birth) / 1000;
      colorFront = age * COLOR_RIPPLE_SPEED;
      if (colorFront > colorRipple.maxRadius + 80) {
        /* ripple finished — commit colour */
        currentColor = { ...targetColor };
        colorRipple = null;
        colorFront = -1;
      }
    }

    /* ease blackhole position toward mouse */
    if (mouse.active) {
      blackhole.x += (mouse.x - blackhole.x) * BH_EASE;
      blackhole.y += (mouse.y - blackhole.y) * BH_EASE;
    } else {
      // drift off-screen when mouse leaves
      blackhole.x += (-200 - blackhole.x) * 0.03;
      blackhole.y += (-200 - blackhole.y) * 0.03;
    }

    const xStep = (W + PAD * 2) / SEGS;

    for (let i = 0; i < lineCount; i++) {
      const baseY = -PAD + i * LINE_GAP;
      const nY = baseY / H;
      const fade = Math.sin(Math.max(0, Math.min(1, nY)) * Math.PI);
      const alpha = 0.04 + fade * 0.15;

      /* ── build x-samples: denser near blackhole ── */
      const bhActive = blackhole.x > -500;
      let xSamples;
      if (bhActive) {
        // measure blackhole influence per coarse cell to boost density
        const COARSE = 40;
        const totalW = W + PAD * 2;
        const cellW  = totalW / COARSE;
        const samples = [];
        let sx = -PAD;
        for (let c = 0; c < COARSE; c++) {
          const cellEnd = -PAD + (c + 1) * cellW;
          const cx = -PAD + (c + 0.5) * cellW;
          const dx = cx - blackhole.x;
          const dy = baseY - blackhole.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const inf = dist < BH_WARP_R ? 1 - smoothstep(0, BH_WARP_R, dist) : 0;
          const density = 1 + inf * 2.5;  // up to 3.5× more segments near core
          const step = totalW / (SEGS * density);
          while (sx < cellEnd && sx <= W + PAD) {
            samples.push(sx);
            sx += step;
          }
        }
        if (samples.length === 0 || samples[samples.length - 1] < W + PAD) samples.push(W + PAD);
        xSamples = samples;
      } else {
        xSamples = null; // use uniform stepping
      }
      const segCount = xSamples ? xSamples.length - 1 : SEGS;

      /* ── per-segment draw with colour interpolation ── */
      const needPerSeg = !!colorRipple;
      let prevX, prevY;

      if (!needPerSeg) ctx.beginPath();

      for (let s = 0; s <= segCount; s++) {
        let x = xSamples ? xSamples[s] : (-PAD + s * xStep);
        let y = baseY;

        /* sin/cos wave undulation */
        for (const w of WAVES) {
          const ph = (x / W) * w.freq * Math.PI * 2 +
                     baseY * w.yScale +
                     time * w.speed * 30;
          y += w.amp * Math.sin(ph);
        }

        /* travelling S-wave displacement */
        for (const sw of sState) {
          const proj = x * sw.dirX + y * sw.dirY;
          const wave = sw.amp * Math.sin(proj * sw.k + sw.phase);
          x += sw.perpX * wave;
          y += sw.perpY * wave;
        }

        /* blackhole effect */
        {
          const bdx = x - blackhole.x;
          const bdy = y - blackhole.y;
          const bDist = Math.sqrt(bdx * bdx + bdy * bdy);
          if (bDist < BH_WARP_R && bDist > 0.1) {
            if (bDist < BH_DEAD_R) {
              /* inside dead zone — hide segment by pushing far off-screen */
              x = -9999;
              y = -9999;
            } else {
              /* gravitational warp: tangential spin + slight inward pull */
              const blend = 1 - smoothstep(BH_DEAD_R, BH_WARP_R, bDist);
              const nx = bdx / bDist;
              const ny = bdy / bDist;
              // tangential (perpendicular clockwise)
              const tx = -ny;
              const ty =  nx;
              const tangentialPush = BH_STRENGTH * blend * 0.7;
              // radial outward push (pushes lines around, not into center)
              const radialPush = BH_STRENGTH * blend * 0.5;
              x += tx * tangentialPush + nx * radialPush;
              y += ty * tangentialPush + ny * radialPush;
            }
          }
        }

        /* click / drag ripples */
        for (const rp of rState) {
          const rdx = x - rp.x;
          const rdy = y - rp.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
          const distFromFront = Math.abs(rDist - rp.front);
          if (distFromFront < rp.w && rp.str > 0.5 && rDist > 0.1) {
            const ringBlend = Math.cos((distFromFront / rp.w) * Math.PI * 0.5);
            x += (rdx / rDist) * rp.str * ringBlend;
            y += (rdy / rDist) * rp.str * ringBlend;
          }
        }

        if (s === 0) {
          prevX = x; prevY = y;
          if (x < -5000) {
            // dead zone start — don't begin path yet
          } else if (!needPerSeg) {
            ctx.moveTo(x, y);
          }
        } else if (x < -5000 || prevX < -5000) {
          // entering or leaving dead zone — break the line
          prevX = x; prevY = y;
          if (!needPerSeg && x > -5000) ctx.moveTo(x, y);
        } else if (needPerSeg) {
          /* per-segment colour during colour ripple */
          const col = getPointColor((prevX + x) / 2, (prevY + y) / 2, colorFront);
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha.toFixed(3)})`;
          ctx.lineWidth = LINE_WIDTH;
          ctx.stroke();
          prevX = x; prevY = y;
        } else {
          ctx.lineTo(x, y);
        }
      }

      /* batch stroke when no colour ripple */
      if (!needPerSeg) {
        ctx.strokeStyle = `rgba(${currentColor.r},${currentColor.g},${currentColor.b},${alpha.toFixed(3)})`;
        ctx.lineWidth = LINE_WIDTH;
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
