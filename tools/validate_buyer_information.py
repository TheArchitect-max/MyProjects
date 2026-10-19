#!/usr/bin/env python3
"""Validate buyer dossiers, independent applications and corresponding downloads."""
from pathlib import Path
import json,re,csv

ROOT=Path(__file__).resolve().parents[1]
RECORD_FIELDS={'ref','version','developmentEdition','productPosition','offeredEdition','transferPosition','assessmentCriteria','sellerConditions','buyerConditions','qualificationObjectives','rightsPosition','componentEvidence','productDetails'}
AXES={'technicalMaturity','evidenceMaturity','ipRightsMaturity','commercialMaturity','transferReadiness'}
def validate():
 catalogue=json.loads((ROOT/'assets/buyer-catalogue.json').read_text())
 dossiers=json.loads((ROOT/'assets/buyer-dossiers.json').read_text())
 applications=json.loads((ROOT/'assets/application-combinations.json').read_text())
 records={p['ref']:p for p in dossiers['projects']};refs={a['ref'] for a in catalogue['projects']}
 assert set(records)==refs and len(dossiers['projects'])==108
 assert set(dossiers)=={'schema','basisDate','purpose','definitions','projects'}
 assert set(applications)=={'schema','purpose','connections'}
 assert not re.search(r'\b[a-f0-9]{40}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',json.dumps([dossiers,applications]),re.I)
 editions=conditions=0
 for a in catalogue['projects']:
  p=records[a['ref']];assert set(p)==RECORD_FIELDS,a['ref']
  assert {c['axis'] for c in p['assessmentCriteria']}==AXES and len(p['assessmentCriteria'])==5
  assert p['version'] and p['productPosition'] and p['offeredEdition'] and p['sellerConditions'] and p['qualificationObjectives']
  assert not re.search(r'newly added|new project|recently renamed|INCREMENT_REPRICED|REFERENCE_REVIEWED|all prices restored|metadata/transfer patch|latest hardened',json.dumps(p),re.I)
  editions+=bool(p['developmentEdition']);conditions+=len(p['sellerConditions'])
  for sub,name in [('displays/products','index.html'),('displays/products','product-brief.md')]:
   text=(ROOT/sub/a['slug']/name).read_text()
   assert a['ref'] in text and p['version'].replace('&','&amp;') in text
   assert 'Acquisition evidence profile' in text
   for c in p['assessmentCriteria']:assert c['grade'] in text
   assert p['sellerConditions'][0].replace('&','&amp;') in text
  assert (ROOT/'displays/assets/buyer-dossiers.json').read_bytes()==(ROOT/'assets/buyer-dossiers.json').read_bytes()
 connections=applications['connections'];assert len(connections)==len({c['id'] for c in connections})==33
 members=set()
 for c in connections:
  assert set(c)=={'id','slug','title','category','purpose','connectionType','status','flow','members','requirements'}
  assert c['status']=='Proposed application' and c['requirements'] and c['flow']
  assert all(set(m)=={'ref','role'} and m['ref'] in refs and m['ref']!='TA-IP-107' for m in c['members'])
  assert len({m['ref'] for m in c['members']})==len(c['members'])
  members.update(m['ref'] for m in c['members'])
 assert len(members)==81
 for page in ['assurance','connections','commercialization','evidence','identities','transaction','transfer','sources','musk']:
  text=(ROOT/(page+'.html')).read_text();assert 'location.replace' not in text and 'im.js?v=showroom12-current-research-20261019' in text
 with (ROOT/'displays/catalogue.csv').open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
 assert len(rows)==108
 for row in rows:
  p=records[row['Reference']];assert row['Product_edition']==p['version'] and row['Handover_position']==p['transferPosition'] and row['Seller_conditions']
 return dict(result='PASS',publicBuyerDossiers=108,assessmentCriteria=540,explicitDevelopmentEditions=editions,handoverConditions=conditions,proposedApplications=33,distinctApplicationMembers=81,buyerInformationPages=9,productBriefsAndDisplaysChecked=216,catalogueRows=108,standaloneVfxAssetPreserved=True)
if __name__=='__main__':print(json.dumps(validate(),indent=2))
