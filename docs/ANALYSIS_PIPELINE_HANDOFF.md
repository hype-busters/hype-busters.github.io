# Epistemic Stance Survey — Analysis Pipeline Handoff

**Audience:** the agent/engineer setting up the R analysis pipeline on a separate server.
**Goal:** turn the raw Best-Worst Scaling (BWS) responses collected by the web survey into
validated, per-item "epistemic stance strength" scores per category, with reliability
checks, in a re-runnable/automatable pipeline.

**Last updated:** 30 Jul 2026. Maintained by the data-collection side (web app + Google Sheet).

---

## 0. TL;DR — where to start

1. Read §1–§3 to understand the experiment and the data schema.
2. Pull the data (§4). Quickest path with no auth:
   `https://docs.google.com/spreadsheets/d/1NFtTKVG53mdqAwIf8-lmEewRwQ52C8yCwtI8hLryMb0/gviz/tq?tqx=out:csv&sheet=Epistemic%20Stance%20Responses`
3. Run the quick-start R script in §6 (ingest → filter by anchor checks → B−W scores →
   split-half reliability). That reproduces the core deliverable.
4. Extend with model-based ranking and covariate analysis (§7).
5. Wire up scheduling/automation (§8).

**One row in the sheet = one block (one 4-item question) judged by one participant.**
Every row is self-describing: it contains the 4 items shown *and* which was picked best/worst,
so you never need to join back to design files.

---

## 1. Experiment context

We measure how strongly English words/phrases signal an **epistemic stance** — how certain,
evidence-based, or committed a claim sounds (e.g. "this *proves*" ≫ "this *might suggest*").

- Method: **Best-Worst Scaling (BWS), Case 1 / object-case MaxDiff.** Each question ("block")
  shows **4 sentences** differing only by the stance word; the participant picks the
  **strongest** and the **weakest**.
- Items are split into **5 surveys**, one per stance category, so participants only compare
  words that belong together.
- Rendered as full grammatical sentences (the target word highlighted), not bare words.

### The 5 surveys

| Survey | Category | Target items | + Anchors | Total items | Blocks | Item seen/person (r) |
|--------|----------|-------------:|----------:|------------:|-------:|---------------------:|
| S1 | Likelihood / Certainty  | 27 | 2 | 29 | 29 | 4 |
| S2 | Evidential Basis        | 21 | 2 | 23 | 23 | 4 |
| S3 | Authorial Positioning   | 28 | 2 | 30 | 30 | 4 |
| S4 | Frequency / Generality  | 15 | 2 | 17 | 17 | 4 |
| S5 | Degree / Intensity      | 13 | 2 | 15 | 15 | 4 |

Total distinct items across the study: **114** (104 target + 10 anchor).

---

## 2. Design details that affect analysis

- **Block size k = 4; replication r = 4** (each item appears in 4 blocks per participant).
- **Near-balanced design (not strict BIBD).** Not every pair of items is compared directly,
  but the co-occurrence graph is **fully connected** in every survey, so all items are
  rankable (directly or through indirect chains). Pair coverage ranges ~41–80% by survey.
  → Prefer estimators that handle incomplete designs (counting scores, Bradley-Terry,
  Plackett-Luce, conditional logit) — all fine here.
- **Anchors.** Each survey has **2 anchor items** (one extreme-low, one extreme-high). They
  (a) pin the ends of each latent scale for cross-category comparison, and (b) double as
  **attention checks** (see §5). Anchor items per survey:

  | Survey | Low anchor (should be picked *weakest*) | High anchor (should be picked *strongest*) |
  |--------|------------------------------------------|--------------------------------------------|
  | S1 | `could only remotely` | `certain beyond any doubt` |
  | S2 | `barely seem` | `irrefutably prove` |
  | S3 | `speculate, without basis` | `declare with complete confidence` |
  | S4 | `only in the rarest of cases` | `without a single exception` |
  | S5 | `only barely` | `infinitely` |

- **Sample size is NOT fixed by a formula.** BWS scores are relational and repeated
  appearances within a participant are not independent, so a binomial/polling formula is
  invalid. Instead: collect a modest sample, then **grow until repeated split-half
  reliability plateaus (target ≥ 0.80).** Implementing that check is a core pipeline job (§6/§7).

Reference docs (in this repo / project):
- Design report (rendered): `https://www.hype-busters.com/epistemic-stance/experiment-design-report.html`
  (source: `epistemic-stance/experiment-design-report.html`)
