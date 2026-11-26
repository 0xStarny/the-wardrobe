/* characters.js: the five of The Crew (Sam, Robin, Alex, Jamie, Pat) in three felt styles, and a picker to choose between them.
   window.CrewCharacters = { styles, get(), set(style), draw(ctx, index, x, y, size, opts), canvas(index, size, opts), mountPicker() }
   Styles: 'original' (his felt balls, after avatar.js), 'jobs' (the same with one felt accessory each), 'pompom' (wool pompom fluff).
   Expressions: idle, thinking, speaking, pleased, proud, unsure, worried, sorry. Everything is drawn in a 48 unit box, as in avatar.js. */
(function () {
  var STYLES = ['original', 'jobs', 'pompom'];
  var KEY = 'crew-characters';
  var ART = [
    { id: 'overseer', name: 'Sam', c: [107, 116, 230], body: 'M20 10h8a13 13 0 0 1 13 13v6a13 13 0 0 1-13 13h-8a13 13 0 0 1-13-13v-6a13 13 0 0 1 13-13z', blush: true },
    { id: 'steward', name: 'Robin', c: [240, 169, 58], body: 'M7 26.5a17 17 0 1 0 34 0a17 17 0 1 0-34 0z', blush: false },
    { id: 'operations', name: 'Alex', c: [32, 179, 166], body: 'M9 22q0-11 15-11t15 11v9q0 11-15 11T9 31z', blush: true },
    { id: 'ask', name: 'Jamie', c: [236, 106, 160], body: 'M8 27q0-15 16-15t16 15q0 15-16 15T8 27z', blush: true },
    { id: 'master', name: 'Pat', c: [34, 176, 125], body: 'M23 11h2a15 15 0 0 1 15 15v1a15 15 0 0 1-15 15h-2a15 15 0 0 1-15-15v-1a15 15 0 0 1 15-15z', blush: true }
  ];
  var WHITE = [255, 255, 255], NIGHT = [8, 10, 40], GREEN = [34, 176, 125];
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(a, b, t) { return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))]; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a == null ? 1 : a) + ')'; }
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var testCtx = null;
  function tctx() { return testCtx || (testCtx = document.createElement('canvas').getContext('2d')); }
  function inside(p, x, y, rule) { return tctx().isPointInPath(p, x, y, rule || 'nonzero'); }
  var bodyPaths = [];
  function bodyPath(i) { return bodyPaths[i] || (bodyPaths[i] = new Path2D(ART[i].body)); }
  var boxCache = new Map();
  function bbox(p) {
    if (boxCache.has(p)) return boxCache.get(p);
    var x0 = 99, y0 = 99, x1 = -1, y1 = -1;
    for (var y = -2; y < 50; y += 0.5) for (var x = -2; x < 50; x += 0.5) if (inside(p, x, y)) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
    var b = [x0, y0, x1 - x0, y1 - y0];
    boxCache.set(p, b);
    return b;
  }
  function rr(x, y, w, h, r) { var p = new Path2D(); if (p.roundRect) p.roundRect(x, y, w, h, r); else p.rect(x, y, w, h); return p; }
  function ring(x, y, r1, r2) { var p = new Path2D(); p.arc(x, y, r1, 0, Math.PI * 2); p.moveTo(x + r2, y); p.arc(x, y, r2, 0, Math.PI * 2, true); return p; }
  function ell(x, y, rx, ry, rot) { var p = new Path2D(); p.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); return p; }

  // His felt: matte, lit from the top left, short fibres, a fuzzy edge of fibres. q (0..1) thins the fibres for small sizes.
  function felt(g, p, c, o) {
    o = o || {};
    var q = o.q == null ? 1 : o.q;
    var rule = o.rule || 'nonzero';
    var b = bbox(p), x = b[0], y = b[1], w = b[2], h = b[3];
    var m = Math.max(w, h), cx = x + w / 2, cy = y + h / 2;
    var R = rng(o.seed || 7);
    var lite = mix(c, WHITE, 0.46), dark = mix(c, NIGHT, 0.44);
    g.save();
    g.lineCap = 'round';
    if (o.fuzz !== false && q > 0.15) {
      var n = Math.round(m * 14 * q);
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2 + R() * 0.05;
        var r = 0; while (r < 40 && inside(p, cx + Math.cos(a) * r, cy + Math.sin(a) * r, rule)) r += 0.25;
        if (r < 0.5) continue;
        var ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r;
        var lit = 0.5 - 0.5 * Math.cos(a + Math.PI * 0.75);
        var len = (o.fuzzLen || 0.55) * (0.4 + R() * 0.9), aa = a + (R() - 0.5) * 0.9;
        g.strokeStyle = rgba(mix(dark, c, lit * 0.85), 0.42); g.lineWidth = 0.14;
        g.beginPath(); g.moveTo(ex - Math.cos(a) * 0.4, ey - Math.sin(a) * 0.4); g.lineTo(ex + Math.cos(aa) * len, ey + Math.sin(aa) * len); g.stroke();
      }
    }
    var gr = g.createRadialGradient(x + w * 0.3, y + h * 0.22, m * 0.03, x + w * 0.45, y + h * 0.47, m * 0.9);
    gr.addColorStop(0, rgba(mix(c, WHITE, 0.3))); gr.addColorStop(0.36, rgba(c)); gr.addColorStop(0.8, rgba(mix(c, NIGHT, 0.36))); gr.addColorStop(1, rgba(mix(c, NIGHT, 0.58)));
    g.fillStyle = gr; g.fill(p, rule);
    g.save(); g.clip(p, rule);
    gr = g.createRadialGradient(x + w * 0.86, y + h * 0.95, 0, x + w * 0.86, y + h * 0.95, m * 0.62);
    gr.addColorStop(0, 'rgba(8,10,40,.22)'); gr.addColorStop(1, 'rgba(8,10,40,0)');
    g.fillStyle = gr; g.fillRect(x - 2, y - 2, w + 4, h + 4);
    if (o.fibres !== false && q > 0.1) {
      var nf = Math.round(w * h * (o.density || 3.2) * q);
      for (var j = 0; j < nf; j++) {
        var fx = x + R() * w, fy = y + R() * h;
        var l2 = 1 - Math.min(1, Math.hypot((fx - (x + w * 0.3)) / w, (fy - (y + h * 0.22)) / h) * 1.2);
        var a2 = R() * Math.PI, ln = 0.35 + R() * 0.6;
        g.strokeStyle = l2 > 0.45 ? rgba(lite, 0.16 + l2 * 0.18) : rgba(dark, 0.12 + (1 - l2) * 0.1);
        g.lineWidth = 0.1;
        g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a2) * ln, fy + Math.sin(a2) * ln); g.stroke();
      }
    }
    g.restore();
    g.restore();
  }

  // A face, matte, centred between the eyes at (x, y), scale s.
  function face(g, x, y, s, mood, o) {
    o = o || {};
    var ink = o.ink || '#231d33';
    var ex = s * (o.spread || 0.55), r = s * (o.eye || 0.13), lw = s * 0.1;
    g.save();
    g.strokeStyle = ink; g.fillStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = lw;
    function dot(cx, cy) { g.beginPath(); g.ellipse(cx, cy, r, r * 1.12, 0, 0, Math.PI * 2); g.fill(); }
    function st(d) { g.stroke(new Path2D(d)); }
    function q(a, b, c2, d, e, f) { return 'M' + a + ' ' + b + ' Q' + c2 + ' ' + d + ' ' + e + ' ' + f; }
    function brows(inUp, lift) {
      st('M' + (x - ex - s * 0.17) + ' ' + (y - s * (inUp ? 0.24 : 0.3)) + ' L' + (x - ex + s * 0.13) + ' ' + (y - s * (inUp ? 0.36 : 0.26)));
      st('M' + (x + ex + s * 0.17) + ' ' + (y - s * (inUp ? 0.24 : 0.3) - (lift || 0)) + ' L' + (x + ex - s * 0.13) + ' ' + (y - s * (inUp ? 0.36 : 0.26) - (lift || 0)));
    }
    mood = mood || 'idle';
    if (mood === 'idle') {
      dot(x - ex, y); dot(x + ex, y);
      st(q(x - s * 0.2, y + s * 0.36, x, y + s * 0.56, x + s * 0.2, y + s * 0.36));
    } else if (mood === 'pleased') {
      dot(x - ex, y); dot(x + ex, y);
      st(q(x - s * 0.3, y + s * 0.3, x, y + s * 0.66, x + s * 0.3, y + s * 0.3));
    } else if (mood === 'speaking') {
      dot(x - ex, y); dot(x + ex, y);
      g.beginPath(); g.ellipse(x, y + s * 0.46, s * 0.15, s * 0.12, 0, 0, Math.PI * 2); g.fill();
    } else if (mood === 'thinking') {
      dot(x - ex + s * 0.12, y - s * 0.12); dot(x + ex + s * 0.12, y - s * 0.12);
      st('M' + (x + s * 0.02) + ' ' + (y + s * 0.44) + ' L' + (x + s * 0.26) + ' ' + (y + s * 0.4));
      g.save(); g.globalAlpha = 0.45;
      [[1.2, -0.75, 0.07], [1.42, -1.0, 0.1], [1.7, -1.3, 0.14]].forEach(function (d) { g.beginPath(); g.arc(x + s * d[0], y + s * d[1], s * d[2], 0, 7); g.fill(); });
      g.restore();
    } else if (mood === 'proud') {
      st(q(x - ex - s * 0.16, y + s * 0.05, x - ex, y - s * 0.16, x - ex + s * 0.16, y + s * 0.05));
      st(q(x + ex - s * 0.16, y + s * 0.05, x + ex, y - s * 0.16, x + ex + s * 0.16, y + s * 0.05));
      g.fill(new Path2D(q(x - s * 0.28, y + s * 0.3, x, y + s * 0.74, x + s * 0.28, y + s * 0.3) + 'Z'));
      var sx = x + s * 1.3, sy = y - s * 0.9, k = s * 0.22;
      g.fillStyle = '#f2b93b';
      g.fill(new Path2D('M' + sx + ' ' + (sy - k) + ' Q' + sx + ' ' + sy + ' ' + (sx + k) + ' ' + sy + ' Q' + sx + ' ' + sy + ' ' + sx + ' ' + (sy + k) + ' Q' + sx + ' ' + sy + ' ' + (sx - k) + ' ' + sy + ' Q' + sx + ' ' + sy + ' ' + sx + ' ' + (sy - k) + 'Z'));
    } else if (mood === 'unsure') {
      dot(x - ex, y + s * 0.02); dot(x + ex, y + s * 0.02);
      st('M' + (x - ex - s * 0.16) + ' ' + (y - s * 0.28) + ' L' + (x - ex + s * 0.14) + ' ' + (y - s * 0.28));
      st('M' + (x + ex - s * 0.16) + ' ' + (y - s * 0.32) + ' L' + (x + ex + s * 0.14) + ' ' + (y - s * 0.44));
      st('M' + (x - s * 0.2) + ' ' + (y + s * 0.46) + ' L' + (x + s * 0.2) + ' ' + (y + s * 0.4));
    } else if (mood === 'worried') {
      dot(x - ex, y + s * 0.04); dot(x + ex, y + s * 0.04);
      brows(true);
      st('M' + (x - s * 0.24) + ' ' + (y + s * 0.48) + ' q' + s * 0.08 + ' ' + -s * 0.1 + ' ' + s * 0.16 + ' 0 t' + s * 0.16 + ' 0 t' + s * 0.16 + ' 0');
      var dx = x + ex + s * 0.55, dy = y - s * 0.45;
      g.fillStyle = '#86c9ef';
      g.fill(new Path2D('M' + dx + ' ' + (dy - s * 0.22) + ' Q' + (dx + s * 0.16) + ' ' + dy + ' ' + dx + ' ' + (dy + s * 0.1) + ' Q' + (dx - s * 0.16) + ' ' + dy + ' ' + dx + ' ' + (dy - s * 0.22) + 'Z'));
    } else if (mood === 'sorry') {
      st(q(x - ex - s * 0.15, y, x - ex, y + s * 0.13, x - ex + s * 0.15, y));
      st(q(x + ex - s * 0.15, y, x + ex, y + s * 0.13, x + ex + s * 0.15, y));
      st('M' + (x - ex - s * 0.17) + ' ' + (y - s * 0.2) + ' L' + (x - ex + s * 0.13) + ' ' + (y - s * 0.3));
      st('M' + (x + ex + s * 0.17) + ' ' + (y - s * 0.2) + ' L' + (x + ex - s * 0.13) + ' ' + (y - s * 0.3));
      st(q(x - s * 0.17, y + s * 0.5, x, y + s * 0.36, x + s * 0.17, y + s * 0.5));
    }
    if (o.blush) {
      g.fillStyle = 'rgba(255,128,168,.45)';
      [-1, 1].forEach(function (sg) { g.beginPath(); g.ellipse(x + sg * ex * 1.45, y + s * 0.3, s * 0.17, s * 0.1, 0, 0, 7); g.fill(); });
    }
    g.restore();
  }

  // Felt A: one felt accessory per job. layer: 'front' (before the face) or 'last' (after it).
  function jobs(g, i, layer, q) {
    var c = ART[i].c, o = function (seed, extra) { var r = { seed: seed, q: q }; for (var k in extra) r[k] = extra[k]; return r; };
    if (i === 0 && layer === 'front') {
      var dk = mix(c, NIGHT, 0.58);
      felt(g, ring(19, 25.4, 3.6, 2.6), dk, o(5, { rule: 'evenodd', fuzzLen: 0.35, density: 1.5 }));
      felt(g, ring(29, 25.4, 3.6, 2.6), dk, o(6, { rule: 'evenodd', fuzzLen: 0.35, density: 1.5 }));
      felt(g, rr(22.4, 24.6, 3.2, 1.1, 0.5), dk, o(7, { fuzz: false }));
    }
    if (i === 0 && layer === 'last') {
      g.save(); g.translate(39, 33); g.rotate(0.16); g.translate(-39, -33);
      felt(g, rr(33.5, 27, 11, 13.5, 1.4), [238, 230, 212], o(3, { density: 2.4, fuzzLen: 0.5 }));
      felt(g, rr(36.5, 25.6, 5, 2.6, 1), mix(c, NIGHT, 0.45), o(4, { fuzzLen: 0.4 }));
      g.strokeStyle = 'rgba(120,110,95,.7)'; g.lineWidth = 0.35; g.setLineDash([0.7, 0.45]);
      [31, 34, 37].forEach(function (y) { g.beginPath(); g.moveTo(35.5, y); g.lineTo(42.5, y); g.stroke(); });
      g.restore();
    }
    if (i === 1 && layer === 'front') {
      var hd = new Path2D(); hd.moveTo(42.5, 25.5); hd.lineTo(46.8, 31.8); hd.lineTo(45.2, 33); hd.lineTo(40.9, 26.8); hd.closePath();
      felt(g, hd, [150, 104, 64], o(8, { fuzzLen: 0.4 }));
      felt(g, ring(39.5, 21.5, 5.4, 3.9), [120, 86, 60], o(9, { rule: 'evenodd', fuzzLen: 0.4 }));
      felt(g, ell(39.5, 21.5, 3.9, 3.9), [226, 240, 246], o(10, { fuzz: false, density: 1.2 }));
      g.save(); g.strokeStyle = rgba(GREEN); g.lineWidth = 0.9; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(37.6, 21.6); g.lineTo(39, 23.1); g.lineTo(41.6, 20); g.stroke(); g.restore();
    }
    if (i === 2 && layer === 'front') {
      var dome = new Path2D(); dome.moveTo(13, 13.6); dome.bezierCurveTo(13, 4.6, 35, 4.6, 35, 13.6); dome.closePath();
      felt(g, dome, [244, 196, 48], o(11, { fuzzLen: 0.5 }));
      felt(g, rr(10.5, 12.6, 27, 2.6, 1.3), [226, 172, 30], o(12, { fuzzLen: 0.4 }));
      felt(g, rr(22.6, 6.2, 2.8, 6.6, 1.2), [214, 160, 26], o(13, { fuzz: false }));
    }
    if (i === 3 && layer === 'front') {
      var band = new Path2D(); band.arc(24, 27, 17.8, Math.PI * 1.08, Math.PI * 1.92); band.arc(24, 27, 16.2, Math.PI * 1.92, Math.PI * 1.08, true); band.closePath();
      felt(g, band, [86, 70, 110], o(14, { fuzzLen: 0.4 }));
      felt(g, ell(8.4, 27.5, 3.1, 4.4), [86, 70, 110], o(15, { fuzzLen: 0.45 }));
      felt(g, ell(39.6, 27.5, 3.1, 4.4), [86, 70, 110], o(16, { fuzzLen: 0.45 }));
      felt(g, ell(40.4, 27.5, 1.6, 2.6), [250, 214, 230], o(17, { fuzz: false }));
    }
    if (i === 4 && layer === 'front') {
      var crown = new Path2D(); crown.moveTo(12.5, 13.4); crown.bezierCurveTo(11.5, 6.2, 18, 4.2, 24, 4.2); crown.bezierCurveTo(30, 4.2, 36.5, 6.2, 35.5, 13.4); crown.closePath();
      felt(g, crown, [246, 246, 240], o(18, { fuzzLen: 0.5 }));
      felt(g, rr(12.4, 10.8, 23.2, 3, 1.2), mix(GREEN, NIGHT, 0.45), o(19, { fuzz: false }));
      var peak = new Path2D(); peak.ellipse(24, 14.2, 9.6, 2.4, 0, 0, Math.PI); peak.closePath();
      felt(g, peak, [40, 44, 70], o(20, { fuzzLen: 0.35 }));
      felt(g, ell(24, 8.8, 1.7, 1.7), [240, 190, 70], o(21, { fuzz: false }));
    }
  }

  // Felt B: a wool pompom on the silhouette, stubby felt arms and feet.
  function pompom(g, i, q) {
    var c = ART[i].c, p = bodyPath(i), b = bbox(p);
    var x = b[0], y = b[1], w = b[2], h = b[3], cx = x + w / 2, cy = y + h / 2;
    var lite = mix(c, WHITE, 0.5), dark = mix(c, NIGHT, 0.42), limb = mix(c, NIGHT, 0.3);
    function stub(sx, sy, rx, ry, rot, seed) { felt(g, ell(sx, sy, rx, ry, rot), limb, { seed: seed, fuzzLen: 0.35, density: 2, q: q }); }
    stub(18.6, 44.2, 3.2, 1.9, -0.15, 3);
    stub(29.4, 44.2, 3.2, 1.9, 0.15, 4);
    felt(g, p, mix(c, NIGHT, 0.08), { seed: 7 + i, fuzz: false, density: 1.5, q: q });
    var R = rng((7 + i) * 13 + 1);
    var N = Math.round(5200 * q);
    g.save(); g.lineCap = 'round';
    for (var k = 0; k < N; k++) {
      var px, py, tries = 0;
      do { px = x + R() * w; py = y + R() * h; tries++; } while (!inside(p, px, py) && tries < 20);
      var dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1;
      var rad = Math.min(1, d / (Math.max(w, h) / 2));
      var a = Math.atan2(dy, dx) + (R() - 0.5) * 1.1;
      var len = (0.9 + R() * 1.6) * (0.55 + rad * 0.9);
      var bend = (R() - 0.5) * len * 0.8;
      var ex = px + Math.cos(a) * len, ey = py + Math.sin(a) * len;
      var mx = (px + ex) / 2 - Math.sin(a) * bend, my = (py + ey) / 2 + Math.cos(a) * bend;
      var lit = 1 - Math.min(1, Math.hypot((ex - (x + w * 0.3)) / w, (ey - (y + h * 0.24)) / h) * 1.15);
      var col = lit > 0.55 ? mix(c, lite, (lit - 0.55) * 1.8) : mix(dark, c, Math.max(0, lit) / 0.55);
      g.strokeStyle = rgba(col, 0.5 + R() * 0.3);
      g.lineWidth = (0.16 + R() * 0.12) * (q < 0.5 ? 1.6 : 1);
      g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
    }
    g.restore();
    stub(6.6, 30, 2.6, 1.9, 0.5, 5);
    stub(41.6, 27.5, 2.6, 1.9, -0.5, 6);
  }

  function get() {
    var s = null;
    try { s = localStorage.getItem(KEY); } catch (e) {}
    return STYLES.indexOf(s) >= 0 ? s : 'original';
  }
  function set(style) {
    if (STYLES.indexOf(style) < 0) return;
    try { localStorage.setItem(KEY, style); } catch (e) {}
    window.dispatchEvent(new CustomEvent('crew-characters', { detail: { style: style } }));
  }

  // Draw character `index` centred at (x, y) in a size x size box.
  function draw(ctx, index, x, y, size, opts) {
    opts = opts || {};
    var style = opts.style || get();
    var mood = opts.expression || 'idle';
    var i = Math.max(0, Math.min(4, index | 0));
    var k = size / 48;
    var q = size >= 140 ? 1 : size >= 70 ? 0.6 : 0.3;
    ctx.save();
    ctx.translate(x - size / 2, y - size / 2);
    ctx.scale(k, k);
    if (opts.shadow) { ctx.fillStyle = 'rgba(20,18,40,.12)'; ctx.beginPath(); ctx.ellipse(24, 45.5, 15, 1.8, 0, 0, 7); ctx.fill(); }
    var blush = ART[i].blush;
    if (style === 'pompom') {
      pompom(ctx, i, q);
      face(ctx, 24, 25.6, 10.2, mood, { blush: true, spread: 0.58, eye: 0.17, ink: '#1f1a2c' });
    } else {
      felt(ctx, bodyPath(i), ART[i].c, { seed: 31 + ART[i].name.length, q: q });
      if (style === 'jobs') jobs(ctx, i, 'front', q);
      face(ctx, 24, i === 0 && style === 'jobs' ? 25.6 : 25.4, 8.8, mood, { blush: blush });
      if (style === 'jobs') jobs(ctx, i, 'last', q);
    }
    ctx.restore();
  }

  var cache = new Map();
  function canvas(index, size, opts) {
    opts = opts || {};
    var style = opts.style || get();
    var key = style + '|' + index + '|' + size + '|' + (opts.expression || 'idle') + '|' + (opts.shadow ? 1 : 0);
    if (cache.has(key)) return cache.get(key);
    var cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    draw(cv.getContext('2d'), index, size / 2, size / 2, size, { style: style, expression: opts.expression, shadow: opts.shadow });
    cache.set(key, cv);
    return cv;
  }

  var LABELS = { original: 'Original felt', jobs: 'Felt with jobs', pompom: 'Pompom' };
  function mountPicker() {
    if (document.getElementById('crew-chars')) return document.getElementById('crew-chars');
    var css = document.createElement('style');
    css.textContent = [
      '#crew-chars{position:fixed;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:2147482000;display:flex;align-items:center;gap:6px;',
      'padding:5px 6px 5px 12px;border-radius:14px;background:rgba(20,20,24,.82);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);',
      'border:1px solid rgba(255,255,255,.14);font:500 13px/1 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:rgba(244,244,242,.72)}',
      '#crew-chars .lbl{margin-right:4px}',
      '#crew-chars button{all:unset;cursor:pointer;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.06);border:1px solid transparent}',
      '#crew-chars button:hover{background:rgba(255,255,255,.14)}',
      '#crew-chars button[aria-pressed=true]{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.55)}',
      '#crew-chars button:focus-visible{outline:2px solid #fff;outline-offset:2px}',
      '#crew-chars canvas{width:28px;height:28px;display:block}',
      '@media (max-width:760px){#crew-chars{bottom:calc(max(14px,env(safe-area-inset-bottom)) + 56px)}#crew-chars .lbl{display:none}#crew-chars{padding:5px}}'
    ].join('');
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.id = 'crew-chars';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Character style');
    var lbl = document.createElement('span'); lbl.className = 'lbl'; lbl.textContent = 'Characters';
    box.appendChild(lbl);
    var buttons = STYLES.map(function (s) {
      var b = document.createElement('button');
      b.type = 'button'; b.title = LABELS[s]; b.setAttribute('aria-label', LABELS[s]); b.dataset.style = s;
      var src = canvas(0, 56, { style: s });
      var cv = document.createElement('canvas'); cv.width = 56; cv.height = 56; cv.getContext('2d').drawImage(src, 0, 0);
      b.appendChild(cv);
      b.addEventListener('click', function () { set(s); });
      box.appendChild(b);
      return b;
    });
    function sync() { var cur = get(); buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.style === cur ? 'true' : 'false'); }); }
    sync();
    window.addEventListener('crew-characters', sync);
    (document.body || document.documentElement).appendChild(box);
    return box;
  }

  window.CrewCharacters = {
    styles: STYLES.slice(),
    expressions: ['idle', 'thinking', 'speaking', 'pleased', 'proud', 'unsure', 'worried', 'sorry'],
    names: ART.map(function (a) { return a.name; }),
    colours: ART.map(function (a) { return a.c.slice(); }),
    get: get,
    set: set,
    draw: draw,
    canvas: canvas,
    mountPicker: mountPicker
  };
})();
