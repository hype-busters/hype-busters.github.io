# Epistemic Stance Survey — Cursor Agent Onboarding

**Audience:** a new Cursor agent (or engineer) taking over this project.  
**Owner intent:** document *what exists*, *why it was built that way*, and *what must happen next* — especially moving private participant data off the public hype-busters site.

**Last updated:** 6 Aug 2026  
**Live entry URL (public redirect):** https://www.hype-busters.com/epistemic-stance/  
**Actual survey host:** https://bwscaling.hype-busters.com/start  

As of Aug 2026 the public `/epistemic-stance/` page **only redirects** to the BWScaling server. Intro, practice items, demographics, and main quizzes are **not** served from the public GitHub Pages site anymore. Reference assets (CSVs, `item_sentences.json`, Apps Script source, design report) remain in this repo for the private-app builders to copy.

Related docs in this repo:
- `docs/ANALYSIS_PIPELINE_HANDOFF.md` — R scoring / reliability pipeline (post-collection)
- `epistemic-stance/experiment-design-report.html` — BWS design report for humans/PI
- `scripts/epistemic-stance-apps-script.gs` — Google Sheets writer

---

## 0. TL;DR for the next agent

1. This is a **Best-Worst Scaling (BWS)** linguistic annotation study on **claim-strength / epistemic stance** modifiers.
2. Participants arrive from **Prolific** (often via `www.hype-busters.com/epistemic-stance/`, which **immediately redirects** to the private app).
3. **All interactive survey UI runs on `bwscaling.hype-busters.com`** (Next.js). That includes intro, 5 practice/screening questions, demographics, main quizzes, and Prolific redirects.
4. The public hype-busters page must **not** collect PII or host practice/main quizzes.
5. Your primary task: **build `/start` (+ survey flow) on the BWScaling server**, using design data from this repo (`src/data/epistemic-stance/`), preserve the response schema, and keep Prolific complete vs screen-out codes distinct.

---

## 1. Research goal (why this exists)

We want to measure how strongly English words/phrases make a scientific claim sound **certain / evidenced / committed / frequent / intense**.

Example contrast:
- weak: “this research *might* have important implications…”
- strong: “this research *undeniably* has important implications…”

**Method chosen: Best-Worst Scaling (BWS / MaxDiff Case 1)**  
Why not Likert 1–7?
- People use rating scales inconsistently.
- BWS forces a comparative judgement: in each set of 4, pick **strongest** and **weakest**.
- This yields cleaner rankings with fewer judgements per item.

Items are split into **5 category surveys** so people only compare items that belong together:

| Survey | Category | Items (incl. 2 anchors) | Blocks | r (times each item seen) |
|--------|----------|------------------------:|-------:|-------------------------:|
| S1 | Likelihood / Certainty | 29 | 29 | 4 |
| S2 | Evidential Basis | 23 | 23 | 4 |
| S3 | Authorial Positioning | 30 | 30 | 4 |
| S4 | Frequency / Generality | 17 | 17 | 4 |
| S5 | Degree / Intensity | 15 | 15 | 4 |

Total: **114 items** (104 target + 10 anchors).

Design type: **near-balanced BWS** (not strict BIBD for all surveys).  
Why: strict BIBD for large item sets is fatiguing (e.g. S3 once required 63 blocks). Near-balanced keeps each item shown 4×, graph fully connected, participant burden manageable. PI explicitly preferred this for S3 fatigue reasons; anchors also make strict λ=1 BIBD impossible for all surveys (`v ≡ 0 mod 3`).

---

## 2. Critical security decision (read this carefully)

### Problem
`hype-busters.github.io` is a **public repository** deployed on GitHub Pages.

Anything in that frontend (JS, config, Apps Script URL, sheet IDs if exposed, participant payloads from the browser) is inspectable. Collecting:
- demographics (age, education, country, language, Prolific ID),
- full survey responses,

…through that public surface is a **privacy / attack-surface risk**.

### Decision
Split the product into two stages:

