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

## How the public quiz entry works
`https://www.hype-busters.com/epistemic-stance/` is a **redirect-only** page. It immediately sends participants to:

`https://bwscaling.hype-busters.com/start?PROLIFIC_PID=...&STUDY_ID=...&SESSION_ID=...`

(forwarding Prolific query params when present).

**All survey UI** (intro, practice screening, demographics, BWS quizzes, Prolific completion/screen-out) lives on the BWScaling server — not on the public GitHub Pages site.

## What must be built on BWScaling
Implement `/start` (and the full annotation survey). Until that route exists, the redirect will 404 even though DNS is fine.
