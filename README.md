# aaryagupta4.github.io

Personal site. Vanilla HTML, CSS, and one small JS file — no build step.

## Local preview

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)

1. On GitHub, create a **new public repo** named exactly `aaryagupta4.github.io`
   (that name is what makes it a user site).
2. From this folder:

   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/aaryagupta4/aaryagupta4.github.io.git
   git push -u origin main
   ```

3. On GitHub → the repo → **Settings → Pages** → set Source to
   `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
4. Wait ~1 minute. Site is live at
   [aaryagupta4.github.io](https://aaryagupta4.github.io).

## Custom domain (later)

Buy a domain, add a `CNAME` file at the repo root containing just the
domain (e.g. `aaryagupta.dev`), then configure the DNS `A`/`CNAME`
records per GitHub's [custom domain
docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Files

- `index.html` — content lives here; edit the log entries and writing
  list directly.
- `styles.css` — palette variables at the top of the file. Light and
  dark themes flip on `prefers-color-scheme`.
- `script.js` — a small star field and a scroll-reveal observer.
- `resume.pdf` — drop your latest résumé PDF here so the tile link
  works.