| Stage | Host | What happens | Contains private data? |
|-------|------|--------------|------------------------|
| **A. Public gate** | hype-busters (current site) | Intro + 5 screening/practice questions only | **No** (or minimal: maybe Prolific PID in query string only) |
| **B. Private study app** | **Separate private server / private repo** | Demographics + survey selection + main BWS quizzes + data write | **Yes** |

### Why screen on the public site at all?
- Screening questions contain **no personal data** — only task comprehension of claim strength.
- Failing screen-outs should happen *before* any private form, so ineligible people never touch the private app.
- Keeps Prolific screen-out cheap and early.

### What the private server must take over
After all 5 practice questions are answered **correctly**:
1. Demographics form (Prolific ID, age, gender, education, country, first language — **no name**)
2. Survey selection (S1–S5)
3. Main BWS quiz UI
4. Submission to Google Sheets / backend
5. Redirect to Prolific **completion** URL on success

### Handoff contract (public → private)
When screening passes, redirect to the private app with enough context to continue, e.g.:

```
https://PRIVATE_HOST/start?
  PROLIFIC_PID=...
  &SESSION_TOKEN=...   # preferred: short-lived signed token from private backend
  &passed_screen=1
```

**Do not** put secrets in the public repo.  
**Do not** leave the Google Apps Script URL / spreadsheet writable credentials only behind “security through obscurity” on the public site if the private app can own that instead.

Ideal pattern:
- Public site: static HTML/JS, screening only, redirects fail → Prolific screen-out; pass → private URL.
- Private app: owns demographics, quiz CSVs (can still be copied from this repo), Apps Script / DB writes, completion redirect.

---

## 3. Current page-by-page flow (as implemented today)

All of this currently lives under:

`epistemic-stance/index.html` + `src/js/epistemic-stance-survey.js`

Containers are shown/hidden (SPA-style). Cache-bust query on JS: currently `?v=8` (increment when JS changes).

### Page 1 — Intro (`#instructionsContainer`)
**Title:** Claim Strength Validation Survey  

**Content:** explains that participants see groups of 4 sentences differing by a highlighted word/phrase; they pick most/least strongly presented claim; focus on language, not personal agreement.

**CTA:** Continue → practice briefing.

**Why this wording:** PI/researcher-facing copy for Prolific; simpler than earlier long BWS tutorial with food/spice examples.

---

### Page 2 — Practice briefing (`#practiceBriefingContainer`)
Explains there are **5 screening/test questions**; all must be correct; failure ⇒ elimination.

**Why:** Prolific allows in-study screening if early and clearly communicated; comprehension of the BWS task is essential before paying for full surveys.

**CTA:** Start Practice Questions.

---

### Page 3–7 — Practice questions 1–5 (reuse `#questionContainer`)
Same UI as main survey: click once for strongest (black), once for weakest (grey), then Next.

**Validation rule:** on Next, **both** strongest and weakest must match the keyed answers.  
**Any wrong answer → immediate screen-out** (do not continue to later practice items).

#### Correct answers (authoritative)

| # | Strongest (most) | Weakest (least) |
|---|------------------|-----------------|
| 1 | `certain beyond any doubt` | `could only remotely` |
| 2 | `irrefutably prove` | `barely seem` |
| 3 | `declare with complete confidence` | `speculate without basis` |
| 4 | `without a single exception` | `only the rarest of cases` |
| 5 | `infinitely` | `only barely` |

These practice items intentionally use the **category anchors** (extremes) so the “right” answer is unambiguous.

**Defined in JS:** `PRACTICE_SETS` inside `epistemic-stance-survey.js`.

**On fail:** `#screenOutContainer` → redirect to Prolific screen-out URL.  
**On pass all 5:** currently → demographics (this is what must move private).

---

### Page 8 — Demographics (`#demographicsContainer`) ⚠️ PRIVATE DATA
Fields today:
- Prolific ID (auto from `?PROLIFIC_PID=`, editable if missing)
- Age, Gender, Highest education, Country, First language
- Name field exists in DOM but is **hidden** (Prolific/PII policy)

