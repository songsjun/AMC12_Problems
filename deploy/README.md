# AMC12 deployment

The public archive remains a static site. The currently configured public
route is:

```text
amc12.kapy.ca -> Cloudflare Tunnel -> workspace nginx -> AMC12_Problems
```

The authenticated practice application is served from the same origin, with
only its API prefix proxied to a loopback listener:

```text
https://amc12.kapy.ca/practice/  -> workspace nginx static files
https://amc12.kapy.ca/api/amc12/ -> workspace nginx -> 127.0.0.1:8090 practice API
```

The live local routing currently uses:

- workspace nginx static origin: `http://127.0.0.1:8084`
- Cloudflare Tunnel ingress: `amc12.kapy.ca -> http://localhost:8084`
- AMC practice API listener: `http://127.0.0.1:8090` (loopback only)
- Homebrew nginx proxy vhost: `amc12.kapy.ca` on `:8080` (available for a
  local-proxy topology, but not in the checked-in Tunnel ingress above)

Files in this directory mirror the local machine configuration used to expose
the site. Apply them manually to the matching host-level config files:

- `nginx/workspace-amc12-static.conf` belongs inside the workspace nginx
  `http { ... }` block.
- `nginx/homebrew-amc12-proxy.conf` belongs in
  `/opt/homebrew/etc/nginx/servers/amc12.conf`.
- `cloudflared/amc12-ingress.yml` is the ingress rule added before the final
  fallback rule in `~/.cloudflared/config.yml`.
- `launchd/com.kapy.education.amc12-practice-api.plist` is a non-secret
  system-service template. Install it only after creating the protected
  `/etc/kapy/amc12-practice.env` described in
  [`launchd/README.md`](launchd/README.md).

## Practice UI and API

`/practice/` is a static, no-build browser client. It is deliberately separate
from the public Markdown reader at `/`: questions, active attempts, and
student data are obtained through the authenticated `/api/amc12/` API. The API
must never return answer keys or solutions from public-form or pre-final
attempt endpoints.

The sample workspace nginx configuration handles both routes:

- `/practice/` serves the files in `AMC12_Problems/practice/` with `no-cache`
  so the UI cannot lag behind an API state-machine release.
- `/practice/` also has a same-origin CSP. Its MathJax SVG runtime is vendored
  and version-pinned under `practice/vendor/mathjax/`; never substitute a CDN
  script. MathJax's dynamically injected rendering styles require the narrow
  `style-src 'unsafe-inline'` exception, while `script-src` stays `'self'`.
  Reviewed prompt images must be self-hosted or `data:` assets because the CSP
  intentionally blocks third-party image origins.
- `/api/amc12/` has one fixed upstream, `127.0.0.1:8090`, and `no-store`.
  It forwards cookies and the CSRF/idempotency request headers unchanged.
- `/practice-api` and `/practice-content` (with or without a trailing slash)
  return `404`; they contain application source and private pipeline artefacts,
  never public archive files.
- The ES-module entry point `practice/app.mjs` is explicitly served as
  `application/javascript`. Homebrew's default MIME table covers `.js` but
  not `.mjs`; do not remove the exact location or replace the inherited MIME
  table with a partial one.
- The API listener is **not** a Tunnel ingress, public listener, or nginx
  secret store. Bind it to `127.0.0.1` and keep its session secret, access-code
  hash pepper, database URL, and production access codes in the API service's
  protected environment/secret manager, never in this repository or nginx.

If the API is intentionally moved to another loopback port, update the fixed
`proxy_pass` target in `workspace-amc12-static.conf` and the API service unit
together. Do not use a client-controlled variable in `proxy_pass`.

The workspace nginx vhost permits only loopback traffic, so the local
Cloudflare Tunnel (or, in the optional topology, the local Homebrew proxy) is
the only ingress. It replaces `X-Forwarded-For` with the normalized
`CF-Connecting-IP` value and clears that upstream header before proxying to
the API; it does **not** append client-controlled forwarding values. The
launchd template then sets `AMC12_TRUST_PROXY=loopback`; do not enable it
unless this boundary rule is installed and validated together. The Homebrew
sample vhost is likewise loopback-only when it is used.

