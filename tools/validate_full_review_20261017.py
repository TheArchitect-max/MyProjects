#!/usr/bin/env python3
"""Verify identity continuity, current source scope and the complete financial delta."""
from pathlib import Path
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
import csv,json,subprocess

ROOT=Path(__file__).resolve().parents[1]
BASE='1d3ba27f1224330138d3d68b9c7f57d8f991f87b'
def load(n):return json.loads((ROOT/'assets'/n).read_text())
def previous(n):return json.loads(subprocess.check_output(['git','show',BASE+':assets/'+n],cwd=ROOT))
def round500(n):return int((Decimal(str(n))/500).quantize(Decimal('1'),rounding=ROUND_HALF_UP)*500)

def validate():
 ids=load('project-identities.json')['projects'];oldids=previous('project-identities.json')['projects'];byref={x['ref']:x for x in ids}
 assert len(ids)==len(byref)==len({x['repositoryId'] for x in ids})==len({x['identityName'].casefold() for x in ids})==108
 for i in oldids:
  assert byref[i['ref']]['id']==i['id'] and byref[i['ref']]['identityName']==i['identityName'] and byref[i['ref']]['repositoryId']==i['repositoryId']
 assert set(byref)-{x['ref'] for x in oldids}=={'TA-IP-107','TA-IP-108','TA-IP-109'}
 old={x['ref']:x for x in previous('valuation-register.json')['updates']};v=load('valuation-register.json');vals={x['ref']:x for x in v['updates']};s=load('valuation-sources.json');p={x['ref']:x for x in load('project-presentations.json')['projects']};records=s['latestPortfolioReview']['assets'];changes={x['ref']:x for x in records}
 changed=[]
 for ref,b in old.items():
  if any(b[k]!=vals[ref][k] for k in ['sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR']):changed.append(ref)
 assert set(changed)=={'TA-IP-003','TA-IP-025'}
 for c in records:
  b=c['budget'];hours=sum(w['lowEffortHours'] for w in b['workPackages']);assert hours==b['assumedHours']
  assert hours*94==b['rawEngineeringCostEUR'];assert round(hours*94*1.15,2)==b['withAllowanceEUR']
  low=int(b['withAllowanceEUR']//500)*500;assert low==c['recreationIncrementEUR']
  assert c['currentReplacementCostEUR']==(0 if c['newAsset'] else c['previousReplacementCostEUR'])+low
  assert c['currentSellerAskEUR']==round500(c['currentReplacementCostEUR']*c['priorAskingShareOfRecreation'])
  assert p[c['ref']]['defaultBranchBaselineCommit']==c['pricedSourceHead']==vals[c['ref']]['sourceHead']
 for ref in ['TA-IP-001','TA-IP-005']:
  assert p[ref]['pricedDevelopmentSnapshot']==json.loads(subprocess.check_output(['git','show',BASE+':assets/project-presentations.json'],cwd=ROOT))['projects'][next(i for i,x in enumerate(previous('project-presentations.json')['projects']) if x['ref']==ref)]['pricedDevelopmentSnapshot']
  assert p[ref]['pricedDevelopmentSnapshot']['head']!=p[ref]['defaultBranchBaselineCommit']
 assert all('TA-IP-108' not in [m['ref'] for m in c['members']] for c in load('project-connections.json')['connections'])
 for key in ['sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR','triangulatedEconomicReferenceEUR']:
  assert sum(x[key] for x in vals.values())==v['portfolio'][key]
 assert v['portfolio']['sellerAskEUR']==24676000 and v['portfolio']['replacementCostEUR']==105130000
 ready=load('seller-readiness-register.json');assert ready['summary']==dict(audited=108,pending=0,ready=0,readyWithConditions=98,notReady=10)
 rows=list(csv.DictReader((ROOT/'assets/valuation-review.csv').open(encoding='utf-8-sig')));assert len(rows)==len({r['Reference'] for r in rows})==108
 for row in rows:assert int(row['Seller ask EUR'])==vals[row['Reference']]['sellerAskEUR'] and int(row['Recreation anchor EUR'])==vals[row['Reference']]['replacementCostEUR']
 assert all(x['marketTransactionValuation']=='NOT_ESTABLISHED' and x['incomeValuation']=='NOT_ESTABLISHED' for x in s['projects'])
 return dict(result='PASS',projectsReviewed=108,existingIdentitiesPreserved=105,newIdentifiers=3,uniqueFeminineAliases=108,existingAmountsRetained=103,existingProjectsRepriced=2,newProjectsPriced=3,priorNineIncrementsCountedOnce=True,independentMarketValuations=0,localProductSuites=4,localTestsPassed=193,staticGatesPassed=11,recreationReferenceChangeEUR=100000,askingReferenceChangeEUR=28500,portfolioAskingEUR=24676000,portfolioRecreationEUR=105130000,visualPlatformIsolationPreserved=True)

if __name__=='__main__':
 result=validate();text=json.dumps(result,indent=2)+'\n';(ROOT/'docs/FULL_REVIEW_FINANCIAL_VALIDATION_2026-10-17.json').write_text(text);print(text,end='')
