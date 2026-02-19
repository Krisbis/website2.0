// Flame & ember particle system for the left side panel @ about.html
// Layers: flame cores (soft blobs) → embers (3 depth tiers) → sparks (rare bright)
// Everything is clipped inside .ember-flame-container and stays behind nav text.
(function(){
  function ready(fn){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function(){
    var nav = document.getElementById('about-side-nav');
    if(!nav) return;
    if(nav.dataset.embersInit === '1') return;
    nav.dataset.embersInit = '1';

    // Respect reduced-motion preference
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // --- Color palettes ---
    var FLAME_COLORS = [
      'radial-gradient(circle, rgba(180,40,10,0.65) 0%, rgba(220,80,20,0.35) 40%, rgba(220,80,20,0) 70%)',
      'radial-gradient(circle, rgba(255,100,30,0.55) 0%, rgba(200,60,10,0.3) 40%, rgba(200,60,10,0) 70%)',
      'radial-gradient(circle, rgba(255,140,40,0.5) 0%, rgba(220,100,30,0.25) 40%, rgba(220,100,30,0) 70%)',
      'radial-gradient(circle, rgba(160,30,5,0.6) 0%, rgba(200,50,10,0.3) 40%, rgba(200,50,10,0) 70%)'
    ];
    var EMBER_COLORS = [
      'radial-gradient(circle, rgba(255,210,140,0.95) 0%, rgba(255,150,60,0.6) 45%, rgba(255,150,60,0) 70%)',
      'radial-gradient(circle, rgba(255,180,80,0.9) 0%, rgba(255,120,40,0.55) 45%, rgba(255,120,40,0) 70%)',
      'radial-gradient(circle, rgba(255,230,160,0.85) 0%, rgba(255,180,80,0.5) 45%, rgba(255,180,80,0) 70%)',
      'radial-gradient(circle, rgba(255,160,60,0.85) 0%, rgba(200,80,20,0.5) 45%, rgba(200,80,20,0) 70%)',
      'radial-gradient(circle, rgba(255,200,120,0.9) 0%, rgba(255,140,50,0.55) 45%, rgba(255,140,50,0) 70%)'
    ];
    var SPARK_COLORS = [
      'radial-gradient(circle, rgba(255,250,220,1) 0%, rgba(255,220,140,0.7) 35%, rgba(255,220,140,0) 60%)',
      'radial-gradient(circle, rgba(255,240,200,0.95) 0%, rgba(255,200,100,0.6) 35%, rgba(255,200,100,0) 60%)',
      'radial-gradient(circle, rgba(255,255,240,0.9) 0%, rgba(255,230,160,0.6) 35%, rgba(255,230,160,0) 60%)'
    ];

    function rand(a, b){ return Math.random() * (b - a) + a; }
    function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

    // Create flame container (covers the full sidebar, clips its children)
    var container = document.createElement('div');
    container.className = 'ember-flame-container';
    nav.insertBefore(container, nav.firstChild);

    // Remove any legacy social-area embers from the old system
    var legacy = nav.querySelectorAll('.side-nav-social .ember-particle');
    for(var l = 0; l < legacy.length; l++) legacy[l].remove();

    function cSize(){
      return { w: container.offsetWidth || 0, h: container.offsetHeight || 0 };
    }

    function restartAnim(p, name){
      p.style.animationName = 'none';
      p.offsetHeight;
      p.style.animationName = name;
    }

    // ── Flame cores ─────────────────────────────────────────────
    function placeFlame(p){
      var s = cSize();
      if(s.w <= 0 || s.h <= 0){ p.style.opacity = '0'; return; }
      var w = rand(18, 38);
      p.style.left   = rand(0, Math.max(0, s.w - w)) + 'px';
      p.style.bottom  = rand(-10, s.h * 0.18) + 'px';
      p.style.width   = w + 'px';
      p.style.height  = (w * rand(1.3, 2.2)) + 'px';
      p.style.background = pick(FLAME_COLORS);
      p.style.setProperty('--ember-driftX', rand(-12, 12) + 'px');
      p.style.setProperty('--ember-rise',   rand(80, Math.min(220, s.h * 0.55)) + 'px');
      p.style.setProperty('--ember-sway',   rand(-8, 8) + 'px');
      p.style.animationDuration       = rand(3, 5.5) + 's';
      p.style.animationDelay          = rand(0, 2.5) + 's';
      p.style.animationIterationCount = '1';
      p.style.animationFillMode       = 'both';
      p.style.filter = 'blur(' + rand(6, 10).toFixed(1) + 'px) saturate(1.2)';
      restartAnim(p, 'flameRise');
    }

    // ── Embers (3 depth tiers for parallax) ─────────────────────
    var TIERS = {
      far:  { size:[2,4],  dur:[3.5,5.5], rise:[120,220], blur:1.6, opa:[0.25,0.40] },
      mid:  { size:[3,6],  dur:[2.5,4.2], rise:[80,160],  blur:1.1, opa:[0.45,0.65] },
      near: { size:[5,8],  dur:[1.8,3.2], rise:[60,130],  blur:0.7, opa:[0.55,0.80] }
    };

    function placeEmber(p, tier){
      var t = TIERS[tier];
      var s = cSize();
      if(s.w <= 0 || s.h <= 0){ p.style.opacity = '0'; return; }
      var sz = rand(t.size[0], t.size[1]);
      p.style.left   = rand(4, Math.max(5, s.w - sz - 4)) + 'px';
      p.style.bottom  = rand(-4, s.h * 0.3) + 'px';
      p.style.width   = sz + 'px';
      p.style.height  = sz + 'px';
      p.style.background = pick(EMBER_COLORS);
      p.style.setProperty('--ember-driftX',        rand(-25, 25) + 'px');
      p.style.setProperty('--ember-rise',          rand(t.rise[0], Math.min(t.rise[1], s.h * 0.8)) + 'px');
      p.style.setProperty('--ember-sway',          rand(-5, 5) + 'px');
      p.style.setProperty('--ember-peak-opacity',  rand(t.opa[0], t.opa[1]).toFixed(2));
      p.style.animationDuration       = rand(t.dur[0], t.dur[1]) + 's';
      p.style.animationDelay          = rand(0, 1.8) + 's';
      p.style.animationIterationCount = '1';
      p.style.animationFillMode       = 'both';
      p.style.filter = 'blur(' + t.blur + 'px) saturate(1.15)';
      restartAnim(p, 'emberRiseSway');
    }

    // ── Sparks ──────────────────────────────────────────────────
    function placeSpark(p){
      var s = cSize();
      if(s.w <= 0 || s.h <= 0){ p.style.opacity = '0'; return; }
      var sz = rand(1.5, 3);
      p.style.left   = rand(8, Math.max(9, s.w - 8)) + 'px';
      p.style.bottom  = rand(-4, s.h * 0.15) + 'px';
      p.style.width   = sz + 'px';
      p.style.height  = sz + 'px';
      p.style.background = pick(SPARK_COLORS);
      p.style.setProperty('--ember-driftX', rand(-30, 30) + 'px');
      p.style.setProperty('--ember-rise',   rand(120, Math.min(250, s.h * 0.9)) + 'px');
      p.style.animationDuration       = rand(1.2, 2.2) + 's';
      p.style.animationDelay          = rand(0, 4) + 's';
      p.style.animationIterationCount = '1';
      p.style.animationFillMode       = 'both';
      p.style.filter = 'blur(0.4px)';
      restartAnim(p, 'sparkRise');
    }

    // ── Factory ─────────────────────────────────────────────────
    function makeParticle(type, tier){
      var p = document.createElement('div');
      var placeFn;
      if(type === 'flame'){
        p.className = 'flame-core';
        placeFn = function(){ placeFlame(p); };
      } else if(type === 'spark'){
        p.className = 'spark-particle';
        placeFn = function(){ placeSpark(p); };
      } else {
        p.className = 'ember-particle';
        placeFn = function(){ placeEmber(p, tier); };
      }
      p.addEventListener('animationend', function(){
        if(document.hidden) return;
        placeFn();
      });
      placeFn();
      return p;
    }

    // ── Spawn ───────────────────────────────────────────────────
    var COUNTS = { flame: 7, far: 5, mid: 7, near: 4, spark: 4 };
    var all = [];

    for(var fi = 0; fi < COUNTS.flame; fi++){
      var fp = makeParticle('flame');
      container.appendChild(fp);
      all.push({ el: fp, fn: placeFlame });
    }
    ['far','mid','near'].forEach(function(tier){
      for(var ei = 0; ei < COUNTS[tier]; ei++){
        var ep = makeParticle('ember', tier);
        container.appendChild(ep);
        all.push({ el: ep, fn: (function(t){ return function(el){ placeEmber(el, t); }; })(tier) });
      }
    });
    for(var si = 0; si < COUNTS.spark; si++){
      var sp = makeParticle('spark');
      container.appendChild(sp);
      all.push({ el: sp, fn: placeSpark });
    }

    // ── Pause / resume on visibility change ─────────────────────
    document.addEventListener('visibilitychange', function(){
      var paused = document.hidden;
      all.forEach(function(item){
        item.el.style.animationPlayState = paused ? 'paused' : 'running';
        if(!paused) item.fn(item.el);
      });
    });

    // ── Reseed on resize (debounced) ────────────────────────────
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){
        if(document.hidden) return;
        all.forEach(function(item){ item.fn(item.el); });
      }, 200);
    });
  });
})();