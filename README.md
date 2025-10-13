# Delta Elmech – Website

A simple, static website for Delta Elmech. This repository contains the HTML, CSS, JS, and asset files needed to run the site locally or host it on GitHub Pages.

## Quick Start

1. Clone the repository

```bash
git clone https://github.com/Tharun-de/delta_elmech_live_html.git
cd delta_elmech_live_html
```

2. Open the site

- Option A: Double-click `index.html` to open it in your browser.
- Option B: Serve locally (recommended for correct relative paths and assets):

PowerShell (Windows):

```powershell
python -m http.server 8000
# then open http://localhost:8000/
```

VS Code users can also use the "Live Server" extension.

## Project Structure

```text
delta_elmech_live_html/
├─ index.html
├─ about.html
├─ assets/
│  ├─ css/
│  │  ├─ styles.css                 # Global stylesheet that pulls others together
│  │  ├─ animations.css             # Animations
│  │  ├─ base.css                   # Resets/base styles
│  │  ├─ utilities.css              # Utility classes
│  │  ├─ components/                # Component-level styles
│  │  ├─ layout/                    # Header/Footer layout styles
│  │  ├─ pages/                     # Page-specific styles (e.g., about.css)
│  │  └─ sections/                  # Section styles (hero, metrics, partners, work)
│  ├─ js/
│  │  └─ main.js                    # Site interactions
│  ├─ for our services/             # Service images
│  ├─ for our works/                # Portfolio/work images
│  ├─ our partner/                  # Partner logos
│  ├─ insta,linkdln/                # Social icons
│  └─ vid/                          # Videos and related assets
```

## Editing the Site

- HTML pages: `index.html`, `about.html`
- Global CSS: `assets/css/styles.css`
- Additional CSS by area: `assets/css/{components|layout|pages|sections}`
- JavaScript: `assets/js/main.js`
- Images & media: under `assets/` subfolders (note: some folders have spaces in their names)

Tip (paths with spaces): when referencing assets from the command line, wrap paths in quotes, e.g. `"assets/for our works/IMG_9133.JPG"`.

## Deploying to GitHub Pages

You can host this site directly from this repository using GitHub Pages.

1. Push changes to `main`.
2. In GitHub, go to: Settings → Pages.
3. Under "Source", choose "Deploy from a branch".
4. Select Branch: `main` and Folder: `/root`.
5. Save.

After a minute, your site should be available at:

`https://tharun-de.github.io/delta_elmech_live_html/`

## SEO & Domain

Canonical and OG/Twitter meta tags are configured for `https://deltaelmechsystems.com`. Update if the domain changes.

Place `robots.txt` and `sitemap.xml` at the site root when deploying to a custom domain.

## Contributing / Workflow

1. Create a new branch for changes:

```bash
git checkout -b feature/update-hero
```

2. Make edits, then commit and push:

```bash
git add -A
git commit -m "feat(hero): update headline and call-to-action"
git push -u origin feature/update-hero
```

3. Open a Pull Request on GitHub and merge when reviewed.

## Troubleshooting

- Line endings on Windows: if you see CRLF/LF warnings, you can run:

```bash
git config core.autocrlf true
```

- Assets not loading when opening files directly: use a local server (see Quick Start) so relative paths resolve correctly.

## License

Copyright (c) 2025 Delta Elmech. All rights reserved.

If you prefer to use an open-source license (e.g., MIT), replace this section with your chosen license.

## Contact

Add your preferred contact details (email, phone, or website) here.


