/* Small helpers shared by notebook animations: theme-aware colours,
   crisp responsive canvas, and an animation loop that pauses off-screen. */
window.NotebookKit = (function () {
  function colors() {
    var cs = getComputedStyle(document.documentElement);
    function g(name, fallback) {
      return (cs.getPropertyValue(name) || "").trim() || fallback;
    }
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      dark: dark,
      text: g("--global-text-color", dark ? "#c9d1d9" : "#000"),
      muted: g("--global-text-color-light", "#828282"),
      theme: g("--global-theme-color", dark ? "#2698ba" : "#b509ac"),
      bg: g("--global-bg-color", dark ? "#1c1c1d" : "#fff"),
      divider: g("--global-divider-color", "rgba(0,0,0,.1)"),
      accent: dark ? "#e9a03b" : "#d0730f",
      font: getComputedStyle(document.body).fontFamily || "sans-serif",
    };
  }

  // aspect: number or function(width) -> height/width
  function canvas(el, aspect) {
    var ctx = el.getContext("2d");
    var s = { ctx: ctx, w: 0, h: 0 };
    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var w = el.parentElement.clientWidth;
      var a = typeof aspect === "function" ? aspect(w) : aspect;
      var h = Math.round(w * a);
      el.style.height = h + "px";
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.w = w;
      s.h = h;
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(el.parentElement);
    else window.addEventListener("resize", resize);
    return s;
  }

  // step(dt) is called every frame while the canvas is visible and not paused.
  function loop(el, step) {
    var ctl = { paused: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches };
    var visible = true,
      last = performance.now();
    if (window.IntersectionObserver)
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
      }).observe(el);
    function frame(t) {
      var dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (visible) step(ctl.paused ? 0 : dt);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return ctl;
  }

  return { colors: colors, canvas: canvas, loop: loop };
})();
