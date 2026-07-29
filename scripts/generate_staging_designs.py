#!/usr/bin/env python3
"""
Generate near-balanced BWS staging designs (NOT wired into the live quiz).

Outputs (in src/data/epistemic-stance/staging/):
  - survey3_near_balanced.csv        : S3 as near-balanced (r=5, 35 blocks) instead of strict BIBD (63)
  - survey{1..5}_with_anchors.csv    : each survey + 2 anchors, near-balanced (r=4)
  - item_sentences_anchors.json      : grammatical sentences for the 10 anchor items

These are prepared "ready to flip" per PI feedback (fatigue on S3; anchor question).
Nothing here changes the deployed quiz until the CSVs are copied over the live ones.
"""
import csv, json, re, random
from pathlib import Path
from itertools import combinations
from collections import Counter

random.seed(20260729)

DATA = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'epistemic-stance'
STAGE = DATA / 'staging'
STAGE.mkdir(exist_ok=True)

MEANING = {
    1: 'This research [ITEM] has important implications for X.',
    2: 'The results [ITEM] that this research has important implications for X.',
    3: 'We [ITEM] that this research has important implications for X.',
    4: 'These methods [ITEM] play an important role in X.',
    5: 'The implications of this research for X are [ITEM] important.',
}


def live_items(s):
    items = []
    with (DATA / f'survey{s}.csv').open(newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            for k in ('word1', 'word2', 'word3', 'word4'):
                w = row[k].strip()
                if w and w not in items:
                    items.append(w)
    return items


def pair_stats(blocks, items):
    pc = Counter()
    ic = Counter()
    for blk in blocks:
        for it in blk:
            ic[it] += 1
        for a, b in combinations(sorted(blk), 2):
            pc[(a, b)] += 1
    total_pairs = len(items) * (len(items) - 1) // 2
    return ic, pc, total_pairs


def build_near_balanced(items, r, k=4, restarts=400):
    """Greedy + randomized near-balanced design: each item appears exactly r times,
    no item twice in a block, pairs spread as evenly as possible."""
    v = len(items)
    assert (v * r) % k == 0, f"v*r must be divisible by k (v={v}, r={r})"
    b = v * r // k
    best = None
    best_key = None
    for _ in range(restarts):
        remaining = {it: r for it in items}
        pc = Counter()
        blocks = []
        ok = True
        for _blk in range(b):
            block = []
            for _slot in range(k):
                cands = [it for it in items if remaining[it] > 0 and it not in block]
                if not cands:
                    ok = False
                    break
                # prefer high remaining need, then low co-occurrence with current block
                def score(it):
                    cooc = sum(pc[tuple(sorted((it, x)))] for x in block)
                    return (-remaining[it], cooc, random.random())
                cands.sort(key=score)
                # small random tie window among the best few
                top = cands[:max(1, min(3, len(cands)))]
                pick = min(top, key=score)
                block.append(pick)
                remaining[pick] -= 1
            if not ok:
                break
            for a, x in combinations(sorted(block), 2):
                pc[(a, x)] += 1
            blocks.append(sorted(block))
        if not ok or any(remaining[it] != 0 for it in items):
            continue
        # objective: maximise covered pairs, then minimise imbalance
        covered = len(pc)
        imbalance = sum(c * c for c in pc.values())
        key = (-covered, imbalance)
        if best_key is None or key < best_key:
            best_key, best = key, blocks
    if best is None:
        raise RuntimeError("Failed to build near-balanced design; loosen params")
    return best


def write_csv(path, survey_num, blocks):
    stem = MEANING[survey_num]
    with path.open('w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['meaning', 'word1', 'word2', 'word3', 'word4'])
        for blk in blocks:
            b = blk[:]
            random.shuffle(b)
            w.writerow([stem] + b)


def anchor_sentences():
    import openpyxl
    root = Path(__file__).resolve().parent.parent.parent  # research/.../epistemic-stance
    wb = openpyxl.load_workbook(root / 'claim_strength_modifiers_with_anchors.xlsx', data_only=True)
    ws = wb['Claim-strength items']
    out = {}
    per_survey = {s: [] for s in range(1, 6)}
    for row in list(ws.iter_rows(values_only=True))[1:]:
        cat, sub, item, frame, role = row
        if role and 'anchor' in role.lower():
            snum = int(str(cat).strip()[0])
            sent = re.sub(r'⟦(.+?)⟧', lambda m: m.group(1).lower(), frame)
            out[item] = sent
            per_survey[snum].append(item)
    return out, per_survey


def report(name, blocks, items):
    ic, pc, total = pair_stats(blocks, items)
    rng = (min(ic.values()), max(ic.values()))
    cov = len(pc)
    print(f"  {name}: v={len(items)} blocks={len(blocks)} r_range={rng} "
          f"pairs={cov}/{total} ({cov/total*100:.0f}%) maxpair={max(pc.values())}")


def main():
    print("S3 near-balanced (no anchors):")
    s3 = live_items(3)
    s3_blocks = build_near_balanced(s3, r=5)
    write_csv(STAGE / 'survey3_near_balanced.csv', 3, s3_blocks)
    report('survey3_near_balanced', s3_blocks, s3)

    anchors_sent, per_survey = anchor_sentences()
    (STAGE / 'item_sentences_anchors.json').write_text(
        json.dumps(anchors_sent, indent=2, ensure_ascii=False))

    print("\nWith-anchors near-balanced (r=4):")
    for s in range(1, 6):
        items = live_items(s) + per_survey[s]
        blocks = build_near_balanced(items, r=4)
        write_csv(STAGE / f'survey{s}_with_anchors.csv', s, blocks)
        report(f'survey{s}_with_anchors', blocks, items)


if __name__ == '__main__':
    main()