**Why no name:** Prolific discourages unnecessary PII; Prolific ID is the participant key.

**Why this must leave hype-busters:** this is personal data entered on a public site.

---

### Page 9 — Survey selection (`#surveySelectionContainer`)
Participant picks one of S1–S5 cards, then starts.

**Why participant choice (for now):** historically useful for pilots; for Prolific production you may instead **randomly assign** a survey on the private server to balance N across categories. That is an open product decision — random assignment is usually better for the experiment.

Then a small **category instructions modal** explains what that category means.

---

### Page 10+ — Main BWS questions (`#questionContainer` + intensity panel)
- Loads `src/data/epistemic-stance/survey{N}.csv` (blocks of 4 items)
- Renders each option via `item_sentences.json` as a full grammatical sentence with the item bolded
- Labels: Strongest / Weakest
- Progress bar; Previous/Next
- Must select both before Next

**Why full sentences instead of bare words:** PI feedback — bare stems were ungrammatical for adjectives vs adverbs; item-specific sentences fix grammar.

---

### Page — Ready to submit (`#completionContainer`)
Confirms all blocks done; submit button posts to Google Apps Script.

---

### Page — Success (`#successContainer`)
Shows “data saved”, then redirects to Prolific **completion** URL.

---

### Page — Screen out (`#screenOutContainer`)
Shown after failed practice; redirects to Prolific **screened out** URL.

---

## 4. Prolific integration (why and how)

### Why Prolific
Paid annotators; need reliable completion tracking and screen-out payments.

### Completion paths (current codes — update if Prolific regenerates them)

| Outcome | URL |
|---------|-----|
| **Completed** | `https://app.prolific.com/submissions/complete?cc=C1KSEYXZ` |
| **Screened out** | `https://app.prolific.com/submissions/complete?cc=CM5RS070` |

Configured in:
- `PROLIFIC_CONFIG` in `src/js/epistemic-stance-survey.js`
- fallback `<a href>` links in `epistemic-stance/index.html`

**Why two codes:** Prolific docs require separate completion paths. Using the success code for screen-outs pays full reward / wrong status. Screen-out path pays the fixed screen-out reward and does not consume a study place the same way.

**Do not** send fails “back to where they came from” without a completion code — submissions get stuck.

### Study URL query params
Prolific should open something like:

```
https://www.hype-busters.com/epistemic-stance/?PROLIFIC_PID={{%PROLIFIC_PID%}}
```

(After the split: public screening URL first; private app receives PID via redirect.)

JS reads `PROLIFIC_PID` / `prolific_pid` on load.

---

## 5. Experimental design decisions (why, condensed)

### BWS with k=4
One best + one worst implies multiple pairwise comparisons efficiently.

### Near-balanced, r=4
Each item appears 4 times per participant. Pair coverage incomplete but graph connected → still rankable.

### Anchors (2 per survey)
| Survey | Low (expect weakest) | High (expect strongest) |
|--------|----------------------|-------------------------|
| S1 | could only remotely | certain beyond any doubt |
| S2 | barely seem | irrefutably prove |
| S3 | speculate, without basis | declare with complete confidence |
| S4 | only in the rarest of cases | without a single exception |
| S5 | only barely | infinitely |

**Why anchors:**
1. Pin scale endpoints across categories  
2. Double as **in-survey attention checks** (`evaluateAnchorCheck`) — logged as Pass/Fail in the sheet  
3. Used in the **5 practice screening items**

**Item cleanup history (don’t resurrect):**
- Removed polarity issues / redundant variants earlier
- S4: removed `never`; low anchor became `only in the rarest of cases` (was `under no circumstances`)
- S5: low anchor became `only barely` (was `of zero`)

### Sample size philosophy
**Do not** use a polling/binomial N formula for BWS (PI correctly rejected this).  
Use **repeated split-half reliability** (≥ ~0.80, plateaued) — see analysis handoff.

---

## 6. Data collection backend (current)

