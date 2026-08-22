/* TINOC — shared site JS */
(function () {
  "use strict";

  /* ============================================================
     Syntax highlighter (dependency-free)
     ============================================================ */
  /* Token vocabularies */
  const TNC_KEYWORDS =
    "fn|var|const|struct|enum|union|module|switch|case|default|if|else|for|while|return|break|continue|import|pub|static|self|try|catch|defer|orelse|and|or|not|test";
  const TNC_CONSTS = "null|true|false";
  const TNC_TYPES =
    "i8|i16|i32|i64|i128|u8|u16|u32|u64|u128|usize|isize|f32|f64|f128|bool|char|void|str|hstr|vec|map|set";
  const C_KEYWORDS =
    "return|const|struct|typedef|if|else|for|while|sizeof|static|enum|union|switch|case|break|continue|unsigned|signed|long|short|int|void|char|float|double";
  const C_TYPES =
    "bool|_Bool|size_t|ssize_t|ptrdiff_t|uint8_t|uint16_t|uint32_t|uint64_t|int8_t|int16_t|int32_t|int64_t|__uint128_t|__int128_t|FILE|str";
  const C_CONSTS = "NULL|nullptr|true|false";
  const SH_CMDS = "curl|irm|iex|bash|sh|pwsh|powershell|tinoc|git|cd|ls|echo";

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
          /* p.cls === null → pass through untouched (HTML entities) */
          out += p.cls ? `<span class="${p.cls}">${m[0]}</span>` : m[0];
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
  const charRe = /^'(?:[^'\\]|\\.)'/;
  const cmtRe = /^\/\/[^\n]*/;
  const cBlockCmtRe = /^\/\*[\s\S]*?\*\//;
  const preRe = /^#[a-zA-Z_][a-zA-Z0-9_.]*/;
  const metaRe = /^@[A-Za-z_][A-Za-z0-9_.]*/;
  const fnCallRe = /^[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/;
  const capIdentRe = /^[A-Z][A-Za-z0-9_]*/;
  const punctRe = /^[{}()\[\];,.]/;
  const opRe = /^[+\-*/%!<>=&|^~?:]+/;
  /* escaped HTML entities must never be tokenized */
  const entRe = /^&(?:[a-zA-Z][a-zA-Z0-9]*|#[0-9]+|#x[0-9a-fA-F]+);/;

  /* Tail patterns shared by every C-like language */
  function cLike(consts, keywords, types) {
    return [
      { re: entRe },
      { cls: "tok-cmt", re: cBlockCmtRe },
      { cls: "tok-cmt", re: cmtRe },
      { cls: "tok-pre", re: preRe },
      { cls: "tok-pre", re: metaRe },
      { cls: "tok-str", re: strRe },
      { cls: "tok-num", re: charRe },
      { cls: "tok-num", re: numRe },
      { cls: "tok-const", re: new RegExp(`^(?:${consts})\\b`) },
      { cls: "tok-kw", re: new RegExp(`^(?:${keywords})\\b`) },
      { cls: "tok-type", re: new RegExp(`^(?:${types})\\b`) },
      { cls: "tok-fn", re: fnCallRe },
      { cls: "tok-type", re: capIdentRe },
      { cls: "tok-pun", re: punctRe },
      { cls: "tok-op", re: opRe },
    ];
  }

  const tncPatterns = cLike(TNC_CONSTS, TNC_KEYWORDS, TNC_TYPES);
  const cPatterns = cLike(C_CONSTS, C_KEYWORDS, C_TYPES);

  /* Terminal / shell blocks (install commands, quick starts) */
  const shPatterns = [
    { re: entRe },
    { cls: "tok-cmt", re: cmtRe },
    { cls: "tok-kw", re: /^\$/ },
    { cls: "tok-str", re: /^https?:\/\/[^\s]+/ },
    { cls: "tok-num", re: /^--?[A-Za-z][\w-]*/ },
    { cls: "tok-fn", re: new RegExp(`^(?:${SH_CMDS})\\b`) },
    { cls: "tok-const", re: /^[A-Z_][A-Z0-9_]*(?=\s*\/)/ },
  ];

  const patternSets = { tnc: tncPatterns, c: cPatterns, shell: shPatterns };

  const highlight = (code, lang) =>
    runPatterns(escHtml(code), patternSets[lang] || tncPatterns);

  window.TinocHL = {
    highlight,
    tnc: (code) => highlight(code, "tnc"),
    c: (code) => highlight(code, "c"),
    shell: (code) => highlight(code, "shell"),
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
      { threshold: 0, rootMargin: "0px 0px -60px 0px" }
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
