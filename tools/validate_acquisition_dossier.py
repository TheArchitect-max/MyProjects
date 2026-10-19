#!/usr/bin/env python3
"""Check the public dossier boundary without requiring confidential key material."""
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
def validate():
 folder=ROOT/'acquisition-dossier';allowed={'index.html','README.md','restore_dossier.py','archive-manifest.json','confidential-dossier.taip'}
 actual={p.name for p in folder.iterdir() if p.is_file()};assert actual==allowed,actual
 m=json.loads((folder/'archive-manifest.json').read_text());b=(folder/m['archive']).read_bytes()
 assert b.startswith(b'TAIP-DOSSIER-V1\n') and not b.startswith(b'PK')
 assert len(b)==m['sizeBytes'] and hashlib.sha256(b).hexdigest()==m['sha256']
 assert m['algorithm']=='AES-256-GCM' and m['recoveryKeyIncluded'] is False
 assert m['originalFileCount']==92 and m['totalPayloadFiles']>=111
 for name in allowed-{'confidential-dossier.taip'}:
  text=(folder/name).read_text();assert 'keyBase64' not in text or name=='restore_dossier.py'
  assert not re.search(r'libfile_[a-z0-9]+|BEGIN PRIVATE KEY|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}',text,re.I),name
 assert not any(folder.glob('*Recovery_Key*')) and not (folder/'original').exists() and not (folder/'current').exists()
 assert 'acquisition-dossier' in (ROOT/'assets/im.js').read_text()
 return dict(result='PASS',originalFilesPreservedEncrypted=92,recoveryKeyPublished=False,confidentialPlaintextPublished=False,authenticatedEncryption='AES-256-GCM')
if __name__=='__main__':print(json.dumps(validate(),indent=2))
