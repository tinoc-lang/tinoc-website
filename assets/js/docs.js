/* TINOC — docs page */
(function () {
  "use strict";

  const hl = window.TinocHL;
  const sidebar = document.getElementById("docs-sidebar");
  const links = sidebar ? Array.from(sidebar.querySelectorAll("a[href^='#']")) : [];

  /* ============================================================
     Code blocks: highlight + copy buttons
     ============================================================ */
  document.querySelectorAll(".code-block").forEach((block) => {
    const pre = block.querySelector("pre");
    const code = pre ? pre.querySelector("code") : null;
    if (!code) return;

    const classes = Array.from(code.classList);
    const lang = classes.find((c) => c.startsWith("lang-"));
    const name = lang ? lang.replace("lang-", "") : "tnc";

    const set = ["tnc", "c"].includes(name)
      ? name
      : ["text", "sh", "bash", "shell", "console"].includes(name)
        ? "shell"
        : null;
    if (set) {
      code.innerHTML = hl.highlight(code.textContent, set);
    }

    const head = block.querySelector(".code-block-head");
    if (head) {
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>';
      btn.setAttribute("aria-label", "Copy code to clipboard");
      head.appendChild(btn);

      btn.addEventListener("click", () => {
        const text = code.textContent;
        const done = () => {
          btn.classList.add("copied");
          btn.querySelector("span").textContent = "Copied";
          setTimeout(() => {
            btn.classList.remove("copied");
            btn.querySelector("span").textContent = "Copy";
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        } else {
          fallbackCopy(text, done);
        }
      });
    }
  });

  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }

  /* ============================================================
     Sidebar search filter
     ============================================================ */
  const search = document.getElementById("docs-search");
  if (search && sidebar) {
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      links.forEach((a) => {
        const match = !q || a.textContent.toLowerCase().includes(q);
        a.classList.toggle("hidden", !match);
        if (match) visible += 1;
      });
      sidebar.querySelectorAll(".docs-nav-group").forEach((group) => {
        const hasVisible = Array.from(group.querySelectorAll("a")).some((a) => !a.classList.contains("hidden"));
        group.style.display = hasVisible ? "" : "none";
      });
      if (visible === 0) {
        let empty = document.getElementById("docs-empty");
        if (!empty) {
          empty = document.createElement("p");
          empty.id = "docs-empty";
          empty.className = "muted mono";
          empty.style.cssText = "font-size:0.82rem;padding:8px 12px;color:var(--ink-faint)";
          empty.textContent = "No sections match — try a different word.";
          sidebar.appendChild(empty);
        }
        empty.style.display = "";
      } else {
        const empty = document.getElementById("docs-empty");
        if (empty) empty.style.display = "none";
      }
    });
  }

  /* ============================================================
     Scroll-spy: highlight the section currently in view
     ============================================================ */
  const articles = Array.from(document.querySelectorAll(".docs-content article[id]"));
  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (document.getElementById(id)) map.set(id, a);
  });

  let activeId = null;
  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    links.forEach((a) => a.classList.remove("active"));
    const link = map.get(id);
    if (link) link.classList.add("active");
  }

  if ("IntersectionObserver" in window && articles.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    articles.forEach((a) => spy.observe(a));
  }

  links.forEach((a) => {
    a.addEventListener("click", () => {
      setActive(a.getAttribute("href").slice(1));
      closeSidebar();
    });
  });

  /* ============================================================
     Mobile contents toggle
     ============================================================ */
  const toggle = document.getElementById("docs-toggle");
  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
})();
