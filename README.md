# THEARCHITECT_MAX — Software IP acquisition showroom

A public buyer catalogue for 108 independently scoped software and research assets, organised by application and potential acquirer. Each project provides a product overview, buyer fit, documented functions and outputs, current offered scope, seller asking reference, factsheet and product brief.

The approved public datasets are `assets/buyer-catalogue.json` and `assets/pricing-catalogue.json`. Publish the approved buyer information, all eight monetary references, the conditional maturity reference, cost assumptions and attributed contextual sources. Retain the established EUR amounts unless the seller explicitly requests repricing. Do not remove financial references when simplifying the presentation. Personal information, private accounts, credentials and internal audit records remain excluded. Detailed transaction diligence is handled through a separate agreed review process.

Maintain established project references and reference names. Asset descriptions and asking references must be explicitly reviewed before changes are published. Preserve the existing visual assets and music controls.

The website is an informational exhibition. It completes no purchase, payment or transfer of rights.

© 2026 THEARCHITECT_MAX. First-party rights reserved.

USD amounts accompany EUR acquisition and recreation references. Preserve the dated ECB conversion, exact whole-USD rounding and all existing EUR prices. The public pricing dataset includes the original model inputs. `assets/pricing-math.js` recomputes the scenarios, USD amounts, cost budgets, conditional references and totals; `tools/build_calculation_check.cjs` produces `assets/calculation-validation.json` from the approved public files. These arithmetic checks do not certify product quality, market value or the underlying assumptions.

## Buyer product and acquisition information

The public catalogue includes all 108 asset identities and financial references. `assets/buyer-dossiers.json` supplies the identified product edition, separately scoped development edition, five acquisition criteria, conditions, rights/component indicators and qualification objectives. `assets/application-combinations.json` supplies 33 proposed applications involving 81 distinct assets; these are not delivered integrations or additional IP assets. The VFX platform remains standalone.

Public pages and product briefs describe the existing work and acquisition perimeter. Publication history, internal review logs and private identifiers are outside these public datasets. Source records retain their original evidence basis; rebuilding the showroom does not rerun or upgrade the underlying products. The original style and music assets remain in place.

Validate with `python tools/validate_buyer_information.py`, `node tools/validate_buyer_showroom.cjs`, `python tools/validate_prices.py` and `python tools/validate_publication.py`.

## Connections and evaluation references

The primary navigation links to `connections.html` and the separate `sources.html` evaluation register. Connections supports search, application-area and participating-asset filters. `assets/evaluation-sources.json` attributes the nine documented external references and six assessment-record categories, while retaining each source’s application and limits. The financial source register and all project prices remain in `assets/pricing-catalogue.json`.
