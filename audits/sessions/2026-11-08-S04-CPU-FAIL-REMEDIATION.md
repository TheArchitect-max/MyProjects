# S04 CPU acceptance failure and same-candidate remediation

**Evidence received:** MYPROJECTS_S04_CPU_EVIDENCE_20261108T224358Z.zip

**Evidence archive SHA-256:** `61f8a8a78287397f88bd0b6baf4e15f4d0b8e29a69edb69b6f1b027455334bde`

**Evidence result:** `FAIL_OR_BLOCKED`, exact executed MyProjects HEAD `a1c3941117e3c58b6c32c4174154ff4bfffbe18a`, ZIP CRC PASS, 28 internal file digests PASS. The evidence has been inspected in the conversation, not uploaded as a public repository artifact.

## Six mandatory failures from the actual Colab run

| Gate | Observed failure | Remediation |
|---|---|---|
| Node buyer showroom | Simulated HTTP data allowlist omitted the new source reassessment JSON | Extend fixture to serve the seventh dataset |
| Python buyer information | Public buyer-dossier JSON contained a private source 40-character Git commit hash | Remove source SHA from buyer-facing development edition |
| Python disclosure | Same unexpected source SHA in buyer-dossiers.json | Remove SHA and synchronize both buyer-dossier copies |
| Python revaluation | Offered priced edition did not equal dossier edition for TA-IP-004 and TA-IP-007 | Align the dossier version to the historical priced scope (2.4.1 and 2.12.0) and keep subsequent development scope separately described |
| Reproducible site generation | 139 tracked generated files changed, mainly stale cache tokens, three updated profile summaries, compiled thesis and an incomplete sitemap | Rebuild 21 public hub shells, 119 profile shells, the 404 page, thesis constant and 270-entry sitemap from the existing generator/source |
| Chromium browser | Playwright synchronous API called inside the Colab Jupyter asyncio loop | R1 notebook runs Chromium through a separate Python subprocess; awaits external rerun |

## Fix provenance

- Data + fixture repair: `6a06d6d9c140fd449c1c632a3adb303a8339d7ea`.
- Generated website source synchronization: `6ae1e685ccc88898d7ea46c3704a5107e98387ad`.
- Same existing draft PR #28 and development branch; no merge or production deployment.
- All 119 published seller EUR asking references remain unchanged; aggregate historic EUR 25,058,000.
- The regenerated thesis line (UTF-16 FNV32 `a367f780`) and sitemap Git blob (`1129aedc943f7f8e83a197fc7f1346337f19fb4d`) were matched to the actual expected regeneration diff.

## Gate

`R1_ACCEPTANCE_PENDING`. The generated R1 Colab notebook must target the exact amended PR branch HEAD **after this audit commit**. No previous FAIL may be promoted into PASS merely because source files were modified. Exact-SHA re-execution of all mandatory Node/Python, disclosure, price, site generator and Chromium gates is required before acceptance, merge or any next source-price audit session.

No private source implementation, credentials, customer records, payment processing, SaaS runtime, or new market appraisal is part of this public documentation audit.
