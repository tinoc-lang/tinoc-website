# tinoc-website

The official website for [**Tinoc**](https://github.com/tinoc-lang/tinoc) — **T**his **I**s **No**t **C**, a modern systems programming language that transpiles to C11.

## Pages

| Page | Purpose |
| --- | --- |
| [`index.html`](index.html) | Landing page: philosophy, features, type system, language support, roadmap |
| [`docs.html`](docs.html) | Language reference: variables, types, optionals, structs, enums, unions, arrays, control flow, modules, C interop, preprocessor |
| [`install.html`](install.html) | Install guide for the v0.1.0 release (`install.sh` / `install.ps1`) |
| [`changelog.html`](changelog.html) | All notable changes, per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) |
| [`community.html`](community.html) | Community channels and contribution guide |

## Stack

Plain HTML + CSS + vanilla JS — no build step. The design system lives in
[`assets/css/style.css`](assets/css/style.css); shared behavior (nav, syntax
highlighting, GitHub stats, reveal-on-scroll) lives in
[`assets/js/main.js`](assets/js/main.js).

## Local development

Open any page directly in a browser, or serve the directory:

```bash
python3 -m http.server 8000
```

## SEO

- Every page ships canonical URLs, Open Graph / Twitter card metadata, and
  JSON-LD structured data.
- [`robots.txt`](robots.txt) and [`sitemap.xml`](sitemap.xml) cover the whole
  site.

## License

Apache-2.0. See [LICENSE.md](LICENSE.md).
