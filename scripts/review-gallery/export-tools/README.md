# Static review exports

Use a checkout with dependencies installed. The build reads only public Supabase CMS configuration from `apps/web/.env.local`; this file is copied only to the private build workspace, never to `out`.

- Editorial source: `87c1c1db0d5d73ed0d98a1c42c39cc89c32758b9`.
- Paseo source: start with `79deebe49826e714d8e26bc727d3e72c770ad68a`, then `git apply --binary paseo-source.patch`. This preserves the requested agent’s uncommitted application source and original images, without private context or environment files.

```sh
python3 build-static.py /path/to/source editorial /tmp/editorial-review-build
python3 build-static.py /path/to/paseo-source paseo /tmp/paseo-review-build
```

Publish only each build's `out` directory at `/elyweb/previews/editorial/` or `/elyweb/previews/paseo/`. Public content is a build-time snapshot. Contact sending is disabled with an on-page notice. Existing client interactions remain functional. Internal links use full static-document navigation to avoid requiring a Next server. Local assets and Next payloads preserve the deployment prefix. Fonts, videos, stores, and some CMS images still use their existing external hosts. Empty news detail routes produce no content.
