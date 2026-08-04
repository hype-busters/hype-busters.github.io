# Staging designs (NOT live)

Prepared in response to PI feedback (29 Jul 2026). Nothing here affects the deployed
quiz until a file is copied over its live counterpart in `../survey*.csv`.

Regenerate with: `python3 scripts/generate_staging_designs.py`

## 1. S3 near-balanced (fatigue fix)
`survey3_near_balanced.csv` — replaces the strict BIBD (63 blocks, each item seen 9×)
with a near-balanced design: **35 blocks, each item seen 5×, 56% of pairs covered,
no pair repeated.** Fully connected, so all 28 items remain rankable.

To go live: copy `survey3_near_balanced.csv` → `../survey3.csv`.

## 2. Anchor-inclusive designs (pending PI decision)
`survey{1..5}_with_anchors.csv` — each survey with its 2 designed anchors added
(1 low + 1 high), near-balanced at r=4.

| Survey | Items (with anchors) | Blocks |
|--------|----------------------|--------|
| S1 | 29 | 29 |
| S2 | 23 | 23 |
| S3 | 30 | 30 |
| S4 | 17 | 17 |
| S5 | 15 | 15 |

Note: adding 2 anchors shifts every survey to v ≡ 0 (mod 3), so a strict λ=1 BIBD is
impossible for any survey — near-balanced is the uniform choice once anchors are in.

`item_sentences_anchors.json` — grammatical sentences for the 10 anchor items; merge
into `../item_sentences.json` if anchors go live so the frontend can render them.

To go live: copy each `survey{n}_with_anchors.csv` → `../survey{n}.csv` AND merge the
anchor sentences into `../item_sentences.json`.