- Design CSVs (the exact blocks shown): `src/data/epistemic-stance/survey{1..5}.csv`
- Item→sentence map: `src/data/epistemic-stance/item_sentences.json`
- Master item table (items · category · role · sentence): `epistemic_stance_master_table.xlsx`
  (in the project root, one level above this repo)

---

## 3. How data is produced (context, no action needed)

Web app (GitHub Pages) → participant completes a survey → responses POSTed to a Google
Apps Script web app → Apps Script appends rows to the Google Sheet. The pipeline only ever
**reads** the Sheet; it does not touch the web app.

- Spreadsheet ID: `1NFtTKVG53mdqAwIf8-lmEewRwQ52C8yCwtI8hLryMb0`
- Tab name: `Epistemic Stance Responses`
- Apps Script source (for reference): `scripts/epistemic-stance-apps-script.gs`

---

## 4. Accessing the data

### Option A — public CSV export (fastest, no credentials)
The sheet is currently readable via Google's gviz CSV endpoint:

```
https://docs.google.com/spreadsheets/d/1NFtTKVG53mdqAwIf8-lmEewRwQ52C8yCwtI8hLryMb0/gviz/tq?tqx=out:csv&sheet=Epistemic%20Stance%20Responses
```

Good for getting started. In R: `readr::read_csv(<url>)`.

### Option B — authenticated read (recommended for production)
Use a **Google service account** with read access to the sheet and the `googlesheets4` R
package (`gs4_auth(path = "service-account.json")`, then `read_sheet()`), or the Sheets API.
More robust to sharing changes and rate limits, and required if the sheet is made private.

> ⚠️ **Privacy note:** the sheet contains a free-text `Name` field and demographics. The
> gviz export is world-readable. Recommend either (a) dropping/ignoring `Name` in the
> pipeline and treating `Participant ID` as the key, and/or (b) locking the sheet down and
> switching to Option B. Do not republish raw rows with `Name`.

---

## 5. Data schema (data dictionary)

27 columns. One row = one block judged by one participant.

| # | Column | Type | Notes / use |
|---|--------|------|-------------|
| 1 | Timestamp | ISO datetime | Per **submission chunk**, not per participant. Do not use to group a participant. |
| 2 | Study | string | Always `epistemic-stance`. |
| 3 | Method | string | `bws_maxdiff`. |
| 4 | Response Format Version | string | Schema version tag. |
| 5 | Survey Number | 1–5 | The category (see §1). Primary grouping for scoring. |
| 6 | Form ID | string | e.g. `S5-BIBD` / form variant. |
| 7 | Block ID | string | e.g. `S5-B1`. Positional block id (not needed for scoring since options are stored). |
| 8 | Name | string | **PII, unreliable.** Do NOT use as participant key. |
| 9 | Age | string/int | Demographic covariate. |
| 10 | Gender | string | Demographic covariate. |
| 11 | Highest Education | string | Demographic covariate. |
| 12 | Country | string | Demographic covariate. |
| 13 | First Language | string | Demographic covariate (key for L1 effects). |
| 14 | Question # | int | Presentation order within the participant's run (for order effects). |
| 15 | Meaning | string | The sentence stem with `[ITEM]` placeholder (context only). |
| 16 | **Most Intense** | string | The item the participant picked as **strongest** (the "best"). |
| 17 | **Least Intense** | string | The item picked as **weakest** (the "worst"). |
| 18 | Is Attention Check | Yes/No | `Yes` if the block contained an anchor. |
| 19 | Chunk Number | int/"" | Submission chunking metadata. |
| 20 | Total Chunks | int/"" | Submission chunking metadata. |
| 21 | Anchor Check Type | high/low/both/"" | Which anchor(s) were in the block ("" if none). |
| 22 | **Anchor Check Result** | Pass/Fail/"" | Pass = anchor placed at its expected extreme. Blank if not an anchor block. |
| 23 | **Participant ID** | UUID | **The stable per-participant key.** Use this for grouping/dedup. |
| 24 | **Option 1** | string | Item shown in slot 1 of the block. |
| 25 | **Option 2** | string | Item shown in slot 2. |
| 26 | **Option 3** | string | Item shown in slot 3. |
| 27 | **Option 4** | string | Item shown in slot 4. |

**Minimum fields for scoring:** `Participant ID`, `Survey Number`, `Option 1–4`,
`Most Intense`, `Least Intense`. Everything else is filtering or covariates.

