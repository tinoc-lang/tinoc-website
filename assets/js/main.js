/* TINOC — shared site JS */
(function () {
  "use strict";

  /* ============================================================
     Syntax highlighter (dependency-free)
     ============================================================ */
  const TNC_KEYWORDS =
    "fn|var|const|struct|enum|union|switch|case|default|if|else|for|while|return|break|continue|import|pub|static|self|try|catch|defer|orelse|and|or|not|test";
  const TNC_TYPES =
    "i8|i16|i32|i64|i128|u8|u16|u32|u64|u128|usize|isize|f32|f64|f128|bool|char|void|str|hstr|vec|map|set";
  const C_KEYWORDS =
    "int|void|return|const|struct|typedef|if|else|for|while|sizeof|static|enum|union|switch|case|break|continue|char|unsigned|signed|long|short|double|float|bool|true|false|size_t|printf";

  const escHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function runPatterns(src, patterns) {
    let out = "";
    let i = 0;
    while (i < src.length) {
      const rest = src.slice(i);
      let matched = false;
      for (const p of patterns) {
        const m = rest.match(p.re);
        if (m && m[0].length > 0) {
          out += `<span class="${p.cls}">${m[0]}</span>`;
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        out += src[i];
        i += 1;
      }
    }
    return out;
  }

  const numRe =
    /^(?:0x[0-9a-fA-F_]+(?:\.[0-9a-fA-F_]+)?(?:[pP][+-]?[0-9]+)?|0o[0-7_]+|0b[01_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)/;
  const strRe = /^"(?:[^"\\]|\\.)*"/;
  const cmtRe = /^\/\/[^\n]*/;
  const cBlockCmtRe = /^\/\*[\s\S]*?\*\//;
  const preRe = /^#[a-zA-Z][a-zA-Z0-9_.]*/;

  const tncPatterns = [
    { cls: "tok-cmt", re: cmtRe },
    { cls: "tok-pre", re: preRe },
    { cls: "tok-str", re: strRe },
    { cls: "tok-num", re: numRe },
    { cls: "tok-kw", re: new RegExp(`^(?:${TNC_KEYWORDS})\\b`) },
    { cls: "tok-type", re: new RegExp(`^(?:${TNC_TYPES})\\b`) },
  ];

  const cPatterns = [
    { cls: "tok-cmt", re: cBlockCmtRe },
    { cls: "tok-cmt", re: cmtRe },
    { cls: "tok-pre", re: preRe },
    { cls: "tok-str", re: strRe },
    { cls: "tok-num", re: numRe },
    { cls: "tok-kw", re: new RegExp(`^(?:${C_KEYWORDS})\\b`) },
  ];

  const highlight = (code, lang) =>
    runPatterns(escHtml(code), lang === "c" ? cPatterns : tncPatterns);

  window.TinocHL = {
    highlight,
    tnc: (code) => highlight(code, "tnc"),
    c: (code) => highlight(code, "c"),
  };

  /* ============================================================
     Mobile nav
     ============================================================ */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const isOpen = () => links && links.classList.contains("open");

  function setMenu(open) {
    if (!toggle || !links) return;
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-locked", open);
  }

  if (toggle && links) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenu(!isOpen());
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("click", (e) => {
      if (isOpen() && !e.target.closest(".nav-pill")) setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) setMenu(false);
    }, { passive: true });
  }

  /* ============================================================
     Header state
     ============================================================ */
  const pill = document.querySelector(".nav-pill");
  const onScroll = () => {
    if (pill) pill.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ============================================================
     Footer year
     ============================================================ */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ============================================================
     GitHub stats (graceful when offline/blocked)
     ============================================================ */
  const stats = document.querySelectorAll("[data-gh-stat]");
  if (stats.length) {
    fetch("https://api.github.com/repos/tinoc-lang/tinoc", { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((repo) => {
        stats.forEach((el) => {
          const key = el.getAttribute("data-gh-stat");
          const val = repo[key];
          if (typeof val === "number") {
            el.textContent = val.toLocaleString("en-US");
          }
        });
      })
      .catch(() => {
        /* leave placeholders untouched */
      });
  }

  /* ============================================================
     Reveal on scroll
     ============================================================ */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ============================================================
     Back to top
     ============================================================ */
  const backTop = document.querySelector(".back-top");
  if (backTop) {
    const onScrollTop = () => backTop.classList.toggle("show", window.scrollY > 600);
    onScrollTop();
    window.addEventListener("scroll", onScrollTop, { passive: true });
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
})();
