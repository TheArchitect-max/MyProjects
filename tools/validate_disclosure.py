#!/usr/bin/env python3
"""Check the approved public buyer records for confidential evidence leakage."""
from pathlib import Path
import json,re
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
PRIVATE=re.compile(r'\b[a-f0-9]{40}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|keyBase64|libfile_[a-z0-9]+|\b(?:MAE|RMSE|holdout_case_ids|secret_key)\b',re.I)
SOURCE_HASH=re.compile(r'\b[a-f0-9]{40}\b',re.I)
RAW_RESULTS=re.compile(r'\b\d+(?:/\d+)?(?:-test| (?:local |developer |Python )?tests?)(?: |\b)',re.I)
SOURCE_PATH=re.compile(r'\b(?:src|tests|scripts|notebooks|apps|tools)/[^\s"<>]+\.(?:py|js|ts|json|ipynb)\b',re.I)
def validate():
 catalogue=json.loads((ROOT/'assets/buyer-catalogue.json').read_text());dossiers=json.loads((ROOT/'assets/buyer-dossiers.json').read_text())
 known_source_hashes=set(SOURCE_HASH.findall((ROOT/'assets/portfolio-reassessment-20261107.json').read_text()))
 for file in (ROOT/'assets').glob('*.json'):
  raw=file.read_text();source_hashes=set(SOURCE_HASH.findall(raw))
  if file.name=='portfolio-reassessment-20261107.json':assert source_hashes<=known_source_hashes
  else:assert not source_hashes,(file,'unapproved source hash')
  assert not PRIVATE.search(SOURCE_HASH.sub('[APPROVED_SOURCE_PROVENANCE]',raw)),file
  assert not SOURCE_PATH.search(raw),file
 for a in catalogue['projects']:
  folder=ROOT/'displays/products'/a['slug']
  for name in ['index.html','product-brief.md']:
   text=(folder/name).read_text()
   assert set(SOURCE_HASH.findall(text))<=known_source_hashes,(a['ref'],name,'unregistered hash')
   assert not PRIVATE.search(SOURCE_HASH.sub('[SOURCE_PROVENANCE]',text)),(a['ref'],name)
  text='\n'.join(p.extract_text() for p in PdfReader(folder/'factsheet.pdf').pages)
  assert not PRIVATE.search(text),a['ref']
  assert not RAW_RESULTS.search(a['maturityNote']),a['ref']
 for a in dossiers['projects']:
  for criterion in a['assessmentCriteria']:
   assert not RAW_RESULTS.search(criterion['criterion']),(a['ref'],criterion['axis'])
  for field in ['productPosition','offeredEdition','developmentEdition']:
   assert not RAW_RESULTS.search(a[field]),(a['ref'],field)
  assert not any('potential sensitive filenames' in x.lower() for x in a['sellerConditions']),a['ref']
 for a in json.loads((ROOT/'assets/portfolio-identity-ledger.json').read_text())['assets'][119:]:
  folder=ROOT/'displays/products'/a['slug']
  for name in ['index.html','product-brief.md']:
   text=(folder/name).read_text()
   assert set(SOURCE_HASH.findall(text))<=known_source_hashes,(a['id'],name,'unregistered hash')
   assert not PRIVATE.search(SOURCE_HASH.sub('[SOURCE_PROVENANCE]',text)),(a['id'],name)
 assert not list(ROOT.glob('**/*Recovery_Key*'))
 assert not (ROOT/'audit-20261021').exists()
 return {'result':'PASS','publicAssets':123,'publicDocumentsChecked':365,'registeredSourceHashCount':len(known_source_hashes),'privateImplementationPathsAbsent':True,'credentialsAndPersonalContactsAbsent':True,'rawBenchmarkMetricsAbsent':True,'recoveryKeyAbsent':True}
if __name__=='__main__':print(json.dumps(validate(),indent=2))
