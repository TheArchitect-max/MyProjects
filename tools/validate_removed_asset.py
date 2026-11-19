#!/usr/bin/env python3
"""Check the requested retirement without changing any retained project or price."""
from pathlib import Path
import json,csv,subprocess,re
R=Path(__file__).resolve().parents[1]
BASE='6549e9b3d2625e6d4f2f263f2dabaabf13101ec0'
REF='TA-IP-129';SLUG='media-acquisition-processing-intelligence-platform'
def read(path):return json.loads((R/path).read_text())
def old(path):return subprocess.check_output(['git','show',BASE+':'+path],cwd=R)
def validate():
 for path,key,idkey in [('assets/buyer-catalogue.json','projects','ref'),('assets/buyer-dossiers.json','projects','ref'),('assets/pricing-catalogue.json','projects','ref'),('assets/portfolio-reassessment-20261107.json','assessments','id'),('assets/portfolio-identity-ledger.json','assets','id'),('displays/project-map.json','projects','ref'),('assets/pricing-continuity-20261119.json','projects','ref')]:
  before=json.loads(old(path));now=read(path)
  retained=[x for x in before[key] if x[idkey]!=REF]
  assert now[key]==retained,('Unrelated project changed',path)
  assert len(now[key])==128 and REF not in {x[idkey] for x in now[key]},path
 p=read('assets/pricing-catalogue.json');before=json.loads(old('assets/pricing-catalogue.json'));retired=next(x for x in before['projects'] if x['ref']==REF)
 for k,value in before['portfolio'].items():assert p['portfolio'][k]==value-retired['values'][k],k
 assert p['portfolio']['sellerAskEUR']==25866000
 assert before['portfolio']['sellerAskEUR']-p['portfolio']['sellerAskEUR']==75000
 offer=json.loads((R/'assets/calculation-validation.json').read_text())['fullPortfolioOffer']
 assert offer['projectCount']==128 and offer['packageAskingEUR']==23279400 and offer['savingEUR']==2586600
 for prefix in ['projects','displays/products']:assert not (R/prefix/SLUG).exists()
 for path,column in [('displays/catalogue.csv','Reference'),('displays/identity-register.csv','Asset_ID'),('displays/price-reconciliation.csv','Reference')]:
  with (R/path).open(encoding='utf-8-sig',newline='') as fp:rows=list(csv.DictReader(fp))
  assert len(rows)==128 and REF not in {x[column] for x in rows},path
 pattern=re.compile(r'TA-IP-129|Rosamund|media-acquisition-processing-intelligence-platform',re.I)
 for file in [*R.glob('*.html'),*R.glob('projects/*/index.html'),*R.glob('displays/products/*/index.html'),R/'displays/index.html',R/'sitemap.xml']:
  assert not pattern.search(file.read_text()),file
 for a in p['projects']:
  file='displays/products/'+next(x['slug'] for x in read('assets/buyer-catalogue.json')['projects'] if x['ref']==a['ref'])+'/factsheet.pdf'
  assert (R/file).read_bytes()==old(file),('Retained PDF changed',a['ref'])
 assert {x['ref'] for x in p['projects']}>= {'TA-IP-105','TA-IP-120'},'Distinct publishing/media projects must remain'
 return dict(result='PASS',removedAsset=REF,removedAskingEUR=75000,currentProjects=128,currentAskingEUR=25866000,fullPortfolioAskingEUR=23279400,retainedProjectRecordsUnchanged=True,retainedFactsheetsUnchanged=128,retiredRoutesAndDownloadsAbsent=True)
if __name__=='__main__':print(json.dumps(validate(),indent=2))
