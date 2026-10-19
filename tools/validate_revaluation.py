#!/usr/bin/env python3
"""Check all published assessment coverage against actual budgets and dossiers."""
from pathlib import Path
from collections import Counter
import json
ROOT=Path(__file__).resolve().parents[1]
def validate(pricing=None,dossiers=None):
 p=pricing or json.loads((ROOT/'assets/pricing-catalogue.json').read_text())
 d=dossiers or json.loads((ROOT/'assets/buyer-dossiers.json').read_text())
 ds={x['ref']:x for x in d['projects']};counts=Counter()
 assert {x['ref'] for x in p['projects']}=={'TA-IP-'+str(n).zfill(3) for n in range(1,109)}
 assert len(p['projects'])==108
 for a in p['projects']:
  q=a['assessment'];ref=a['ref'];b=a['costBudgets']
  covered=sum((x.get('adoptedRecreationCostEUR') or 0)+(x.get('adoptedRecreationIncrementEUR') or 0) for x in b)
  status='FULL_SCOPED_BUDGET' if covered==a['values']['replacementCostEUR'] else ('PARTIAL_SCOPED_BUDGET' if b else 'LEGACY_ESTIMATE_WITHOUT_WORK_BREAKDOWN')
  assert q['costEvidenceStatus']==status,('Cost coverage misrepresented',ref)
  assert q['assessedOn']==p['basisDate']=='2026-10-19'
  assert q['offeredEdition']==ds[ref]['version']
  assert q['qualification']=={x['axis']:x['grade'] for x in ds[ref]['assessmentCriteria']}
  assert q['marketValueStatus']=='NOT_ESTABLISHED'
  assert all(q[k] for k in ['costEvidenceNote','costEvidenceLabel','financialScopeRule','commercialEvidence','acceptancePosition'])
  assert a['calculationInputs']['sector'] in p['methodology']['factors']['sectorContext']
  assert a['calculationInputs']['route'] in p['methodology']['factors']['routeMonetization']
  counts[status]+=1
 assert counts==p['methodology']['reassessment']['budgetCoverage']
 assert counts=={'FULL_SCOPED_BUDGET':11,'PARTIAL_SCOPED_BUDGET':29,'LEGACY_ESTIMATE_WITHOUT_WORK_BREAKDOWN':68}
 assert p['methodology']['reassessment']['assetsReviewed']==108
 return {'result':'PASS','assessmentRecords':108,'costCoverage':dict(counts),'qualificationGradesUnpromoted':True,'marketValueNotEstablished':108}
if __name__=='__main__':print(json.dumps(validate(),indent=2))