### Apps Script
- Source of truth for sheet writing: `scripts/epistemic-stance-apps-script.gs`
- Live web app URL (in `src/config/env-config.js` under `epistemicStance.googleAppsScript.url`):
  `https://script.google.com/macros/s/AKfycbwlBKtFuGyQYs2ukj_W36e6RuZTm0sAmdJOT18ou1klNwlU-r1_8yLmAvOPKQLPjks/exec`
- Spreadsheet ID: `1NFtTKVG53mdqAwIf8-lmEewRwQ52C8yCwtI8hLryMb0`
- Tab: `Epistemic Stance Responses`

**Important:** editing the `.gs` file in git does **not** update Google’s deployment. Redeploy in Apps Script (“New version” / new deployment) when schema changes.

### Row schema (one row = one block judgement)
Key columns for analysis:
- Participant ID (UUID per session)
- Prolific ID (via Name field today / prolificId in payload — private app should store cleanly)
- Survey Number, Form ID, Block ID
- Option 1–4 (full choice set — **required** for BWS scoring)
- Most Intense / Least Intense
- Is Attention Check, Anchor Check Type, Anchor Check Result
- Demographics
- Chunk metadata if chunked submit

See `docs/ANALYSIS_PIPELINE_HANDOFF.md` for full dictionary and R pipeline.

---

## 7. Key files map

```
hype-busters.github.io/
├── epistemic-stance/
│   ├── index.html                    # UI shell + page containers
│   └── experiment-design-report.html # human-readable design report
├── src/js/
│   └── epistemic-stance-survey.js    # ALL quiz logic, practice, Prolific, submit
├── src/config/
│   ├── env-config.js                 # deployed Apps Script URL (public!)
│   └── config.example.js             # local template
├── src/data/epistemic-stance/
│   ├── survey1.csv … survey5.csv     # live BWS blocks
│   ├── item_sentences.json           # item → grammatical sentence
│   └── staging/                      # alternate designs / generator outputs
├── scripts/
│   ├── epistemic-stance-apps-script.gs
│   └── generate_staging_designs.py
└── docs/
    ├── EPISTEMIC_STANCE_ONBOARDING.md  # THIS FILE
    └── ANALYSIS_PIPELINE_HANDOFF.md
```

Local (outside public repo, project folder):
- `epistemic_stance_master_table.xlsx` — items + sentences overview
- `epistemic_stance_quiz_surveys_current.xlsx` — block workbook for PI
- `claim_strength_modifiers_with_anchors.xlsx` — original item bank

---

## 8. Current vs target architecture

### Current (everything on public site)
```
Prolific
  → hype-busters /epistemic-stance/
       Intro → Practice×5
         fail → Prolific screen-out
         pass → Demographics → Survey select → BWS quiz
              → Apps Script → Google Sheet
              → Prolific complete
```

### Target architecture (live entry = redirect)
```
Prolific
  → www.hype-busters.com/epistemic-stance/     [PUBLIC — redirect only]
       immediately → bwscaling.hype-busters.com/start
                     (+ PROLIFIC_PID / STUDY_ID / SESSION_ID)

  → bwscaling.hype-busters.com   [PRIVATE Next.js — full study]
       Intro → Practice×5
         fail → Prolific screen-out (CM5RS070)
         pass → Demographics → survey → BWS quiz
              → Apps Script / backend → Google Sheet
              → Prolific complete (C1KSEYXZ)
```

Reference design assets still in the public repo (for copying into BWScaling):
- `src/data/epistemic-stance/survey{1..5}.csv`
- `src/data/epistemic-stance/item_sentences.json`
- `src/js/epistemic-stance-survey.js` (legacy full UI — do not rely on it being live; use as porting reference)
- `scripts/epistemic-stance-apps-script.gs`

### What to copy vs rewrite
**Reuse as-is (logic/content):**
- `PRACTICE_SETS` + screen-out redirect (stay public)
- Survey CSVs + `item_sentences.json`
- BWS UI interaction (strongest/weakest selection)
- Anchor attention-check evaluation
- Sheet schema / Apps Script (move URL into private env)

