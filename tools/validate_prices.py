#!/usr/bin/env python3
"""Validate complete price records, totals, source links and buyer consistency."""
from pathlib import Path
from urllib.parse import urlparse
import json,subprocess,hashlib,math
from decimal import Decimal,ROUND_HALF_UP

ROOT=Path(__file__).resolve().parents[1]
FIELDS={'sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR','marketComparableProxyEUR','incomeLicensingProxyEUR','probabilityAdjustedStrategicValueEUR','triangulatedEconomicReferenceEUR'}
def recompute(a,f,stage=None):
 i=a['calculationInputs'];s=stage or i['stage'];b=i['potential'];c=a['values']['replacementCostEUR'];sector=f['sectorContext'].get(i['sector'],1);route=f['routeMonetization'].get(i['route'],1);rnd=lambda n:math.floor(n+0.5)
 market=rnd(c*f['marketPotential'][b]*f['marketMaturity'][s]*sector);income=rnd(c*f['incomePotential'][b]*f['incomeMaturity'][s]*route);strategic=rnd(c*f['strategicOpportunityMultiplier'][b]*f['technicalCompletionProbability'][s]*f['commercializationProbability'][b]*f['rightsTransferDiligenceReserve']*f['timeRisk'][s]*sector);w=f['triangulationWeights'];blend=rnd(c*w['replacementCost']+market*w['marketComparableProxy']+income*w['incomeLicensingProxy']+strategic*w['probabilityAdjustedStrategicValue'])
 return dict(marketComparableProxyEUR=market,incomeLicensingProxyEUR=income,probabilityAdjustedStrategicValueEUR=strategic,triangulatedEconomicReferenceEUR=blend)
def validate():
 p=json.loads((ROOT/'assets/pricing-catalogue.json').read_text());buyers=json.loads((ROOT/'assets/buyer-catalogue.json').read_text());assets={a['ref']:a for a in buyers['projects']}
 assert set(p)=={'schema','basisDate','currency','statement','fields','portfolio','displayCurrency','sources','methodology','projects','portfolioUSD'}
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
  assert set(a['calculationInputs'])=={'stage','potential','sector','route'}
  for k,amount in recompute(a,p['methodology']['factors']).items():assert amount==a['values'][k],(a['ref'],k)
  for k,amount in a['values'].items():assert a['valuesUSD'][k.removesuffix('EUR')+'USD']==int((Decimal(amount)*Decimal(str(p['displayCurrency']['rate']))).quantize(Decimal(1),rounding=ROUND_HALF_UP))
  assert all(type(x) is int and x>=0 for x in a['values'].values())
  assert a['values']['negotiationLowEUR']<=a['values']['sellerAskEUR']<=a['values']['negotiationHighEUR']
  f=a['futureReference'];n=f.get('milestoneConditionedEconomicReferenceEUR')
  if n is not None:
   assert type(n) is int and n-a['values']['triangulatedEconomicReferenceEUR']==f['sensitivityDeltaEUR'],a['ref'];conditional+=1
   assert recompute(a,p['methodology']['factors'],f['targetStage'])['triangulatedEconomicReferenceEUR']==n,a['ref']
 for k in FIELDS:assert p['portfolio'][k]==sum(a['values'][k] for a in p['projects']),k
 assert p==json.loads((ROOT/'displays/assets/pricing-catalogue.json').read_text())
 report=json.loads((ROOT/'assets/calculation-validation.json').read_text());assert report['status']=='PASS' and report['summary']['modelOutputs']==432 and report['summary']['usdConversions']==864
 for item in report['publicFiles'].values():assert hashlib.sha256((ROOT/item['path']).read_bytes()).hexdigest()==item['sha256']
 assert report['summary']['costBudgets']==53
 return dict(result='PASS',usdConversions=864,modelOutputsRecomputed=432,costBudgetsReconciled=report['summary']['costBudgets'],completePriceRecords=108,monetaryFields=864,portfolioTotalsReconciled=8,conditionalFutureReferences=conditional,sources=6,askingReferencesConsistentWithBuyerCatalogue=True)
if __name__=='__main__':print(json.dumps(validate(),indent=2))
