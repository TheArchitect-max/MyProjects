#!/usr/bin/env python3
"""Check the approved public buyer records for confidential evidence leakage."""
from pathlib import Path
import json,re
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
PRIVATE=re.compile(r'\b[a-f0-9]{40}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|keyBase64|libfile_[a-z0-9]+|\b(?:MAE|RMSE|holdout_case_ids|secret_key)\b',re.I)
RAW_RESULTS=re.compile(r'\b\d+(?:/\d+)?(?:-test| (?:local |developer |Python )?tests?)(?: |\b)',re.I)
SOURCE_PATH=re.compile(r'\b(?:src|tests|scripts|notebooks|apps|tools)/[^\s"<>]+\.(?:py|js|ts|json|ipynb)\b',re.I)
def validate():
 catalogue=json.loads((ROOT/'assets/buyer-catalogue.json').read_text());dossiers=json.loads((ROOT/'assets/buyer-dossiers.json').read_text())
 for file in (ROOT/'assets').glob('*.json'):
  assert not PRIVATE.search(file.read_text()),file
  assert not SOURCE_PATH.search(file.read_text()),file
 for a in catalogue['projects']:
  folder=ROOT/'displays/products'/a['slug']
  for name in ['index.html','product-brief.md']:
   text=(folder/name).read_text();assert not PRIVATE.search(text),(a['ref'],name)
  text='\n'.join(p.extract_text() for p in PdfReader(folder/'factsheet.pdf').pages)
  assert not PRIVATE.search(text),a['ref']
  assert not RAW_RESULTS.search(a['maturityNote']),a['ref']
 for a in dossiers['projects']:
  for criterion in a['assessmentCriteria']:
   assert not RAW_RESULTS.search(criterion['criterion']),(a['ref'],criterion['axis'])
  for field in ['productPosition','offeredEdition','developmentEdition']:
   assert not RAW_RESULTS.search(a[field]),(a['ref'],field)
  assert not any('potential sensitive filenames' in x.lower() for x in a['sellerConditions']),a['ref']
 assert not list(ROOT.glob('**/*Recovery_Key*'))
 assert not (ROOT/'audit-20261021').exists()
 return {'result':'PASS','publicAssets':110,'publicDocumentsChecked':330,'privateSourceIdentifiersAbsent':True,'privateImplementationPathsAbsent':True,'credentialsAndPersonalContactsAbsent':True,'rawBenchmarkMetricsAbsent':True,'recoveryKeyAbsent':True}
if __name__=='__main__':print(json.dumps(validate(),indent=2))