**Definition of an anchor check pass:** for a block containing the high anchor, the
participant should choose it as *Most Intense*; for the low anchor, as *Least Intense*.
`Anchor Check Result` already encodes this (computed client-side), but you can recompute it
from `Option 1–4` + `Most/Least Intense` + the anchor list in §2 as a cross-check.

---

## 6. Quick-start R pipeline (core deliverable)

Reproduces: ingest → exclude test/failed participants → B−W scores per category →
split-half reliability. Uses base tidyverse + a manual (dependency-light) scorer.

```r
# ---- setup ------------------------------------------------------------------
# install.packages(c("tidyverse", "janitor"))
library(tidyverse); library(janitor)

SHEET_ID <- "1NFtTKVG53mdqAwIf8-lmEewRwQ52C8yCwtI8hLryMb0"
TAB      <- "Epistemic Stance Responses"
URL      <- sprintf(
  "https://docs.google.com/spreadsheets/d/%s/gviz/tq?tqx=out:csv&sheet=%s",
  SHEET_ID, URLencode(TAB))

raw <- readr::read_csv(URL, show_col_types = FALSE) |> clean_names()
# key columns after clean_names(): participant_id, survey_number, most_intense,
# least_intense, option_1..option_4, anchor_check_result, name, first_language, ...

# ---- 1. drop test rows ------------------------------------------------------
dat <- raw |> filter(!str_starts(coalesce(name, ""), "__DEPLOY_TEST"))

# ---- 2. participant quality filter (anchor checks) --------------------------
ANCHOR_MIN_PASS <- 0.80   # tune with the PI
quality <- dat |>
  filter(anchor_check_result %in% c("Pass", "Fail")) |>
  group_by(participant_id) |>
  summarise(n_checks = n(),
            pass_rate = mean(anchor_check_result == "Pass"),
            .groups = "drop")
good_ids <- quality |> filter(pass_rate >= ANCHOR_MIN_PASS) |> pull(participant_id)
clean <- dat |> filter(participant_id %in% good_ids)

# ---- 3. Best-Worst counting scores per survey -------------------------------
score_bw <- function(df) {
  df |>
    select(participant_id, survey_number, most_intense, least_intense,
           option_1, option_2, option_3, option_4) |>
    pivot_longer(starts_with("option_"), values_to = "item", names_to = NULL) |>
    mutate(is_best  = item == most_intense,
           is_worst = item == least_intense) |>
    group_by(survey_number, item) |>
    summarise(shown = n(),
              best  = sum(is_best),
              worst = sum(is_worst),
              bw    = (best - worst) / shown,          # −1 … +1 strength
              .groups = "drop") |>
    arrange(survey_number, desc(bw))
}
scores <- score_bw(clean)
print(scores, n = 200)

# ---- 4. repeated split-half reliability (the stopping rule) -----------------
spearman_brown <- function(r) 2 * r / (1 + r)
split_half <- function(df, n_splits = 1000, seed = 1) {
  set.seed(seed)
  survs <- sort(unique(df$survey_number))
  map_dfr(survs, function(s) {
    d <- df |> filter(survey_number == s)
    pids <- unique(d$participant_id)
    if (length(pids) < 4) return(tibble(survey_number = s, reliability = NA_real_))
    rs <- replicate(n_splits, {
      g  <- sample(pids)
      h1 <- g[seq(1, length(g), 2)]; h2 <- setdiff(g, h1)
      s1 <- score_bw(d |> filter(participant_id %in% h1)) |> select(item, bw1 = bw)
      s2 <- score_bw(d |> filter(participant_id %in% h2)) |> select(item, bw2 = bw)
      j  <- inner_join(s1, s2, by = "item")
      suppressWarnings(cor(j$bw1, j$bw2, method = "spearman"))
    })
    tibble(survey_number = s, reliability = mean(spearman_brown(rs), na.rm = TRUE))
  })
}
reliability <- split_half(clean)
print(reliability)          # target ≥ 0.80 and plateaued → stop recruiting that survey
```

**Interpretation / stopping rule:** recompute `reliability` as more participants arrive;
when a survey is ≥ 0.80 and the last increment barely moved it, stop paying for that survey.

---

## 7. Extensions (model-based, recommended next)

These add proper uncertainty and let you *explain* strength with covariates. Linguists
generally prefer R for all of this.