## Education-portal mount

The public education portal mounts the archive under `/amc12/`, so it needs
two extra nginx fragments in addition to the direct-host workspace vhost:

- include [`nginx/portal-amc12-map.conf`](nginx/portal-amc12-map.conf) once in
  the portal's `http { ... }` block;
- **replace** the portal's existing `location = /amc12` and `location
  /amc12/` blocks with
  [`nginx/portal-amc12-locations.conf`](nginx/portal-amc12-locations.conf) in
  that portal's existing `server { ... }` block. Do not include both old and
  new locations: nginx treats duplicate locations as a configuration error.

The portal location is deliberately `^~ /amc12/`. This prevents a broad portal
static-asset regex from claiming `/amc12/practice/mathjax-config.js` or vendored
MathJax files and returning a false `404`. The fragment also canonicalizes
`/amc12/practice` to `/amc12/practice/` before proxying, so the browser never
loses its mount prefix.

Both portal and workspace routes accept only loopback peers. After that ACL,
the portal normalizes `CF-Connecting-IP` once, sends that normalized value to
the workspace, and the workspace clears it before calling Node. Neither hop
appends a browser-provided `X-Forwarded-For` value. Keep
`AMC12_TRUST_PROXY=loopback` aligned with these ACLs; changing either one alone
invalidates the client-IP trust boundary.

The portal strips `/amc12/` before reaching the workspace, but API cookies are
set upstream with `Path=/api/amc12`. Its `proxy_cookie_path` therefore rewrites
that path to `/amc12/api/amc12`, for both session and CSRF cookies. Without the
rewrite, portal login appears to succeed but the browser does not return either
cookie to subsequent portal API requests.

Before exposing the route, verify the API is reachable only locally:

```sh
curl -fsS http://127.0.0.1:8090/api/amc12/health
curl -I http://127.0.0.1:8084/practice/
curl -I http://127.0.0.1:8084/practice/app.mjs
curl -I http://127.0.0.1:8084/practice/styles.css
curl -o /dev/null -sS -w '%{http_code}\n' http://127.0.0.1:8084/practice-api/src/server.js
curl -I http://127.0.0.1:8085/amc12/practice/mathjax-config.js
curl -i http://127.0.0.1:8084/api/amc12/auth/me
```

The last request should return an authentication error when no session cookie
is present; it must not redirect to a login page or disclose any form data.
The source-path probe must return `404`; the module and both direct/portal JS
probes must return `Content-Type: application/javascript`. Sign-in and
cookie-path verification are covered by the browser/API acceptance guide.
Run the browser and API acceptance guide at
[`../practice/MANUAL_TEST.md`](../practice/MANUAL_TEST.md) before production
release.

After changing live config:

```sh
/opt/homebrew/bin/nginx -p /Users/ss/Workspaces/education/.nginx -c nginx.conf -t
/opt/homebrew/bin/nginx -t
/opt/homebrew/bin/nginx -p /Users/ss/Workspaces/education/.nginx -c nginx.conf -s reload
/opt/homebrew/bin/nginx -s reload
cloudflared tunnel --config /Users/ss/.cloudflared/config.yml ingress validate
sudo launchctl kickstart -k system/com.cloudflare.cloudflared
```

The workspace nginx is managed at boot by the system LaunchDaemon
`com.kapy.education.workspace-nginx`. Its plist and lifecycle commands are in
`/Users/ss/Workspaces/education/.nginx/launchd/README.md`. This is separate
from Homebrew's nginx daemon.

The public archive behavior is intentionally unchanged: its existing Markdown
and raw conversion files remain static-reader assets. Do not point the
practice UI at those public URLs, and do not static-host private answer-key or
solution artifacts beside the archive.

The client resolves its API prefix relative to `/practice/`, so the existing
education-portal mount at `/amc12/practice/` also resolves through that
portal's `/amc12/` proxy as `/amc12/api/amc12/`. No cross-origin API URL or
browser-visible configuration secret is needed.
