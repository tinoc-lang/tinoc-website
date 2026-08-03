/* TINOC — landing page */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     Hero canvas — ambient glyph field + drifting mint orbs
     ============================================================ */
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const GLYPHS = "01{}[]<>;=+-*/_".split("");
    let W = 0, H = 0, DPR = 1, glyphs = [], orbs = [];

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    }

    function build() {
      const mobile = W < 640;
      orbs = [
        { x: W * 0.3, y: H * 0.34, r: Math.max(W, H) * 0.3, hue: "rgba(94,234,212,", speed: 0.00011, amp: 64, phase: 0 },
        { x: W * 0.72, y: H * 0.6, r: Math.max(W, H) * 0.22, hue: "rgba(167,243,224,", speed: 0.00008, amp: 84, phase: 2.1 },
      ];
      const count = mobile ? 24 : 52;
      glyphs = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        size: 11 + Math.random() * 7,
        baseAlpha: 0.04 + Math.random() * 0.07,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0006 + Math.random() * 0.0008,
        drift: (Math.random() - 0.5) * 0.05,
      }));
    }

    function step(t) {
      ctx.clearRect(0, 0, W, H);
      for (const o of orbs) {
        const ox = o.x + Math.cos(t * o.speed + o.phase) * o.amp;
        const oy = o.y + Math.sin(t * o.speed * 1.3 + o.phase) * o.amp;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, o.hue + "0.10)");
        g.addColorStop(1, o.hue + "0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      for (const g of glyphs) {
        const alpha = reduceMotion ? g.baseAlpha : g.baseAlpha * (0.5 + 0.5 * Math.sin(t * g.speed + g.phase));
        ctx.font = `${g.size}px "Source Code Pro", monospace`;
        ctx.fillStyle = `rgba(94,234,212,${alpha.toFixed(3)})`;
        ctx.fillText(g.ch, g.x, g.y);
        if (!reduceMotion) {
          g.y += g.drift;
          if (g.y < -20) g.y = H + 20;
          if (g.y > H + 20) g.y = -20;
        }
      }
      if (!reduceMotion) requestAnimationFrame(step);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    if (reduceMotion) step(0);
    else requestAnimationFrame(step);
  }

  /* ============================================================
     Demo code window — type the Tinoc source, toggle to C99
     ============================================================ */
  const windowBody = document.getElementById("demo-window");
  if (windowBody) {
    const TNC = [
      "#import std.io;",
      "",
      "fn main() void {",
      "    var name str = \"Prathmesh\";",
      "    const lang = \"Tinoc\";",
      "",
      "    io.println(\"{s} is creator of {s} Programming Language!\", name, lang);",
      "}",
    ].join("\n");

    const C = [
      "#include <stdio.h>",
      "#include <tinoc.h>",
      "",
      "int main() {",
      "    str name = {\"Prathmesh\", 9};",
      "    const str lang = {\"Tinoc\", 5};",
      "",
      "    printf(\"%s is creator of %s Programming Language!\\n\", name.data, lang.data);",
      "    return 0;",
      "}",
    ].join("\n");

    const tabs = {
      tnc: document.getElementById("tab-tnc"),
      c: document.getElementById("tab-c"),
    };
    const footer = document.getElementById("demo-foot");
    const pre = windowBody.querySelector("pre");
    const hl = window.TinocHL;

    let typed = 0;
    let timer = null;

    function render() {
      const visible = document.body.dataset.demoLang === "c" ? C : TNC;
      const shown = document.body.dataset.demoLang === "c" ? visible : visible.slice(0, typed);
      pre.innerHTML = hl.highlight(shown, document.body.dataset.demoLang === "c" ? "c" : "tnc");
      pre.classList.toggle("cursor-blink", document.body.dataset.demoLang !== "c" && typed < TNC.length);
      if (footer) {
        footer.innerHTML = document.body.dataset.demoLang === "c"
          ? '<span class="ok">✓</span> emitted <code>main.c</code> — ready for any C99 compiler'
          : '<span class="ok">●</span> typing <code>main.tnc</code> — watch it transpile';
      }
    }

    function setLang(lang) {
      window.clearTimeout(timer);
      document.body.dataset.demoLang = lang;
      tabs.tnc.classList.toggle("active", lang === "tnc");
      tabs.c.classList.toggle("active", lang === "c");
      if (lang === "c") {
        typed = TNC.length;
      }
      render();
      if (lang === "tnc" && reduceMotion) {
        typed = TNC.length;
        render();
      } else if (lang === "tnc" && typed < TNC.length) {
        typeLoop();
      }
    }

    function typeLoop() {
      timer = window.setTimeout(() => {
        typed += 1;
        render();
        if (typed <= TNC.length) typeLoop();
      }, reduceMotion ? 0 : 14);
    }

    tabs.tnc.addEventListener("click", () => setLang("tnc"));
    tabs.c.addEventListener("click", () => setLang("c"));

    if (reduceMotion) {
      typed = TNC.length;
    }
    document.body.dataset.demoLang = "tnc";
    render();
    if (!reduceMotion) typeLoop();
  }
})();