**Rewrite / relocate:**
- Demographics page
- Survey selection + main quiz pages
- `saveToGoogleSheets*` submission
- Completion redirect
- Config with Apps Script URL (private env vars, not public `env-config.js`)

**Public site after migration should:**
- Still host intro + practice
- On pass: `window.location = privateStartUrl + query`
- **Not** collect demographics
- **Not** load survey CSVs for the main task (optional: can remove main-quiz code paths later)
- **Not** expose production Apps Script URL if avoidable

---

## 9. Implementation checklist for the next agent

### Phase 1 — Private app scaffold
- [ ] Create private repo / server (not public GitHub Pages)
- [ ] Port quiz UI + CSV/JSON data
- [ ] Env-based Apps Script URL / secrets
- [ ] Accept `PROLIFIC_PID` (+ signed session token if possible)
- [ ] Demographics without name
- [ ] Random survey assignment (recommended) or keep selection
- [ ] Submit → sheet → redirect `C1KSEYXZ`

### Phase 2 — Trim public hype-busters gate
- [ ] After practice pass, redirect to private app (stop calling `showDemographicsForm()`)
- [ ] Remove or dead-code demographics/main quiz on public site
- [ ] Remove production Apps Script URL from public `env-config.js` if no longer needed
- [ ] Keep practice fail → `CM5RS070`
- [ ] Bump `?v=` on JS after changes
- [ ] Smoke-test: fail practice, pass practice→private, complete→Prolific

### Phase 3 — Hardening
- [ ] Short-lived signed token so people can’t deep-link past screening
- [ ] Rate limiting / bot basic checks on private app
- [ ] Confirm Google Sheet sharing is not world-writable
- [ ] Update analysis handoff if schema fields move (e.g. explicit Prolific ID column)

---

## 10. Constraints / do-not-break list

1. **Prolific codes** — keep complete vs screen-out distinct; they change when study is republished — update both JS config and HTML fallback links + cache bust.
2. **Practice answers** — must stay unambiguous; anchored extremes.
3. **Option 1–4 must be stored** on every response row — analysis cannot reconstruct safely if block order randomizes later.
4. **Participant ID** must be stable across chunked submissions.
5. **No binomial sample-size formula** in docs/reports for BWS N.
6. **Don’t commit secrets** to the public repo.
7. **Apps Script redeploy** is manual in Google when `.gs` changes.
8. Sentence map keys must match CSV item strings exactly (incl. spaces/commas).

---

## 11. Open product decisions (ask owner if unclear)

1. Random survey assignment vs participant choice (lean random for balance).
2. Whether anchors are included in final published rankings or used only for calibration/attention (analysis handoff flags this).
3. Private host choice (university server, Fly.io, Railway, private VPS, etc.).
4. Whether screening pass should mint a **signed token** (strongly recommended) vs bare query flag `passed_screen=1` (forgeable).
5. Whether to keep Google Sheets or move to a proper DB on the private server.

---

## 12. Suggested first prompt for the implementing agent

> Read `docs/EPISTEMIC_STANCE_ONBOARDING.md` and `docs/DNS_BWSCALING.md`. The public `/epistemic-stance/` URL only redirects to `https://bwscaling.hype-busters.com/start`. Build the full study on BWScaling: intro, 5 practice screening questions (fail → Prolific `CM5RS070`), demographics, BWS quizzes from the CSVs in this repo, Apps Script submission, success → Prolific `C1KSEYXZ`. Preserve the response schema (Participant ID, Options 1–4, Most/Least, anchor checks). Do not put secrets or PII forms on the public GitHub Pages site.

---

## 13. Quick verification commands

```bash
# Confirm Prolific URLs in JS
rg "completeUrl|screenOutUrl" src/js/epistemic-stance-survey.js

# Confirm deleted items are gone from live data
rg -n "of zero|under no circumstances|,never," src/data/epistemic-stance/

# Count blocks
wc -l src/data/epistemic-stance/survey*.csv
```

---

*End of onboarding document. Prefer updating this file when architecture or Prolific codes change.*
