# Auditing several pages or viewports

How to grade when the audit covers more than one page, more than one viewport, or both. The laws, the rubric (§4), the statuses and the score formula (§2) are unchanged. This file only says how they combine.

## Contents
- [1. Plan the coverage](#1-plan-the-coverage)
- [2. Classify per template](#2-classify-per-template)
- [3. Combine evidence within a template](#3-combine-evidence-within-a-template)
- [4. Re-audit closure](#4-re-audit-closure)
- [5. Report](#5-report)

## 1. Plan the coverage
1. List the routes in scope (sitemap, router, built files or the user's list).
2. Group them by **template**, meaning pages built from the same layout and components: for example "product detail", "listing", "article", "checkout step".
3. Choose the pages to measure: at least one per template, plus every page the user named, plus any page that differs visibly from its template (an extra component, a missing section).
4. Choose the viewports: the default set in [page-probe.md](page-probe.md), or the user's.
5. Write the **coverage matrix** before measuring: pages × viewports, each cell planned. During the audit, mark each cell with the evidence it actually has: *measured* (probe on a live page), *screenshot only*, *read in source only*, or *no evidence*, with a reason.

## 2. Classify per template
- Each template gets its **own surface type** from the §3 matrix and its **own 20-row table**. A site with marketing pages, documentation and a checkout produces three tables. Never blend them into one column.
- A page whose job differs from its template (a landing page built on the article layout) is classified by its job and gets its own table.
- The user's tasks decide which template holds the task-critical path for the §2 blocking rule.

## 3. Combine evidence within a template
- **Occurrences that count.** An occurrence (page × viewport) counts for a row when its evidence can show that law, by the §1 table. A probe measurement, a screenshot or the source all qualify for what each can show. For example, an untyped Cancel button in the source is law 3 evidence even with no live page. A hit-area size, though, needs a live measurement or a labelled static estimate (§6).
- **Status.** A row's status is the **worst** status observed on any counted occurrence: Fail before Warning before Pass. A Pass on one occurrence never cancels a Warning or Fail on another, so a desktop Pass never closes or hides a mobile finding.
- **Citations.** Each Fail or Warning lists every occurrence where it was observed. For example: "law 2 Warning, breadcrumb link 66×19: /projects/a/ @375, /projects/b/ @375".
- **Contextual triggers (§3).** A trigger counts as present if it appears on **any** page of the template. N/A requires evidence that it is absent from **all** covered pages. If coverage can't show that, the row is Not assessed.
- **Gaps.** Two kinds are listed separately in the matrix: a **live-measurement gap** (a cell with source or screenshots but no probe run) and an **evidence gap** (a cell with nothing). A row that passes is written "Pass (evidence: …; gaps: …)". A row is Not assessed only when **no** available evidence of any kind supports a grade for it, and it names the evidence needed.
- **Score.** Compute the §2 score **per template**, from that template's rows. There is no site-wide score.

## 4. Re-audit closure
A Fail or Warning closes only when there is post-fix evidence, of a kind that can show that law, for **every** occurrence it cited. Report each change as "row: before → after", with the new evidence per occurrence. An occurrence that wasn't checked again stays open.

## 5. Report
- One §8 report per template, each with its surface type, score, band and conformance notes.
- The coverage matrix, with its gaps.
- A short site summary: the per-template scores and bands side by side. **Never** "the site passes", and never a site-wide score or band.
- The §8 scope line names exactly the pages × viewports covered, and the kind of evidence each had.
