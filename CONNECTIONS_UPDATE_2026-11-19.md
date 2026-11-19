# Connections: reviewed workflow routes and shared asset membership

The previous Connections model allowed each asset in only one workflow and combined several unrelated routes. The update supports multiple relevant routes per independent asset, makes source-review limits and proposed handoffs visible, and counts shared assets once in the visible-route financial summary.

## Verified source and scope

- Previous website main: `34378bdffd921e33a2b40bf574fcfda64594774c`.
- Accepted website implementation: `add704f2f6105cb86ff2f7c7aa13eb03322d2e5f`.
- Tested local and verified GitHub tree: `b8a3026c636b49f7b3668142fc1c25c3ccfa0e5c`.
- Source review date: 19 November 2026. The supporting research inspected all 128 source-repository main references, READMEs and open-PR metadata, with selected architecture/contract/code inspection. The twelve key source heads were checked again before implementation and were unchanged.
- This acceptance covers the public website. Underlying product runtimes and cross-project end-to-end operation were not executed or newly qualified.

## Published route changes

There are **37 proposed routes**, **84 distinct participating assets** and **87 memberships**. Three assets appear in two routes: SPUF, QUBO and Operations. Every asset retains its own identity, scope, rights and individual financial references.

| Route | Result |
|---|---|
| TA-CN-015 | Focused on songwriting and editorial media production. Manuscript assurance has a separate relevant route. |
| TA-CN-022 | Focused on bioacoustic signal preparation and review. Its existing URL is retained. |
| TA-CN-029 | Marked **Redesign required**; a preregistered experiment must justify the proposed observation/perception relationship. |
| TA-CN-034 | Separate radioastronomy signal-preparation and validation proposal: TA-IP-016 + TA-IP-072. |
| TA-CN-035 | Operations planning and QUBO candidate search: TA-IP-102 + TA-IP-075. |
| TA-CN-036 | Approved narrative text to manuscript assurance: TA-IP-108 + TA-IP-105. |
| TA-CN-037 | Property inventory and recorded-state lineage: TA-IP-106 + TA-IP-124, on **Research hold** pending the relevant customer/format research gate. |

All existing routes received an individual source-review decision and a directed proposed artifact/acceptance description. Current route stages: 16 **Qualification required**, 17 **Research proposal**, 3 **Research hold** and 1 **Redesign required**. None is presented as a jointly accepted runtime integration.

The Visual Effects & Spatial Computing Platform (TA-IP-107) remains excluded under its standalone-project requirement.

## Website behavior

- Search includes source-review findings and handoff requirements. A qualification-stage filter complements the existing application and asset filters.
- The visible-route summary deduplicates asset references before summing each financial field. Individual route totals remain member-reference sums; they do not price integration work or establish a combined-product quote.
- Project profiles and strategic navigation show all relevant routes. The existing primary strategic reference remains valid independently of array order.
- Connection contexts in 84 standalone project displays were updated, including removal of stale manuscript/radioastronomy memberships. Their other sections were verified unchanged.
- Existing stylesheet, artwork, music and contribution behavior are preserved. The small added stylesheet applies only to the Connections page.
- All existing project data, price records, PDFs and product briefs were verified byte-for-byte unchanged. Portfolio asking references remain EUR 25,866,000; the existing 10% full-portfolio offer remains EUR 23,279,400.
- Catalogue page-shell changes only refresh the shared script cache key, plus the Connections-only stylesheet on that page.

## Versioned rollout

The current interface and publication generator read `assets/application-combinations-v2.json` with schema `public-application-combinations-2`. The previous `assets/application-combinations.json` is intentionally unchanged so already cached v40 bundles can still load their 33-route data while current pages load the new v41 bundle and 37-route records.

Both versions use the same existing asset identities and prices. The legacy endpoint is a compatibility snapshot, not another active acquisition catalogue or another set of assets.

## Validation evidence

**15/15 required local publication controls PASS**, after fixes and before updating main:

- `node tools/validate_buyer_showroom.cjs`
- `python3 tools/validate_buyer_information.py`
- `python3 tools/validate_publication.py`
- `python3 tools/validate_disclosure.py`
- `node tools/validate_pricing_math.cjs`
- `node tools/validate_display_publication_math.cjs`
- `node tools/validate_full_portfolio_offer.cjs`
- `python3 tools/validate_prices.py`
- `node tools/validate_portfolio_121.cjs`
- `python3 tools/validate_project_refresh.py`
- `python3 tools/validate_identities.py`
- `python3 tools/validate_revaluation.py`
- `python3 tools/validate_price_continuity.py`
- `python3 tools/validate_removed_asset.py`
- `python3 tools/validate_acquisition_dossier.py`

The showroom checks render 128 project profiles and 21 main page functions. New checks cover overlapping totals across all eight financial fields, stage/search filtering, actual filter event binding and empty/reset state, complete project/strategic route links, twelve invalid-schema cases, order-independent primary references and the previous cached bundle loading its unchanged endpoint.

The display-refresh check compares every standalone project's actual connection links with its expected v2 membership. Additional byte-comparison guards verified that only the connection blocks changed in the 84 standalone displays and that all pre-existing project/financial records and downloadable documents were preserved.

Main was advanced without force, with an expected-head SHA guard, and its commit/tree and zero open PRs were then verified. This document and the README update follow that verified implementation step.

## Live publication verification

All **247 checked live paths matched the expected Git blob bytes**: the 244 implementation paths plus the unchanged legacy connection, project and pricing records. The live data reports 37 routes and 84 distinct participating assets.

Live browser checks confirmed:

- QUBO filtering shows TA-CN-032 and TA-CN-035; their shared asset is counted once, giving three distinct assets and EUR 283,500 of individual asking references.
- Selecting Research hold with QUBO produces an explicit empty result and zero totals; clearing the asset filter reveals the three held routes.
- Narrative search returns TA-CN-036 and its acceptance disclosure opens with the source-revision and MIPP-gate conditions.
- The live MIPP project profile links to TA-CN-036 rather than the former broad media route.
- The new TA-CN-035 planning proposal and both directed handoffs are visible. No horizontal document overflow was observed at the inspected 1348-pixel viewport.

These are website/data-delivery checks. They do not execute or accept the proposed underlying integrations.

