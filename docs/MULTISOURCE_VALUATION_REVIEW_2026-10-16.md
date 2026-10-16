# Complete project and financial-reference review - 16 October 2026

All 105 independent projects have a new documentary and financial-reference decision. Each decision links the frozen current main documentation, separately described development, retained qualification and transfer conditions, original financial-reference date and disclosed cost evidence. The two publication repositories are excluded from asset values.

The seller asking total remains **EUR 24,501,500**. The retained recreation anchors total **EUR 104,385,000**. All individual asks, negotiation ranges, cost anchors, stages and internal model factors are unchanged. No price increase is inferred from version numbers, test counts, file counts or an external hourly-rate survey. Current documentation does not automatically expand the older priced delivery scope.

## Cost evidence and the review decision

| Disclosed evidence in the current methodology register | Projects | Interpretation |
| --- | ---: | --- |
| Base/increment assumptions reconcile to the retained anchor | 8 | Arithmetic coverage; estimated effort and original delivery scope remain unverified seller assumptions |
| Partial work-package assumptions | 6 | Some cost components are visible; the full retained anchor is not reconstructed |
| Legacy cost reference without a complete work budget | 91 | Low-confidence reference; reconstruct a delivery-specific budget before reliance |

Fourteen projects have some disclosed work-package assumptions. No missing effort estimate is reverse-engineered from the published price. A matching budget total does not establish logged hours, actual expenditure, a contractor quotation or independent value.

All 105 decisions retain the existing seller reference pending a delivery-specific re-estimate. This is a complete review of the disclosed references and their limitations, not 105 newly established market appraisals. Comparable-sale valuation, project-income valuation and independent appraisal remain **NOT_ESTABLISHED** for every project. This means they are not established by this reviewed evidence; it does not assert that the projects have no potential economic value.

## Multiple sources and their roles

| Source | Checked evidence | Applied role and limit |
| --- | --- | --- |
| Current repository documentation | 105 frozen main README records and separately retained development records; exact commit and README blob recorded per project | Described scope and version boundaries; no new product test execution |
| Existing qualification and transfer registers | Project-specific grades and open conditions | Retained evidence only; a newer README does not close a transfer gate |
| Seller methodology and commercial register | Per-project amounts and available dated work-package assumptions | Seller reference, with missing budgets and source-head gaps disclosed |
| [WIPO cost-method guidance](https://www.wipo.int/web-publications/intellectual-property-valuation-basics-for-technology-transfer-professionals/en/4-the-cost-method.html) | Primary page retrieved 16 October | Method context; cost and buyer value can differ. Supplies no project price or discount |
| [Knab 2026 developer-rate survey](https://bieb.knab.nl/ondernemen/wat-verdient-een-software-developer-zzp-bekijk-uurtarief-en-winst) | Primary page retrieved 16 October; publisher update 1 July 2026; mean EUR 94/hour excluding VAT | Dutch rate context. The broader survey's 20,000-plus respondents are not all developers. Does not validate selected specialist premiums or project effort |
| [Upwork software-developer category](https://www.upwork.com/hire/software-developers/) | Primary-publisher search result reports USD 10-100/hour; category and cost pages returned HTTP 403 | Limited global rate context. Prior expert-tier detail was not freshly verified and supplies no new premium |
| [ECB USD reference table](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html) | Latest published observation at review: 15 October, EUR 1 = USD 1.1208; no 16 October observation present | Indicative USD display conversion only; EUR remains authoritative |

Retained role assumptions are EUR 18,000 senior, EUR 22,000 specialist and EUR 16,000 validation/provenance per assumed 160-hour month. They imply EUR 112.50, EUR 137.50 and EUR 100/hour, all above the Knab mean. The separate 15% coordination/tooling allowance, effort allocations, rounding and asking discounts remain analyst choices.

The marketability, monetization and strategic figures use the same recreation-cost anchor. Their weighted blend is a correlated internal scenario, not independent triangulation, a comparable-sale approach or a project cash-flow valuation. Existing JSON calculation keys remain stable; public labels and definitions now state these boundaries directly.

## Website changes

- Each project profile has one project-display link in its main actions. The repeated profile-detail link is removed.
- The homepage retains the collection entry point and existing selected projects. The second set of featured project-display cards is removed.
- The display collection has one destination link for each of the 105 project cards, instead of two identical links.
- The display loader rejects duplicate project references and canonical display URLs, as well as mismatched project identities.
- All 105 displays, editable briefs and two-page factsheets include their individual financial-reference review. The source register retains separate product, financial and qualification dates.
- The five legacy profile routes, five legacy display routes and legacy download paths remain available. TA-IP-083 and TA-IP-096 remain distinct assets.

## Reproducible records and verification

The complete machine-readable review is [valuation-sources.json](../assets/valuation-sources.json). The 105-row [review CSV](../assets/valuation-review.csv) supports comparison. The [valuation register](../assets/valuation-register.json) contains the unchanged individual amounts. Existing SHA-256 public fingerprints cover the review register and CSV.

Run `tools/refresh_publication.py`, `tools/validate_catalogue.py`, `tools/validate_rendering.cjs` and `tools/validate_public_sites.cjs` in MyProjects. The maintained Projects-Displays checkout provides `tools/validate.py ../MyProjects`. Rendering checks execute the actual data loader and generators; decorator checks exercise repeated insertion with a controlled DOM fixture. They are distinct from live-browser checks. All factsheets must remain two pages, with representative rendered pages visually inspected. Product suites were not executed in this review.

This update uses the existing static GitHub Pages publication and adds no custom workflow or application runtime.

## Final source-head recheck

All 105 default branches were rechecked before publication: 104 were unchanged and SPUF had one evidence/documentation-only commit. Its retained v1.23.0 Colab record reports canonical 253/253 and independent unittest-discovery 253/253 passes at frozen code `32073ef1c45b490e0669acb995f20e891601ddc8`. The updated publication head is `e758cb4680041b8b0b9cf313299d21cea90628dc`. The README blob is unchanged. This website review did not execute those product tests, and no price or readiness grade changes on that basis.
