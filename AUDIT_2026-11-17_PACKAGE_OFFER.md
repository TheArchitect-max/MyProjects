# Full-portfolio asking offer

The 17 November 2026 publication introduces a fixed 10% discount for acquiring all currently listed projects in a single transaction. The amount is derived from current individual asking references. The 123 projects retain their individual scope, identity and transfer conditions. Selected groups require separate quotations.

## Current calculation

| Item | EUR |
| --- | ---: |
| Combined individual asking references | 25,153,000 |
| Full-portfolio saving at 10% | 2,515,300 |
| Full-portfolio asking price | 22,637,700 |

The asking price is 90% of the combined current individual asking references, rounded once to the nearest whole euro with half-euro values rounded up. The displayed saving reconciles the individual total with that rounded package amount. EUR is authoritative. The existing catalogue rate of USD 1.1214 per EUR, dated 10 November 2026, gives an indicative USD 25,385,917 package reference. The fixed percentage is a seller pricing policy, not an independent appraisal or evidence of buyer demand.

## Implementation and scope

One policy in the pricing catalogue and one shared calculation supply the home, valuation and acquisition pages, the full-portfolio enquiry draft, the static financial review and the calculation-validation reports. The project display collection links to the offer. The acquisition FAQ and portfolio thesis explain the applicable scope. The static review generator invokes the same JavaScript calculator used by the browser. Script versions are updated in generated page shells so cached pages load the new calculator.

No individual project asking prices, other financial references, buyer dossiers, underlying project repositories, visual styles, navigation, artwork or audio are changed. The hypothetical subscription example and its qualification remain unchanged. Acquisition briefs remain local drafts and are not sent by the website.

The candidate starts from the verified main commit `32af5dbb4bb7c9c261bd1d7e022341aaaa7bc916`, incorporating PR #30's calculator-mirror correction. The publication validator now permits that already approved CI-only workflow. The workflow also runs the new full-portfolio checks.

## Validation

Local validation passed for all 13 repository validators.

- `validate_full_portfolio_offer.cjs` checks the current calculation, future price changes, aggregate rounding, invalid inputs, four offer surfaces, individual and full-portfolio enquiry paths, and upgrading a cached calculation module.
- `validate_pricing_math.cjs` and `validate_display_publication_math.cjs` verify the 123 pricing records, 492 model outputs, 984 USD conversions, and identical public calculator mirrors.
- `validate_buyer_showroom.cjs` renders 21 main pages and 123 project profiles and checks the existing interactions and filters.
- `validate_prices.py`, `validate_revaluation.py`, `validate_identities.py`, `validate_buyer_information.py` and `validate_portfolio_121.cjs` check catalogue identities, financial consistency, qualification boundaries and project publications.
- `validate_acquisition_dossier.py`, `validate_publication.py`, `validate_disclosure.py` and `validate_project_refresh.py` check disclosure boundaries, all 6,252 internal links, 123 factsheets, protected presentation files and existing non-project functions.

Browser QA of the local publication confirmed the home and valuation offer, all three EUR amounts and dated USD equivalents, the full-portfolio CTA and preselected enquiry, the generated package draft, a separate individual draft at its original price, and the static financial review alongside the existing subscription example. The website changes use the existing styles. Local validation is recorded separately from GitHub CI and does not revalidate the underlying private products.

Price-update instructions are maintained in the README. The calculation-validation reports contain the computed full-portfolio offer and hashes of the canonical calculator and pricing data.
