# THEARCHITECT_MAX - Seller-led software IP acquisition portfolio

[Open the acquisition portfolio](https://thearchitect-max.github.io/MyProjects/). Nineteen navigation sections provide access to professional services, the collection, individual project displays, portfolio thesis, qualifications, financial method, sources and acquisition process.

## Professional services

[Professional Services](https://thearchitect-max.github.io/MyProjects/professional-services.html) presents independent software architecture and advanced R&D consultancy, six expertise areas, indicative commercial rates, the engagement process and IP/confidentiality terms. Consulting engagements and existing software-IP acquisitions have separate written scopes and prices. The inquiry outline can be copied locally for use through the agreed business contact channel.

## Voluntary BTC contribution

[Voluntary BTC Contribution](https://thearchitect-max.github.io/MyProjects/contribution.html) provides the owner-supplied BTC address, a local copy control and the Bitcoin-network-only warning. Contributions are optional and confer no services, source access, licenses, ownership, investment return or future work. The website never connects to wallets or initiates transactions. Legacy development links redirect to this informational page.

## Asset identity and information

The public catalogue contains 128 individually identified software and research IP assets. Each asset has one current TA-IP reference, canonical project title and feminine reference name. Individual presentations link to the asset dossier, factsheet PDF and product brief. Compatibility routes preserve earlier links without creating additional assets. Public repositories, publication infrastructure and seller-excluded literary archives are excluded from the asset count. All 128 projects are linked to distinct private repositories. Source-side identity records confirm 121 portfolio assignments. TA-IP-122 through TA-IP-128 retain provisional portfolio aliases.

## Financial references

All eight financial references are presented in EUR and indicative USD, with a dated exchange rate, stated cost assumptions, conditional scenarios and reproducible arithmetic. Individual asking references are seller inputs. Recreation estimates are assumed equivalent engineering costs, not recorded expenditure or an absolute minimum. Market value is not established; final consideration depends on the agreed work, rights and delivery. Portfolio totals are sums of individual references. The full-portfolio asking offer applies a fixed **10% discount** to the sum of current individual asking references for all listed projects acquired in one transaction. The amount updates with the catalogue. Selected groups are quoted separately, and availability, scope, rights and final consideration require written agreement.

128 independently reviewed projects: the EUR 25,274,000 published seller baseline is retained, with EUR 592,000 of separately scoped additions. Current combined seller asking references: EUR 25,866,000. [Review the current catalogue removal and totals](AUDIT_2026-11-19_MAPIP_REMOVAL.md), including every project and its scope addition. The earlier [snapshot](AUDIT_2026-11-19.md) remains historical.

## Controlled acquisition review

Public product information supports initial screening. Confidential source, detailed validation, component, security and rights evidence is reviewed under agreed confidentiality. A transfer covers only expressly agreed first-party work and transferable rights. Third-party software, models, datasets, content and service entitlements retain their own terms. Delivery, recipient acceptance and any further work require separate written scope.

Connections now describe 37 source-reviewed workflow proposals involving 84 distinct assets. Projects can participate in several routes while retaining their separate identities, rights and prices. Source-review decisions, directed handoffs and acceptance requirements are visible per route; stage filtering and distinct-asset totals support comparison without double-counting shared projects. New routes cover radioastronomy, Operations–QUBO, narrative–manuscript assurance and property–recorded-state research. These remain proposals requiring separate joint qualification. See [the implementation and verification record](CONNECTIONS_UPDATE_2026-11-19.md).

The current interface and publication generator use `assets/application-combinations-v2.json`; the original v1 endpoint remains unchanged for cached previous bundles. The separate “Strategic fit · Company-specific opportunities” analysis links existing assets to factual business contexts and the central Sources register. Independent seller-authored analysis. No affiliation, endorsement, commissioning or buyer interest is claimed. The visual-effects platform remains standalone.

## Publication and verification

The website is a static presentation of professional services and software-IP acquisition opportunities. It does not run the underlying products, host accounts, submit enquiries or process payments. Enquiry controls prepare drafts locally. The original visual style, artwork and optional music remain part of the presentation.

Repository tools verify identity consistency, documents, complete prices, disclosed arithmetic, sources, public disclosure boundaries and internal links. Website checks do not independently certify the underlying products or establish legal title, market value or production acceptance.


## Full-portfolio asking offer

The policy is defined in `assets/pricing-catalogue.json` under `methodology.fullPortfolioOffer`. `PricingMath.fullPortfolioOffer()` sums the current project asking references, checks them against the published total and applies the fixed percentage. Integer arithmetic rounds the package price once to the nearest whole euro, with half-euro amounts rounded up. The displayed saving is the combined individual total minus that rounded price. USD amounts use the existing dated catalogue exchange rate.

The same calculation supplies the home, pricing and acquisition pages, the local enquiry draft, the generated pricing review and the calculation-validation report. The pricing review generator invokes the canonical JavaScript calculator, so the static page also works without JavaScript. The separate hypothetical subscription scenario is unchanged and does not determine the acquisition price.

After editing catalogue prices, regenerate publications with `python tools/sync_project_publications.py`, rebuild the calculation report with `node tools/build_calculation_check.cjs`, and validate the maths and public pages. `python tools/build_pages.py` maintains the page shells and versioned script references. The full-portfolio tests cover future price updates, rounding, scope selection and consistency across published surfaces.

© 2026 THEARCHITECT_MAX. First-party rights reserved.
