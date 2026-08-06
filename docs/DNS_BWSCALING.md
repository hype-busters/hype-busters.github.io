# DNS note: `bwscaling.hype-busters.com`

`bwscaling.hype-busters.com` is only a **hostname**. Browsers need DNS to map it to the server that runs the BWScaling Next.js app.

## Who configures this?
Whoever manages DNS for `hype-busters.com` (registrar / Cloudflare / university DNS — **not** the survey frontend code).

Typical record:
- **Host / name:** `bwscaling`
- **Type:** `A` (to server IP) or `CNAME` (to a hostname)
- **Value:** IP or host of the machine running nginx → Next.js (PM2)

## Current status (checked Aug 2026)
| Name | Resolves to | Serves |
|------|-------------|--------|
| `bwscaling.hype-busters.com` | `130.158.41.206` | nginx → Next.js (BWScaling) |
| `www.hype-busters.com` | GitHub Pages | public static site |

So DNS for the private app **is already in place**. If it ever stops resolving, fix DNS / server — do not change Prolific codes for that.

## How the public quiz uses it
After screening passes on `https://www.hype-busters.com/epistemic-stance/`, JS redirects to:

`https://bwscaling.hype-busters.com/start?PROLIFIC_PID=...&STUDY_ID=...&SESSION_ID=...&screen_passed=1`

Configured in `src/js/epistemic-stance-survey.js` → `PROLIFIC_CONFIG.privateStudyBaseUrl`.

## What still must be built on BWScaling
Implement `/start` (and the annotation survey). Until that route exists, handoff will 404 even though DNS is fine.
