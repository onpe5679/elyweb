# Elysian public design review

Public URL: https://onpe5679.github.io/elyweb/

The gallery presents five independent concepts, provides main/Habom/game links, compares two screenshots, and saves reviewer notes in the reviewer's browser. Notes are not shared automatically; use the copy buttons to send them. All previews are static snapshots. Contact sending is disabled, and example dialogue is not official game content.

## Branches

- `design/review-gallery`: gallery source, thumbnails, metadata, reproduction tools.
- `design/review-pages`: generated standalone GitHub Pages site, including five exports.
- `main`: unchanged; its existing production deployment workflow is unrelated.

| ID | Original source | Version |
| --- | --- | --- |
| editorial | design/elysian-redesign | 87c1c1d |
| paseo | original Paseo working copy; preserved as binary source patch | 79deebe + source patch |
| literary | design/independent-literary-concept | c2ff9a5 |
| manuscript | design/my-independent-concept | bdcbdff |
| atelier | design/independent-brief | 79e5698 |

The Paseo snapshot is from agent `f7c2a3e1-e001-4504-a25b-7ed7212406d5`. Its source patch contains application files and image assets only. No conversation transcript or environment files are published.

## Update

Edit `data.json`, `index.html`, `style.css`, or `app.js`. Generated exports live in ignored `previews/<id>/` folders. To restore the published exports, clone `design/review-pages` separately and copy its `previews/` folder here.

For fresh exports:

- Editorial/Paseo: see `../scripts/review-gallery/export-tools/README.md` and `build-static.py`.
- Literary: run its committed `scripts/static-preview.mjs`, then `prepare-branch-static.py SITE literary`.
- Manuscript: run its committed `scripts/preview/build-static-preview.mjs`, then `prepare-branch-static.py SITE manuscript`.
- Atelier: apply `atelier-export.patch` to a clean checkout of `79e5698`, install dependencies and run `pnpm --filter web build`. Copy `atelier-prefix.py` to that checkout's `scripts/preview/prefix-export.py`, then execute it once against the fresh export. The build needs the site's public Supabase configuration; never publish environment files.

Copy each final export to `previews/<id>/`. Run `node scripts/review-gallery/prepare.mjs` from the repository root; it adds review navigation and search exclusion metadata. Then serve the gallery at `/elyweb/` and run `node scripts/review-gallery/smoke.cjs`. Set `REVIEW_URL` to test an alternate deployment. The smoke script checks comparison, saved notes, mobile gallery width, and the 15 preview entry routes.

Run `scripts/review-gallery/publish.sh` to publish the generated branch. GitHub Pages is configured to serve the root of `design/review-pages`. This does not deploy the production site. Static exports retain their individual design choices; adaptations are limited to static hosting, disabled submissions, and the Atelier title overflow correction.
