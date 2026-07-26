# Security Notes

This document records the security posture of the NetAssist client and the
known limitations to address before any production deployment.

## Threat model

NetAssist is a **client-only single-page app**. There is no backend of our own:
the browser talks directly to three third-party APIs and stores everything else
locally. Consequently, all "auth" and data handling happens on the client.

## Known limitations (must address before production)

### Authentication is mocked
`src/context/AuthContext.tsx` implements **demo authentication only**:

- `login`/`signup` ignore the password and accept any input, resolving to a
  fixed demo user after a simulated delay.
- `ProtectedRoute` gates *rendering* only; there is no session token and no
  server-side authorization.

This is safe for a demo because protected routes expose no server-side secrets —
everything shown is either mock data or the user's own on-device measurements.
The Login and Signup pages display a visible **"Demo mode"** banner so this is
not mistaken for real auth. **Before production, replace this with a real
identity provider / backend session.**

## Data handling & privacy

- **Network egress is limited to three hardcoded hosts:**
  `speed.cloudflare.com` (speed test + `meta`), `geocoding.geo.census.gov`
  (reverse/forward geocoding), and `api.zippopotam.us` (ZIP centroid). There is
  no analytics, telemetry, or beacon. The in-app AI assistant runs entirely
  locally.
- **Local storage:** coverage/test history is persisted only in the browser
  (`localStorage`, key `netassist:coverage:v1`), never uploaded. The client's
  public IP is **stripped before persistence** (data minimization); approximate
  location is retained because location tagging is the feature's purpose.
- **User control:** the Real-Time Coverage page exposes a **"Clear history"**
  control and a privacy note; `clearCoverageHistory()` purges stored data.
- **Geolocation** is requested via the browser Permissions prompt and used only
  for reverse geocoding against the Census API.

## Content-Security-Policy

A strict CSP is injected into `index.html` **at build time** (see `cspPlugin`
in `vite.config.ts`); it is intentionally not applied in dev, where Vite's HMR
needs inline scripts/eval.

- `script-src 'self'` — all scripts are bundled; no inline scripts remain (the
  service-worker registration lives in `src/main.tsx`).
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` —
  `'unsafe-inline'` is required for React inline `style={{…}}` attributes and
  Tailwind; Google Fonts CSS is host-allowlisted.
- `connect-src` is locked to the three APIs above.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.

`frame-ancestors` is omitted because it is ignored when delivered via `<meta>`.
If clickjacking protection is required, set `frame-ancestors` (and/or
`X-Frame-Options`) as a real response header at the hosting layer.

## Dependencies

Run `npm audit` as routine maintenance, and `npm audit fix` (non-`--force`) to
take semver-compatible updates.

### ⚠️ Do NOT run `npm audit fix --force` for react-router

`npm audit` currently reports one advisory against `react-router`
(GHSA-qwww-vcr4-c8h2, "RSC Mode CSRF Bypass", affecting 7.12.0–8.2.0) and
proposes "fixing" it by installing `react-router-dom@7.11.0`. **That downgrade
is a severe net regression and must not be applied:**

- **The advisory does not apply to this app.** It requires RSC (React Server
  Components) mode with server actions. This is a client-only SPA using the
  declarative API (`BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`,
  `useLocation`, `Outlet`) — no `createBrowserRouter`, no loaders/actions, no
  server, no RSC.
- **The proposed version is far more vulnerable.** Verified empirically:
  `react-router-dom@7.11.0` carries ~14 advisories (vulnerable range
  6.0.0–7.17.0), several of which *are* directly applicable here — notably
  GHSA-wrjc-x8rr-h8h6 (open redirect via backslash in `<Link>` and
  `useNavigate`, APIs this app uses heavily), plus XSS via open redirects and
  the turbo-stream deserialization RCE.
- npm's resolver picks 7.11.0 only because it escapes the *newest* advisory's
  range; it does not notice that it re-enters an older, broader one.

`7.18.1` is the latest published version and the correct one to stay on. Revisit
if a release above 8.2.0 ships.

The manifest floor is `^7.18.1` (not `^7.13.0`) so that even a fresh
resolution without the lockfile cannot land inside the old vulnerable range.

### Dev-tooling advisories: resolved

A `brace-expansion` DoS (GHSA-mh99-v99m-4gvg) previously reached the tree via
`minimatch` → `eslint` → `typescript-eslint`, accounting for 12 advisories.
These were build/lint tooling only (never in the production bundle) and are now
cleared by upgrading to `eslint@10` + `typescript-eslint@8.65`.

That upgrade also enabled stricter `react-hooks` rules, which surfaced three
genuine issues since fixed: a ref read during render and two state-syncing
effects (replaced by a `useMemo` derivation, lazy `useState` initializers, and
removal of a redundant unread-count effect).

The only advisory that remains is the non-applicable react-router one above.
