# QBM post-onboarding nudge cards (prototype)

Clickable QuickBooks Mobile prototype: pick an intent in onboarding, then see that intent's nudge card on the homepage.

**Live:** https://<your-github-username>.github.io/<repo-name>/

## Run locally
Open `index.html` in a browser. It is a single self-contained file (CSS, JS, fonts and images inlined), so there is no build step or server.

## Host on GitHub Pages
1. Push this folder to a GitHub repository.
2. In the repo, go to Settings > Pages.
3. Under "Build and deployment", set Source to "Deploy from a branch", choose `main` and `/ (root)`, then Save.
4. After a minute, the site is live at the URL above.

## Files
- `index.html` is the deployed prototype (single file).
- `src/` holds the editable source: `app.js` (screens and flow), `nudge.css`, and the `kit/` design tokens, frame and components. `src/index.html` opens directly for local editing. If you change `src/`, re-inline it into the root `index.html` to update the hosted version.

## Notes
Designs come from the QBM Homepage Figma file. The bank logos, Experts avatar and nav icons are provided images. Prototype only: the destination screens after each nudge button are placeholders.
