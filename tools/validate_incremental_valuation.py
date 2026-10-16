#!/usr/bin/env python3
"""Reconcile the nine source-bound cost increments with the preceding publication."""
from pathlib import Path
from decimal import Decimal,ROUND_HALF_UP
import argparse,collections,csv,json,subprocess

ROOT=Path(__file__).resolve().parents[1]
BASELINE='55eb4104732e4c7b7a5867dbfc51218ce4c9ae31'
KEYS=['sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR','marketComparableProxyEUR','incomeLicensingProxyEUR','probabilityAdjustedStrategicValueEUR','triangulatedEconomicReferenceEUR']
def load(name):return json.loads((ROOT/'assets'/name).read_text())
def round500(n):return int((Decimal(n)/500).quantize(Decimal(1),rounding=ROUND_HALF_UP)*500)
def validate():
    before=json.loads(subprocess.check_output(['git','show',BASELINE+':assets/valuation-register.json'],cwd=ROOT,text=True));old={r['ref']:r for r in before['updates']}
    after=load('valuation-register.json');values={r['ref']:r for r in after['updates']};sources=load('valuation-sources.json');review=sources['latestIncrementReview'];changes={r['ref']:r for r in review['assets']}
    assert len(changes)==9 and set(changes)=={'TA-IP-001','TA-IP-005','TA-IP-008','TA-IP-012','TA-IP-016','TA-IP-020','TA-IP-038','TA-IP-081','TA-IP-082'}
    assert len(values)==len(old)==len(sources['projects'])==105
    rates=[18000,22000,16000];roles=['seniorEngineerMonths','leadOrSpecialistMonths','validationProvenanceMonths']
    for ref,c in changes.items():
        b=c['budget'];v=values[ref];o=old[ref]
        totals=[sum(Decimal(str(w[k])) for w in b['workPackages']) for k in roles]
        assert [float(t) for t in totals]==[b[k] for k in roles],ref
        direct=sum(t*rate for t,rate in zip(totals,rates))
        assert int(direct)==b['rawEngineeringCostEUR'] and int(direct*Decimal('1.15'))==b['withAllowanceEUR'],ref
        assert float(sum(totals)*160)==b['assumedHours'],ref
        assert c['comparisonBaselineCommit']!=c['pricedSourceHead'] and len(c['pricedSourceHead'])==40
        assert c['previousReplacementCostEUR']==o['replacementCostEUR']
        assert v['replacementCostEUR']==o['replacementCostEUR']+c['recreationIncrementEUR']
        expected=round500(Decimal(v['replacementCostEUR'])*Decimal(o['sellerAskEUR'])/Decimal(o['replacementCostEUR']))
        assert expected==v['sellerAskEUR']==c['currentSellerAskEUR'],ref
        assert v['negotiationLowEUR']==round500(Decimal(expected)*Decimal(o['negotiationLowEUR'])/Decimal(o['sellerAskEUR']))
        assert v['negotiationHighEUR']==round500(Decimal(expected)*Decimal(o['negotiationHighEUR'])/Decimal(o['sellerAskEUR']))
        assert c['marketValueIncreaseEstablished'] is False and c['productTestsExecutedForThisPricingReview'] is False
        assert v['stage']==o['stage'] and v['potential']==o['potential']
    unchanged=set(values)-set(changes)
    assert len(unchanged)==96
    for ref in unchanged:
        assert all(values[ref][k]==old[ref][k] for k in KEYS),ref
    assert sum(c['recreationIncrementEUR'] for c in changes.values())==645000
    assert sum(c['askingReferenceChangeEUR'] for c in changes.values())==146000
    for k in KEYS:assert sum(v[k] for v in values.values())==after['portfolio'][k],k
    for register in ['seller-readiness-register.json','project-evaluations.json']:
        for p in load(register)['projects']:assert p['sellerAskEUR']==values[p['ref']]['sellerAskEUR'],(register,p['ref'])
    presentations={p['ref']:p for p in load('project-presentations.json')['projects']}
    for ref in ['TA-IP-001','TA-IP-005']:
        assert changes[ref]['sourceScope']=='FROZEN_UNMERGED_DEVELOPMENT'
        assert presentations[ref]['defaultBranchBaselineCommit']!=changes[ref]['pricedSourceHead']
        assert presentations[ref]['pricedDevelopmentSnapshot']['includedInAskingReference'] is True
    rows=list(csv.DictReader((ROOT/'assets/valuation-review.csv').open(encoding='utf-8-sig')))
    assert len(rows)==len({r['Reference'] for r in rows})==105
    for row in rows:
        assert int(row['Seller ask EUR'])==values[row['Reference']]['sellerAskEUR']
        assert int(row['Recreation anchor EUR'])==values[row['Reference']]['replacementCostEUR']
    return {'result':'PASS','assets':105,'repricedProjects':9,'otherIndividualAmountsRetained':96,'recreationIncrementEUR':645000,'askingReferenceChangeEUR':146000,'portfolioSellerAskEUR':after['portfolio']['sellerAskEUR'],'portfolioRecreationEUR':after['portfolio']['replacementCostEUR'],'separateDevelopmentSnapshotsIncluded':2,'qualificationGradesChanged':0,'productTestsRerunByPricingReview':0,'independentMarketIncreaseEstablished':False}
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path);args=parser.parse_args();result=validate();text=json.dumps(result,indent=2)+'\n'
    if args.output:args.output.write_text(text)
    print(text,end='')
