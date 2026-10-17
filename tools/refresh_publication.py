#!/usr/bin/env python3
"""Refresh public register byte fingerprints after a reviewed catalogue edit."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]

def fingerprint(path):
    content = path.read_bytes()
    return {'algorithm':'SHA-256', 'sha256':hashlib.sha256(content).hexdigest(), 'bytes':len(content)}

def main():
    audit_file = ROOT / 'assets/portfolio-audit-certificate.json'
    audit = json.loads(audit_file.read_text())
    for obj in audit['sourceObjects'].values():
        path = ROOT / obj['path']
        if path.is_file():
            content = path.read_bytes()
            obj['gitBlobSha'] = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
            obj.update(fingerprint(path))
    audit_file.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    att_file = ROOT / 'assets/public-attestation.json'
    att = json.loads(att_file.read_text())
    att['publicationDate'] = '2026-10-17'
    att['directoryReviewAt'] = json.loads((ROOT/'assets/repository-inventory.json').read_text())['reviewedAt']
    for name in set(att['files']) | {'project-route-aliases.json'}:
        att['files'][name] = fingerprint(ROOT / 'assets' / name)
    att_file.write_text(json.dumps(att,ensure_ascii=False,indent=2)+'\n')
    print(f"Refreshed {len(att['files'])} public register fingerprints")

if __name__ == '__main__': main()
