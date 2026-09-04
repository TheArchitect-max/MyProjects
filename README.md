# THEARCHITECT_MAX — MyProjects

Public GitHub Pages showroom for the private software/IP portfolio owned under the `TheArchitect-max` GitHub account.

## Current public register

Release `20260904-20` reconciles the connected GitHub inventory as of 4 September 2026:

- 68 private repositories observed;
- 66 qualified canonical software/IP assets in the priced register;
- 1 retained legacy migration repository, not double-counted as a current asset;
- 1 reserved/unqualified repository (`TraceLine-Evidence-Governed-Investigation-Framework`), which exists but was empty at review and is therefore not priced or assigned a maturity classification;
- 37 Software-Validated, 24 Verified Prototype and 5 Research assets;
- EUR-authoritative strategic asking reference: **€11,595,000**;
- recreation-cost reference: **€45,520,000**;
- indicative USD display uses the ECB 4 September 2026 reference rate of **1 EUR = 1.1622 USD**.

The release adds `Software Asset Provenance & Qualification Platform` (TA-IP-065), `Adaptive General Reasoning Research Platform` (TA-IP-066), and updates TA-IP-005 to the current `Continuum State Integrity Platform` identity.

## Architecture

The public homepage loads the stable historical portfolio dataset and applies the current reconciliation from `assets/live-release.json` through `assets/portfolio-20260904.js`. This preserves the prior evidence trail while making current repository identities, counts and pricing authoritative in the public register.

## Validation

No GitHub Actions workflow is used. Run the local release gate from a checkout:

```bash
npm test
```

The validator checks the Release 20 data contract, totals, maturity counts, current identity changes, current page metadata and the absence of GitHub Actions workflows.

## Evidence boundary

Repository evidence and internal software validation do not automatically establish scientific validity, field performance, standards certification, independent certification, legal chain-of-title, trademark clearance, patent/FTO clearance, market traction or transaction value. Third-party rights remain subject to their own licenses and terms.

## License

The website source remains proprietary / All Rights Reserved under the repository `LICENSE` file.
