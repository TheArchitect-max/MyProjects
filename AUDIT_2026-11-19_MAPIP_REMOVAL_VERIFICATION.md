# MAPIP removal - final live verification - 19 November 2026

Published removal commit: `acb41208ce47803aa4f2d1c9881781bf1842e53e`.
Validated publication tree: `bfeebb42f4e0bcfaecf7d4b80f9e8ae4ef0c72c6`.

- **199/199 publication paths PASS**: all retained changed files match the validated Git blob hashes, and all four retired profile/display/brief/PDF paths return HTTP 404.
- Live price JSON contains exactly **128 projects**, no TA-IP-129, and **EUR 25,866,000** in combined individual asking references.
- The fixed 10% package calculation is **EUR 23,279,400**, with **EUR 2,586,600** saving.
- All **15 local publication controls PASS**. All retained project records and 128 factsheet PDF bytes are unchanged. MAPIP's entire EUR 75,000 ask and each of its other monetary contributions are removed once.
- GitHub main and the exact validated tree were checked after publication; **0 open PRs**. The existing development branch was reused, with SHA guards and no force-push.

[Removal and arithmetic](AUDIT_2026-11-19_MAPIP_REMOVAL.md) · [Local controls](audits/MAPIP_REMOVAL_20261119_LOCAL_VALIDATION.json) · [Full live verification](audits/MAPIP_REMOVAL_20261119_LIVE_VERIFICATION.json).

The mandatory post-main documentation update changes only these audit records. A final main/tree/open-PR verification follows that documentation commit. No next product build is part of this task.
