#!/usr/bin/env python3
"""Restore the confidential dossier using a separately supplied recovery key."""
from pathlib import Path, PurePosixPath
import argparse, base64, hashlib, io, json, stat, zipfile
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAGIC=b'TAIP-DOSSIER-V1\n'

def decrypt(archive: bytes, key_document: dict) -> bytes:
    if not archive.startswith(MAGIC) or len(archive)<len(MAGIC)+28:
        raise ValueError('Unrecognised archive format')
    if key_document.get('format')!='TAIP-DOSSIER-V1' or key_document.get('algorithm')!='AES-256-GCM':
        raise ValueError('Unrecognised recovery key')
    key=base64.b64decode(key_document['keyBase64'],validate=True)
    if len(key)!=32: raise ValueError('A 256-bit key is required')
    offset=len(MAGIC)
    return AESGCM(key).decrypt(archive[offset:offset+12],archive[offset+12:],MAGIC)

def validated_files(payload: bytes) -> dict[str, bytes]:
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        names=archive.namelist()
        if len(names)!=len(set(names)): raise ValueError('Duplicate archive entries')
        for info in archive.infolist():
            p=PurePosixPath(info.filename)
            if p.is_absolute() or '..' in p.parts or '\\' in info.filename or stat.S_ISLNK(info.external_attr>>16):
                raise ValueError('Unsafe archive path')
        files={n:archive.read(n) for n in names}
    manifest=json.loads(files['MANIFEST.json'])
    indexed={x['path']:x for x in manifest['files']}
    if set(files)-{'MANIFEST.json'}!=set(indexed): raise ValueError('Archive manifest differs')
    for name,data in files.items():
        if name=='MANIFEST.json': continue
        if len(data)!=indexed[name]['size'] or hashlib.sha256(data).hexdigest()!=indexed[name]['sha256']:
            raise ValueError('Archive content differs: '+name)
    return files

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('archive',type=Path);p.add_argument('recovery_key',type=Path);p.add_argument('destination',type=Path)
    a=p.parse_args()
    files=validated_files(decrypt(a.archive.read_bytes(),json.loads(a.recovery_key.read_text())))
    # Authenticate and validate the complete payload before creating any output.
    if a.destination.exists() and any(a.destination.iterdir()):
        raise SystemExit('Choose a new or empty private destination')
    a.destination.mkdir(parents=True,exist_ok=True,mode=0o700)
    for name,data in files.items():
        target=a.destination/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data);target.chmod(0o600)
    print(f'Restored {len(files)-1} authenticated files. Keep the recovered dossier private.')

if __name__=='__main__': main()
