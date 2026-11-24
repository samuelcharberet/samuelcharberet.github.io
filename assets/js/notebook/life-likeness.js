/* Life-likeness as a steep but continuous transition in parameter space.
   L(theta) = 1 / (1 + exp(-(theta - theta_c) / w)); the slider sets the width w. */
(function () {
  var root = document.getElementById('life-likeness');
  if (!root || !window.NotebookKit) return;
  var K = window.NotebookKit;
  var cv = root.querySelector('canvas');
  var slider = root.querySelector('input[name="w"]');
  var wOut = root.querySelector('.w-value');
  var zOut = root.querySelector('[data-out="zone"]');
  var S = K.canvas(cv, function (w) { return w < 500 ? 0.75 : 0.42; });
  var thetaC = 0.5;
  function L(t, w) { return 1 / (1 + Math.exp(-(t - thetaC) / w)); }
  function mix(a, b, t) { return Math.round(a + (b - a) * t); }
  function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c.replace(/./g, '$&$&'); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16); }); }
  function draw() {
    var w = Math.pow(10, parseFloat(slider.value));
    wOut.textContent = w < 0.01 ? w.toFixed(3) : w.toFixed(2);
    var zone = 2 * Math.log(9) * w; // width between L = 0.1 and L = 0.9
    zOut.textContent = (100 * Math.min(zone, 1)).toFixed(zone < 0.1 ? 1 : 0) + "\u00a0%";
    var c = K.colors(), ctx = S.ctx, W = S.w, H = S.h;
    ctx.clearRect(0, 0, W, H);
    var m = { l: 34, r: 12, t: 14, b: 58 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var X = function (t) { return m.l + t * pw; }, Y = function (v) { return m.t + (1 - v) * ph; };
    ctx.font = '12px ' + c.font; ctx.lineWidth = 1;
    // axes
    ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, m.t + ph); ctx.lineTo(m.l + pw, m.t + ph); ctx.stroke();
    ctx.fillStyle = c.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText('1', m.l - 6, Y(1)); ctx.fillText('0', m.l - 6, Y(0));
    ctx.save(); ctx.translate(11, m.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('life-likeness L', 0, 0); ctx.restore();
    // binary step for comparison
    ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.beginPath();
    ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(thetaC), Y(0)); ctx.lineTo(X(thetaC), Y(1)); ctx.lineTo(X(1), Y(1)); ctx.stroke(); ctx.setLineDash([]);
    // transition zone
    var a = Math.max(0, thetaC - zone / 2), b = Math.min(1, thetaC + zone / 2);
    ctx.fillStyle = c.divider; ctx.fillRect(X(a), m.t, X(b) - X(a), ph);
    // curve
    ctx.strokeStyle = c.theme; ctx.lineWidth = 2.5; ctx.beginPath();
    for (var i = 0; i <= 400; i++) { var t = i / 400, y = Y(L(t, w)); if (i) ctx.lineTo(X(t), y); else ctx.moveTo(X(t), y); }
    ctx.stroke(); ctx.lineWidth = 1;
    // colour strip: from "inanimate" (background) to "alive" (theme colour)
    var c0 = hex(c.bg.length > 3 && c.bg[0] === '#' ? c.bg : (c.dark ? '#1c1c1d' : '#ffffff'));
    var c1 = hex(c.theme[0] === '#' ? c.theme : '#b509ac');
    var sy = m.t + ph + 10, sh = 14;
    for (var px = 0; px < pw; px++) {
      var v = L(px / pw, w);
      ctx.fillStyle = 'rgb(' + mix(c0[0], c1[0], v) + ',' + mix(c0[1], c1[1], v) + ',' + mix(c0[2], c1[2], v) + ')';
      ctx.fillRect(m.l + px, sy, 1.5, sh);
    }
    ctx.strokeStyle = c.divider; ctx.strokeRect(m.l, sy, pw, sh);
    ctx.fillStyle = c.muted; ctx.textBaseline = 'top';
    ctx.textAlign = 'left'; ctx.fillText('not alive', m.l, sy + sh + 6);
    ctx.textAlign = 'right'; ctx.fillText('alive', m.l + pw, sy + sh + 6);
    ctx.textAlign = 'center'; ctx.fillText('control parameter θ', m.l + pw / 2, sy + sh + 6);
  }
  slider.addEventListener('input', draw);
  if (window.ResizeObserver) new ResizeObserver(function () { requestAnimationFrame(draw); }).observe(cv.parentElement);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  draw();
})();
