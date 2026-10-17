#!/usr/bin/env python3
"""Validate complete price records, totals, source links and buyer consistency."""
from pathlib import Path
from urllib.parse import urlparse
import json

ROOT=Path(__file__).resolve().parents[1]
FIELDS={'sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR','marketComparableProxyEUR','incomeLicensingProxyEUR','probabilityAdjustedStrategicValueEUR','triangulatedEconomicReferenceEUR'}
def validate():
 p=json.loads((ROOT/'assets/pricing-catalogue.json').read_text());buyers=json.loads((ROOT/'assets/buyer-catalogue.json').read_text());assets={a['ref']:a for a in buyers['projects']}
 assert set(p)=={'schema','basisDate','currency','statement','fields','portfolio','displayCurrency','sources','methodology','projects'}
 assert p['schema']=='public-pricing-1' and p['currency']=='EUR'
 assert len(p['projects'])==len({x['ref'] for x in p['projects']})==108
 assert len(p['fields'])==len(FIELDS) and {x['key'] for x in p['fields']}==FIELDS
 ids={x['id'] for x in p['sources']};assert len(ids)==6
 for source in p['sources']:
  assert set(source)=={'id','publisher','title','url','finding','application','checkedOn'}
  url=urlparse(source['url']);assert url.scheme=='https' and url.hostname in {'www.wipo.int','bieb.knab.nl','www.upwork.com','www.ecb.europa.eu','ivsc.org'}
 conditional=0
 for a in p['projects']:
  assert set(a['values'])==FIELDS and set(a['sourceIds'])<=ids and a['sourceIds']
  assert a['values']['sellerAskEUR']==assets[a['ref']]['askingReferenceEUR']
  assert all(type(x) is int and x>=0 for x in a['values'].values())
  assert a['values']['negotiationLowEUR']<=a['values']['sellerAskEUR']<=a['values']['negotiationHighEUR']
  f=a['futureReference'];n=f.get('milestoneConditionedEconomicReferenceEUR')
  if n is not None:
   assert type(n) is int and n-a['values']['triangulatedEconomicReferenceEUR']==f['sensitivityDeltaEUR'],a['ref'];conditional+=1
 for k in FIELDS:assert p['portfolio'][k]==sum(a['values'][k] for a in p['projects']),k
 assert p==json.loads((ROOT/'displays/assets/pricing-catalogue.json').read_text())
 return dict(result='PASS',completePriceRecords=108,monetaryFields=864,portfolioTotalsReconciled=8,conditionalFutureReferences=conditional,sources=6,askingReferencesConsistentWithBuyerCatalogue=True)
if __name__=='__main__':print(json.dumps(validate(),indent=2))
