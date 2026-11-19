#!/usr/bin/env python3
"""Verify historical price preservation, distinct added scope and current source identity."""
from pathlib import Path
from decimal import Decimal
from collections import Counter
import json, hashlib, subprocess, argparse, copy, re
from html import unescape

R=Path(__file__).resolve().parents[1]
BASE='b5afc394f226e949f9264dba7b5e5b99f1f60e5e'
def read(name):return json.loads((R/name).read_text())
def down(n):return int(Decimal(str(n))//500)*500
def cost(hours):return down(Decimal(hours)*94*Decimal('1.15'))

def validate(pricing=None,continuity=None,source_manifest=None):
 p=pricing or read('assets/pricing-catalogue.json');roll=continuity or read('assets/pricing-continuity-20261119.json');base=read('assets/pricing-baseline-20261119.json')
 raw=subprocess.check_output(['git','show',BASE+':assets/pricing-catalogue.json'],cwd=R);original=json.loads(raw)
 assert base['publicationCommitSha']==roll['baselineCommitSha']==BASE
 assert hashlib.sha256(raw).hexdigest()==base['canonicalFileSHA256']
 assert base['portfolio']==original['portfolio']
 assert roll['baselineAskingTotalEUR']==original['portfolio']['sellerAskEUR']==25274000
 B={a['ref']:a for a in base['projects']};O={a['ref']:a for a in original['projects']};P={a['ref']:a for a in p['projects']};Q={a['id']:a for a in read('assets/portfolio-reassessment-20261107.json')['assessments']}
 assert len(B)==len(O)==128 and len(P)==len(roll['projects'])==128
 expected={f'TA-IP-{n:03}' for n in range(1,129)}
 assert set(P)=={a['ref'] for a in roll['projects']}==set(Q)==expected
 assert len({a['sourceRepositoryNumericId'] for a in Q.values()})==128
 assert len({a['sourceMainSha'] for a in Q.values()})==128
 additions=groups=candidate_groups=0
 for row in roll['projects']:
  ref=row['ref'];z=P[ref];r=Q[ref];old=O.get(ref);oldbudgets=old['costBudgets'] if old else []
  if old:
   assert B[ref]['values']==old['values'],ref
   assert B[ref]['costBudgets']==oldbudgets,ref
   assert z['costBudgets'][:len(oldbudgets)]==oldbudgets,('Historical budgets changed',ref)
   assert z['calculationInputs']==old['calculationInputs'],('Historical factors changed',ref)
  ask=old['values']['sellerAskEUR'] if old else 0;recreation=old['values']['replacementCostEUR'] if old else 0
  assert row['baselineAskingEUR']==ask and row['baselineRecreationEUR']==recreation,ref
  assert row['baselineSourceMainSha']==(B[ref]['sourceMainSha'] if old else None)
  assert row['currentMainSha']==r['sourceMainSha']
  assert row['candidateSha']==r.get('currentCandidateHeadSha')
  assert len(z['costBudgets'])==len(oldbudgets)+len(row['additionalWork']),ref
  ai=ci=0;seen=set()
  for b,g in zip(z['costBudgets'][len(oldbudgets):],row['additionalWork']):
   assert g['sourceEdition'] not in seen,('Repeated edition',ref);seen.add(g['sourceEdition'])
   assert b['workPackages']==g['workPackages'];hours=sum(w['lowEffortHours'] for w in b['workPackages'])
   assert hours==b['assumedHours']==g['assumedHours'] and hours>0
   inc=cost(hours);askinc=down(Decimal(inc)*Decimal('.3'))
   assert g['recreationIncrementEUR']==b['adoptedRecreationIncrementEUR']==inc
   assert g['askingIncrementEUR']==askinc
   assert b['previousRecreationCostEUR']==recreation+ci
   assert b['currentRecreationCostEUR']==recreation+ci+inc
   assert b['sourceMainSha']==r['sourceMainSha']
   assert b['sourceEdition']==g['sourceEdition']
   if b['sourceEdition']=='WRITTEN_CANDIDATE_DELTA':
    assert b['sourceCandidateSha']==r['currentCandidateHeadSha'] and r['candidateStatus']=='OPEN_CANDIDATE_NOT_RELEASE_ACCEPTED'
    assert row['acceptance']=='WRITTEN_CANDIDATE_NOT_RELEASE_ACCEPTED';candidate_groups+=1
   else:assert b['sourceCandidateSha'] is None
   ci+=inc;ai+=askinc;groups+=1
  assert row['askingIncrementEUR']==ai and row['recreationIncrementEUR']==ci
  assert row['currentAskingEUR']==z['values']['sellerAskEUR']==ask+ai
  assert row['currentRecreationEUR']==z['values']['replacementCostEUR']==recreation+ci
  assert z['values']['negotiationLowEUR']==(old['values']['negotiationLowEUR'] if old else 0)+int(Decimal(ai)*Decimal('.8'))
  assert z['values']['negotiationHighEUR']==(old['values']['negotiationHighEUR'] if old else 0)+int(Decimal(ai)*Decimal('1.25'))
  assert r['askingReferenceChangeEUR']==ai and r['previousAskingReferenceEUR']==ask
  assert r['priceDecision']==row['decision'] and r['currentAskingReferenceEUR']==ask+ai
  assert r['functionalReexecution']=='NOT_RUN' and r['marketValueEstablished'] is False
  assert z['assessment']['marketValueStatus']=='NOT_ESTABLISHED'
  additions+=ai
 assert sum(a['currentAskingEUR'] for a in roll['projects'])==p['portfolio']['sellerAskEUR']==roll['summary']['currentAskingTotalEUR']==25274000+additions
 assert roll['summary']['additionalAskingEUR']==additions==592000
 assert dict(Counter(a['decision'] for a in roll['projects']))==roll['summary']['decisions']
 assert candidate_groups==roll['summary']['writtenCandidatesPriced']==39
 # Each static review table must retain the correct identity, not just the row count.
 for page in ['portfolio-register.html','portfolio-evaluation.html','portfolio-pricing-review.html']:
  html=(R/page).read_text();body=re.search(r'<tbody>(.*?)</tbody>',html,re.S).group(1)
  table_rows=re.findall(r'<tr\b[^>]*>(.*?)</tr>',body,re.S)
  ids=[re.search(r'TA-IP-\d{3}',row).group() for row in table_rows]
  assert len(ids)==len(set(ids))==128 and set(ids)==expected,(page,'Wrong per-project identities')
  if page!='portfolio-evaluation.html':
   for ref,row in zip(ids,table_rows):assert f"EUR {P[ref]['values']['sellerAskEUR']:,}" in unescape(row),(page,ref,'Wrong project asking reference')
 if source_manifest:
  current={x['ref']:x for x in json.loads(Path(source_manifest).read_text())}
  assert set(current)==set(Q)
  for ref,r in Q.items():
   s=current[ref];assert r['sourceRepositoryNumericId']==int(s['id']),ref
   assert r['sourceMainSha']==s['mainSha'],ref
   assert r['openCandidateCount']==len(s['pulls']),ref
   if r.get('currentCandidateHeadSha'):assert r['currentCandidateHeadSha'] in {x['headSha'] for x in s['pulls']},ref
 return dict(result='PASS',baselineAssetsPreserved=128,currentAssets=128,baselineAskingEUR=25274000,additionalAskingEUR=additions,currentAskingEUR=p['portfolio']['sellerAskEUR'],distinctAdditionalEditionBudgets=groups,writtenCandidatesSeparatelyPriced=candidate_groups,staticReviewIdentitiesAndAsksChecked=True,sourceManifestReconciled=bool(source_manifest),historicalInputsUnchanged=True,marketValueEstablished=False)

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source-manifest');args=parser.parse_args()
 result=validate(source_manifest=args.source_manifest)
 # Negative controls: an unexplained price increase and altered historical budget must fail.
 for mutate in [lambda p:p['projects'][0]['values'].__setitem__('sellerAskEUR',p['projects'][0]['values']['sellerAskEUR']+500),lambda p:p['projects'][0]['costBudgets'][0].__setitem__('assumedHours',1),lambda p:p['projects'][0]['costBudgets'].append(copy.deepcopy(p['projects'][0]['costBudgets'][-1]))]:
  bad=copy.deepcopy(read('assets/pricing-catalogue.json'));mutate(bad)
  try:validate(pricing=bad)
  except AssertionError:pass
  else:raise AssertionError('Corrupted price continuity was accepted')
 result['negativeControlsRejected']=3
 print(json.dumps(result,indent=2))
