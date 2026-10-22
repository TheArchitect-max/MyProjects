# Acquisition dossier

The [buyer presentation](https://thearchitect-max.github.io/MyProjects/acquisition-dossier/) brings together the acquisition mandate, portfolio, financial method, current product editions, evidence, rights, workflow records and transaction process. All 108 project displays, briefs and factsheets remain available through the [collection](https://thearchitect-max.github.io/MyProjects/displays/).

`confidential-dossier.taip` preserves the complete tracked-file snapshot of the original confidential acquisition repository, including its original financial/source snapshots, identity batches, documentation and tools, byte for byte. A separate dated current-assessment layer supplies the 22 October 2026 source review, financial decisions, developer validation and approved public records. Earlier assessment files remain historical. The original historical files have not been rewritten. This is a file-snapshot consolidation; it is not a Git-history clone. The original repository remains preserved.

The archive uses AES-256-GCM authenticated encryption. The recovery key is held separately and is never included in this public repository. Folder names and static-hosting exclusions are not confidentiality controls; only encrypted confidential content is published here.

For an authorised private review, install `cryptography` in a private Python environment, obtain the separately supplied recovery key and run:

```sh
python restore_dossier.py confidential-dossier.taip /private/recovery-key.json /private/restored-dossier
```

Authentication and the complete internal file manifest are checked before any files are written. Keep the recovery key and all decrypted output outside public repositories and public web hosting. `archive-manifest.json` records only the encrypted file's public integrity information.