### 7a. Ranked estimates with confidence intervals
- **`PlackettLuce`** — each block is a partial ranking `best > {two middles, tied} > worst`.
  Build one ranking per block (rank vector over the 4 options: best=1, middles=2, worst=3),
  fit `PlackettLuce()`, get item "worths" + quasi-SE via `qvcalc`. Natural fit for BWS.
- **`BradleyTerry2`** — expand each block into pairwise wins (best beats the other 3; the
  other 3 beat worst → 5 pairs/block), aggregate to win/loss counts, fit `BTm()`.
  Add item-level predictors (word class adj/adv, subcategory, corpus frequency) to model
  *why* items differ.
- **Conditional / rank-ordered logit** — `survival::clogit`, `mlogit`, or `apollo`.

### 7b. Respondent heterogeneity (do L1 / education move perceptions?)
- Mixed / random-parameter logit: `mlogit` (rpar), `gmnl`, `apollo`.
- Hierarchical Bayes MaxDiff: `ChoiceModelR`, `bayesm`, `RSGHB` (per-respondent utilities).
- `brms` — Bayesian, flexible (Bradley-Terry/ordinal/rank), random effects for participant
  and item; pair with `emmeans` / `marginaleffects` for contrasts.
- Thurstonian IRT for forced-choice/MaxDiff: `thurstonianIRT`.

### 7c. Cross-category comparability via anchors
Rescale each survey's scores so its low/high anchors map to a common range (e.g. 0–1), then
categories become comparable. Also report anchor separation as a validity check (a healthy
scale puts the two anchors at the extremes).

### 7d. Reliability tooling (alternatives to the manual code in §6)
`psych` (splitHalf, ICC), `splithalf`, `irr`, `boot` (bootstrap CIs on scores).

---

## 8. Automation & repo structure

Suggested project layout on the analysis server:

```
epistemic-stance-analysis/
├── R/
│   ├── 01_ingest.R          # pull sheet, clean_names, drop test rows
│   ├── 02_filter.R          # anchor-pass filtering, dedup by participant_id
│   ├── 03_score.R           # B−W counts + PlackettLuce/BradleyTerry2
│   ├── 04_reliability.R     # repeated split-half, plateau check
│   ├── 05_models.R          # mixed/HB models, covariates (optional)
│   └── 06_report.R          # tables + ggplot forest plots per category
├── data/                    # cached raw pulls (gitignored)
├── outputs/                 # scores.csv, reliability.csv, figures/
├── renv.lock                # pin package versions (use renv)
└── run_all.R                # or use {targets} for a DAG pipeline
```

- Pin dependencies with **`renv`** for reproducibility.
- Orchestrate with a plain `run_all.R` or, better, the **`targets`** package (skips
  unchanged steps; ideal for "re-run when new data arrives").
- Schedule with cron / systemd timer / CI (e.g. run daily; append reliability to a log so
  you can watch the plateau over time).
- Emit a small `reliability_log.csv` (date, survey, n_participants, reliability) — this is
  the artifact that drives the recruitment stop/continue decision.

---

## 9. Gotchas & assumptions (read before trusting numbers)

- **Group by `Participant ID`, never `Name` or `Timestamp`.** Chunked submissions split one
  participant across multiple timestamps; `Name` is optional free text.
- **Exclude test rows**: `Name` starts with `__DEPLOY_TEST` (there are a handful from
  deployment testing — delete them from the sheet when convenient, but the filter also
  handles them).
- **Anchors are regular items in the rotation** (each appears r=4 times → ~7–8 anchor-check
  blocks per participant per survey). Decide with the PI whether anchors are (a) included in
  the reported scale or (b) used only for anchoring/attention and excluded from the final
  item ranking. Both are defensible; be explicit.
- **Polarity items:** some target words are negative (e.g. `unlikely`, `never`, `doubtful`).
  BWS handles this fine (they land at the weak end), but sanity-check that anchors sit at the
  extremes and negatives rank below neutral items.
- **Near-balanced ≠ all pairs compared.** Don't use estimators that assume a complete design.
- **`Question #` = presentation order** (currently block order is fixed, not randomised). If
  the web team later randomises order, nothing breaks because options are stored per row.
- **Reliability is the sample-size criterion**, not a precomputed N.

---

## 10. Open items / contacts

- Confirm with PI: anchor-pass threshold (default 0.80 here) and whether anchors are in or
  out of the final reported ranking.
- Decide auth model for production (public gviz vs service account) given the PII note.
- Optional web-side addition (ask data-collection side): per-block response time, useful as
  an extra speeder/quality flag — not currently captured.
```
