#!/usr/bin/env python3
"""One-time correction: separately budget evidenced development since prior sources.

Inputs are analyst reproduction assumptions, not logged hours or market appraisals.
The old asset-specific ask/cost and negotiation proportions are retained.
"""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
from collections import Counter
from datetime import datetime, timezone
import copy, csv, json, math

ROOT=Path(__file__).resolve().parents[1]
AS=ROOT/'assets'
AT=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
DOC='docs/DEVELOPMENT_VALUE_CORRECTION_2026-10-16.md'
RATES=(18000,22000,16000)
ROLE_KEYS=('seniorEngineerMonths','leadOrSpecialistMonths','validationProvenanceMonths')

# Each row is a bounded reproduction work package: senior, specialist, QA months.
CONFIG={
 'TA-IP-001':dict(version='0.6.3',scope='FROZEN_UNMERGED_DEVELOPMENT',increment=140000,
  before='0.4.2',base='de09af79414680dabca8db396ccb39812a79d5b3',head='f7ec774494ff1fa73e1ae2eb26cb967d4054eac6',
  packages=[('Conditional geometry and replayable research dossiers',1.25,.9,.35),('Bounded signal processing, archive context and evidence comparison',1.35,.85,.5),('Numerical/regression evidence, packaging and review documentation',.4,.25,.65)],
  finding='Adds conditional observation geometry, replayable research dossiers, bounded motion/signal processing, actual public-archive import and dependency-aware evidence comparison beyond the already priced v0.4.2 foundation.',
  limit='Full cross-modality fusion, physical/field qualification, Horizon products and third-party archive ownership are excluded.',
  evidence='Retained v0.6.3 report: 1,043 canonical passes and 96 independently validated schemas at its stated tested implementation. Publication/evidence commits are kept separate from that executed code.'),
 'TA-IP-005':dict(version='6.4.0',scope='FROZEN_UNMERGED_DEVELOPMENT',increment=100000,
  before='5.9.0',base='620213d30f3aa50120a29693d6871eb932bf4251',head='b76713bcb30af9a83cc4ec679d92b5892b25e773',
  packages=[('Operator governance and cross-dossier review functions',1.3,.3,.35),('Evidence bundles, delivery records and authorized document collection',1.3,.3,.35),('Compatibility repairs, retained qualification and handover documentation',.4,.15,.55)],
  finding='Adds operator case governance, cross-dossier evidence review, verifiable bundles/delivery records and bounded authorized local-document collection beyond the retained v5.9 scope. Rename-only edits receive no separate premium.',
  limit='Historical v6.0.0/v6.3.0 FAIL states remain. Live provider collection, external rights, production operation and future connectors are excluded.',
  evidence='Retained current verifier: v6.4.0 PASS, 192 tests across six environments; repaired v6.3.1/v6.3.2 evidence remains separate from historical failures.'),
 'TA-IP-008':dict(version='retained assessment-comparison build',scope='DEFAULT_BRANCH',increment=100000,
  before='previous plant-suitability core',base='c773b1dda3b28d773ac055d20572d5cd03f78215',head='ff85ede411bdd26f0bd2b96e144ef075460ca614',
  packages=[('Multi-species assessment and owner-scoped project planning',1.25,.4,.25),('Retained assessment evidence, export and scenario comparison',1.3,.35,.35),('Persistence integration, regression evidence and product documentation',.45,.25,.4)],
  finding='Adds owner-scoped projects/sites/zones, immutable plan revisions, retained assessment exports and descriptive scenario comparisons. File/path renames and copied fixtures are not counted as additional software.',
  limit='The newest comparison backend still requires its own native PostgreSQL qualification. Regional coverage, field agronomy, live weather acceptance and production deployment are excluded.',
  evidence='Current comparison documentation reports 112 Go tests, seven Python regressions and 376 file-runtime checks. Earlier native PostgreSQL receipts apply only to their earlier frozen sources.'),
 'TA-IP-012':dict(version='2.9.0',scope='DEFAULT_BRANCH',increment=15000,
  before='2.7.0',base='b99e5047c59eacd229f1807de989236d1ffcea73',head='85c1cdfd72b1be2f5c1a572ec7f85de04217c93d',
  packages=[('Release-evidence and readiness workflow',.12,.06,.08),('Post-release change assessment and requalification',.1,.07,.1),('Tamper regressions, CLI checks and release documentation',.03,.02,.07)],
  finding='Adds release-evidence/readiness governance and deterministic post-release change/requalification assessment; it also repairs nested evidence binding.',
  limit='No visual-accuracy, always-on monitoring, hidden remote-model identity, production, legal or independent-certification premium is included.',
  evidence='Retained 2.9 report: 130 automated tests PASS and 90.88% stated core coverage. These are internal engineering results, not independent certification.'),
 'TA-IP-016':dict(version='1.23.0',scope='DEFAULT_BRANCH',increment=100000,
  before='1.7.0',base='8a115c904955797155b6463fd2cda415899223d3',head='e758cb4680041b8b0b9cf313299d21cea90628dc',
  packages=[('Additional reference adapters and temporal/window comparison',.75,.4,.35),('Recovery supervision, portable evidence and local archives',.85,.4,.55),('Contract/identity repairs, retained regressions and documentation',.4,.2,.6)],
  finding='Adds supplied-series financial/space reference extensions, recovery supervision, window/temporal evidence, portable records, local archives and offline verification, followed by reproducible identity/lifecycle repairs.',
  limit='Live instruments/feeds, field/domain accuracy, scientific certification and production deployment are excluded. Historical features are not counted again.',
  evidence='Retained exact-code v1.23 Colab evidence records canonical 253/253 and independent discovery 253/253 passes at 32073ef1c45b490e0669acb995f20e891601ddc8; the priced head adds the evidence record.'),
 'TA-IP-020':dict(version='0.8.0',scope='DEFAULT_BRANCH',increment=40000,
  before='0.7.0',base='8cb56a1a8e52f9c82f6471eab888662561dbc935',head='ce4d3f92aa5439954b03755dd3082b2c4641e37e',
  packages=[('Bounded trainable predictive-state research layer',.6,.35,.15),('Checkpoint-bound experiments and review interfaces',.25,.1,.15),('Partition/regression checks and research documentation',.15,.05,.2)],
  finding='Adds an explicitly trained predictive-state layer, held-out evaluation separation and checkpoint-bound research runs beyond the earlier count-based adaptation.',
  limit='General intelligence, human equivalence, open-world performance, autonomous operation and new commercial demand are not established or priced.',
  evidence='Retained change record expands the regression inventory from 75 to 101 tests; the documented frozen benchmark remains bounded. The website does not claim a new execution.'),
 'TA-IP-038':dict(version='0.24.0',scope='DEFAULT_BRANCH',increment=75000,
  before='0.17.0',base='c72ab4961955b81c0932e16fcd3e94a5f943d894',head='4fb34a9155fc1041a616dd024ac2d31f1dfcaa09',
  packages=[('Artifact binding and lifecycle coordination',.75,.35,.35),('Retention, reconciliation, repair and deletion/readmission controls',.7,.3,.35),('Regression/API integration and handover documentation',.3,.1,.3)],
  finding='Adds artifact bindings, retention/reconciliation and repair planning, durable deletion claims and verified readmission within the existing media-production foundation.',
  limit='Full native 0.24 PostgreSQL/concurrency qualification remains open. Prior 0.23.1 database PASS is not promoted to 0.24. Media/model rights, hosted operation and future provider acceptance are excluded.',
  evidence='Repository records report 324 local passes per Python version with native PostgreSQL tests skipped. This pricing review did not rerun those suites.'),
 'TA-IP-081':dict(version='0.7.0',scope='DEFAULT_BRANCH',increment=25000,
  before='0.5.0',base='de02892ac9ed9cbd27adc0f1ec4ecbf92896ea34',head='8870c146e94c62856dcf38d297653367ac37d565',
  packages=[('Packaged offline browser-provider workflow',.3,.08,.1),('Bounded semantic-provider and dataset evaluation',.2,.08,.1),('Targeted qualification checks and product documentation',.1,.04,.15)],
  finding='Adds packaged offline browser providers, content-identity verification and bounded semantic-provider/dataset evaluation over controlled examples.',
  limit='The marker provider and software demo do not establish general scene understanding, production-detector accuracy or physical-device qualification.',
  evidence='Current documentation records 30 targeted checks and JavaScript syntax checks. Physical-device and broad semantic qualification remain unestablished.'),
 'TA-IP-082':dict(version='0.11.0',scope='DEFAULT_BRANCH',increment=50000,
  before='0.8.0',base='7810d2175bac7adc8ac4232d21dd6efbcf5bf198',head='6255df2e6c27535dd46043ac904fec519623ce33',
  packages=[('Bounded loopback runtime and mutual-authentication transport',.45,.25,.2),('Outbound-only reference worker-agent lifecycle',.45,.25,.2),('Protocol/regression evidence and operational documentation',.2,.1,.25)],
  finding='Adds loopback transport, TLS 1.3 mutual authentication and an outbound-only reference worker agent with bounded reconnect, heartbeat and command/lease processing.',
  limit='Production remote-provider operation, public networking, fleet installation, hostile-code containment, accelerator execution and multi-controller operation remain excluded.',
  evidence='Retained 0.11 documentation reports 212 passing tests. Qualification remains within the stated reference/loopback boundary.'),
}

def load(name):return json.loads((AS/name).read_text())
def save(name,data):(AS/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def rounded500(value):return int((Decimal(str(value))/500).quantize(Decimal('1'),rounding=ROUND_HALF_UP)*500)
def jsround(value):return math.floor(value+.5)
def economic(value,asset,method,stage=None):
    f=method['factors'];rep=value['replacementCostEUR'];s=stage or value['stage'];p=value['potential'];sector=f['sectorContext'].get(asset['sector'],1);route=f['routeMonetization'].get(asset['route'],1)
    market=jsround(rep*f['marketPotential'][p]*f['marketMaturity'][s]*sector)
    income=jsround(rep*f['incomePotential'][p]*f['incomeMaturity'][s]*route)
    strategic=jsround(rep*f['strategicOpportunityMultiplier'][p]*f['technicalCompletionProbability'][s]*f['commercializationProbability'][p]*f['rightsTransferDiligenceReserve']*f['timeRisk'][s]*sector)
    w=f['triangulationWeights'];tri=jsround(rep*w['replacementCost']+market*w['marketComparableProxy']+income*w['incomeLicensingProxy']+strategic*w['probabilityAdjustedStrategicValue'])
    return dict(marketComparableProxyEUR=market,incomeLicensingProxyEUR=income,probabilityAdjustedStrategicValueEUR=strategic,triangulatedEconomicReferenceEUR=tri,askShareOfTriangulated=value['sellerAskEUR']/tri)

def main():
    values=load('valuation-register.json');assert values['latestFinancialReassessment']['type']=='FULL_PORTFOLIO_MULTISOURCE_REVIEW','Apply once to the preceding publication'
    old_portfolio=copy.deepcopy(values['portfolio']);method=load('economic-methodology.json');sources=load('valuation-sources.json');pres=load('project-presentations.json');evals=load('project-evaluations.json')
    by_ref={v['ref']:v for v in values['updates']};pmap={p['ref']:p for p in pres['projects']};emap={e['ref']:e for e in evals['projects']};rmap={r['ref']:r for r in sources['projects']}
    raw=load('im-data.json');recreation=load('recreation-costs.json');supp=load('supplemental-assets.json');extra=load('independent-assets.json')
    assets={x[1]:{'sector':raw['s'][x[4]],'route':raw['r'][x[7]]} for x in raw['a']}
    assets.update({x['ref']:{'sector':x['sector'],'route':x['route']} for x in supp['assets']+extra['assets']})
    records=[]
    for ref,c in CONFIG.items():
        v=by_ref[ref];p=pmap[ref];e=emap[ref];r=rmap[ref];old=copy.deepcopy(v)
        totals=[sum(Decimal(str(row[i+1])) for row in c['packages']) for i in range(3)]
        direct=sum(t*rate for t,rate in zip(totals,RATES));with_allowance=direct*Decimal('1.15');hours=sum(totals)*160
        budget={'ref':ref,'slug':v['slug'],'basis':'Incremental present first-party work since the explicitly identified earlier source; previous scope counted once',
          'economicAssessmentAt':AT,'comparisonBaselineVersion':c['before'],'comparisonBaselineCommit':c['base'],'sourceHead':c['head'],'pricedVersion':c['version'],'sourceScope':c['scope'],
          **{k:float(t) for k,t in zip(ROLE_KEYS,totals)},'assumedHours':float(hours),'rawEngineeringCostEUR':int(direct),'withAllowanceEUR':int(with_allowance),
          'adoptedRecreationIncrementEUR':c['increment'],'previousRecreationCostEUR':old['replacementCostEUR'],'resultingRecreationCostEUR':old['replacementCostEUR']+c['increment'],
          'workPackages':[{'scope':row[0],**dict(zip(ROLE_KEYS,row[1:]))} for row in c['packages']],
          'scope':c['finding'],'exclusions':[c['limit'],'Previously costed baseline work','Pure renaming, generated snapshots and repeated historical validation counted as new products','Future implementation, revenue and guaranteed buyer outcomes'],
          'effortSensitivity':{'acceleratedQuarterEffortAtKnabMeanEUR':jsround(float(hours)*.25*94*1.15),'oneAndHalfEffortAtRetainedRoleRatesEUR':jsround(float(with_allowance)*1.5),
                              'basis':'Illustrative effort alternatives only; AI assistance, reuse, acceptance depth and buyer capability can change actual effort substantially. Neither scenario is a quote or confidence interval.'},
          'boundary':'Analyst engineering-equivalent reproduction assumption, not logged hours, two days of labour invoiced as months, historical expenditure, a buyer quotation or independently established market value.'}
        path=f"rebuildCostCalibration.incrementalWorkPackageEstimates[{len(method['rebuildCostCalibration']['incrementalWorkPackageEstimates'])}]"
        method['rebuildCostCalibration']['incrementalWorkPackageEstimates'].append(budget)
        new_cost=budget['resultingRecreationCostEUR'];share=Decimal(old['sellerAskEUR'])/Decimal(old['replacementCostEUR'])
        ask=rounded500(Decimal(new_cost)*share);low=rounded500(Decimal(ask)*Decimal(old['negotiationLowEUR'])/Decimal(old['sellerAskEUR']));high=rounded500(Decimal(ask)*Decimal(old['negotiationHighEUR'])/Decimal(old['sellerAskEUR']))
        pricing_scope=f"Existing first-party {c['version']} source at {c['head']} ({'unmerged development snapshot' if c['scope']=='FROZEN_UNMERGED_DEVELOPMENT' else 'default-branch snapshot'}), including the described implemented increment. {c['limit']}"
        note=f"The implemented increment adds an estimated EUR {c['increment']:,} reproduction reference to the retained EUR {old['replacementCostEUR']:,} base, giving EUR {new_cost:,}. Retaining this project's prior asking/cost proportion ({float(share)*100:.3f}%) and rounding to EUR 500 changes the seller asking reference from EUR {old['sellerAskEUR']:,} to EUR {ask:,}. The baseline cost remains a legacy seller assumption; the new increment has its own disclosed budget."
        inc={'ref':ref,'slug':v['slug'],'title':p['title'],'reviewedAt':AT,'beforeVersion':c['before'],'pricedVersion':c['version'],'comparisonBaselineCommit':c['base'],'pricedSourceHead':c['head'],'sourceScope':c['scope'],
             'finding':c['finding'],'retainedEvidence':c['evidence'],'remainingQualification':c['limit'],'previousSellerAskEUR':old['sellerAskEUR'],'currentSellerAskEUR':ask,'askingReferenceChangeEUR':ask-old['sellerAskEUR'],
             'previousReplacementCostEUR':old['replacementCostEUR'],'currentReplacementCostEUR':new_cost,'recreationIncrementEUR':c['increment'],'priorAskingShareOfRecreation':float(share),
             'budget':budget,'costAssumptionsDocument':DOC,'pricingScope':pricing_scope,'decisionNote':note,'productTestsExecutedForThisPricingReview':False,'marketValueIncreaseEstablished':False}
        records.append(inc)
        v.update(sellerAskEUR=ask,negotiationLowEUR=low,negotiationHighEUR=high,replacementCostEUR=new_cost,economicAssessmentAt=AT,financialReferencesReviewedAt=AT,
                 financialReviewDecision='REPRICED_IMPLEMENTED_INCREMENT',costEvidenceStatus='INCREMENT_BUDGET_WITH_LEGACY_BASE',sourceHead=c['head'],pricingScope=pricing_scope,costAssumptionsDocument=DOC)
        v.update(economic(v,assets[ref],method))
        p.update(evaluationResult='INCREMENT_REPRICED',evaluationNote=note,economicAssessmentAt=AT,economicAssessmentNote=note,economicAssessmentDocument=DOC,pricingScope=pricing_scope,financialReferencesReviewedAt=AT)
        p['valuationReview'].update(reviewedAt=AT,decision='REPRICED_IMPLEMENTED_INCREMENT',costEvidenceStatus='INCREMENT_BUDGET_WITH_LEGACY_BASE',document=DOC)
        p['pricedDevelopmentSnapshot']={'version':c['version'],'head':c['head'],'scope':c['scope'],'includedInAskingReference':True}
        e.update(reviewResult='INCREMENT_REPRICED',reviewNote=note,sellerAskEUR=ask,previousSellerAskEUR=old['sellerAskEUR'],replacementCostEUR=new_cost,previousReplacementCostEUR=old['replacementCostEUR'],
                 triangulatedEconomicReferenceEUR=v['triangulatedEconomicReferenceEUR'],monetaryEstimateChanged=True,financialReferencesReviewedAt=AT,assessedAt=AT)
        e['valuationReview']=p['valuationReview'];e['pricedDevelopmentSnapshot']=p['pricedDevelopmentSnapshot']
        r.update(reviewedAt=AT,decision='REPRICED_IMPLEMENTED_INCREMENT',decisionNote=note,incrementalReview=inc)
        r['financialReference'].update(sellerAskEUR=ask,negotiationLowEUR=low,negotiationHighEUR=high,replacementCostEUR=new_cost,pricedSourceHead=c['head'],pricedSourceHeadStatus='RECORDED',
                                       pricedVersion=c['version'],pricedSourceScope=c['scope'],referenceRepricedAt=AT,currentDocumentationAutomaticallyRepriced=False)
        r['costEvidence'].update(status='INCREMENT_BUDGET_WITH_LEGACY_BASE',confidence='LEGACY_BASE_UNVERIFIED_INCREMENT_ESTIMATED',note='The previous whole-project cost anchor remains a legacy seller assumption. The new implemented increment has a separate role/work-package reproduction budget; the base is counted once.',
                                 disclosedWorkPackageCount=r['costEvidence']['disclosedWorkPackageCount']+1,disclosedAdoptedAmountsEUR=r['costEvidence']['disclosedAdoptedAmountsEUR']+c['increment'],completeAnchorReconstructedFromDisclosedBudgets=False)
        r['costEvidence']['workPackages'].append({'methodologyPath':path,'coverage':'INCREMENT_ONLY','basisDate':AT,'scope':c['finding'],'sourceHead':c['head']})
        r['exclusions']=[c['limit'],'The original baseline work is not counted again.','Future work, production operation, hardware and third-party ownership are excluded.','Independent market value, revenue and guaranteed buyer savings remain unestablished.']
        if c['scope']=='FROZEN_UNMERGED_DEVELOPMENT':r['exclusions'].append('The specified frozen development snapshot is explicitly included in this estimate; it remains unmerged and does not replace the default branch or establish production acceptance.')

    # Synchronize the raw primary and extra amount stores as well as overrides.
    for index,row in enumerate(raw['a']):
        v=by_ref[row[1]];row[8:11]=[v['sellerAskEUR'],v['negotiationLowEUR'],v['negotiationHighEUR']];recreation['assets'][index]=v['replacementCostEUR']
    raw['p'][1:4]=[sum(x[i] for x in raw['a']) for i in [8,9,10]]
    for data in [supp,extra]:
        for a in data['assets']:
            v=by_ref[a['ref']];a.update(ask=v['sellerAskEUR'],low=v['negotiationLowEUR'],high=v['negotiationHighEUR'],recreationCost=v['replacementCostEUR'])
    portfolio=values['portfolio']
    for key in ['sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR','marketComparableProxyEUR','incomeLicensingProxyEUR','probabilityAdjustedStrategicValueEUR','triangulatedEconomicReferenceEUR']:
        portfolio[key]=sum(v[key] for v in by_ref.values())
    portfolio['sellerAskAsShareOfTriangulated']=portfolio['sellerAskEUR']/portfolio['triangulatedEconomicReferenceEUR'];portfolio['sellerAskAsShareOfReplacementCost']=portfolio['sellerAskEUR']/portfolio['replacementCostEUR'];portfolio['averageTriangulatedEconomicReferencePerPricedAsset']=portfolio['triangulatedEconomicReferenceEUR']/105
    portfolio['monetaryScope']='105 independent project references. Nine implemented increments are separately budgeted and repriced; 96 individual amounts are retained. Frozen MARP and EIOP development snapshots are explicitly included without merging. Two publication repositories remain excluded.'
    total_inc=sum(x['recreationIncrementEUR'] for x in records);ask_delta=sum(x['askingReferenceChangeEUR'] for x in records)
    review={'assessedAt':AT,'type':'TARGETED_IMPLEMENTED_INCREMENT_REVIEW','assetsReassessed':13,'monetaryReferencesChanged':9,'assetAdditions':0,'unchangedAssetPrices':96,'otherAssetRecordsRetained':92,
            'unchangedCommercialFactors':True,'softwareMaturityChanged':0,'assets':records,'previousPortfolio':old_portfolio,'currentPortfolio':copy.deepcopy(portfolio),
            'sourceRegister':'assets/valuation-sources.json','costAssumptionsDocument':DOC,'recreationIncrementEUR':total_inc,'askingReferenceChangeEUR':ask_delta,
            'unchangedReviewedReferences':['TA-IP-007','TA-IP-036','TA-IP-083','TA-IP-097'],
            'boundary':'Existing implemented work is separately estimated against explicit earlier and current sources. Elapsed days and version numbers are not pricing multipliers. Role effort, rates, allowance, rounding and seller asking proportions remain assumptions. No independent market-value increase is established. No product tests were rerun by this pricing review.'}
    sources['previousReviewSummary']=copy.deepcopy(sources['reviewSummary']);sources['reviewSummary'].update(monetaryReferencesChanged=9,askingReferencesRetained=96,recreationAnchorsRetained=96,projectsWithDisclosedWorkPackages=23)
    sources['reviewSummary']['costEvidenceCounts']=dict(Counter(r['costEvidence']['status'] for r in sources['projects']))
    sources.update(reviewedAt=AT,latestIncrementReview=review,catalogueUpdatedAt=AT)
    sources['scope']='All 105 source/financial decisions remain available. The new targeted review budgets and reprices nine implemented increments, checks four unchanged renamed projects and retains the other amounts. Original evidence dates and current versus priced-source scope remain separate.'
    values['assessedAt']=AT;values['scope']=sources['scope'];values['latestIndividualPricing']=review
    method['portfolio']=copy.deepcopy(portfolio);method['sourceTransparency'].update(reviewedAt=AT,summary=sources['reviewSummary'],boundary=review['boundary'])
    method['rebuildCostCalibration']['latestReviewBoundary']=review['boundary']
    evals['previousSummary']=copy.deepcopy(evals['summary']);evals['summary'].update(monetaryReferencesChanged=9,previousSellerAskEUR=old_portfolio['sellerAskEUR'],currentSellerAskEUR=portfolio['sellerAskEUR'],previousReplacementCostEUR=old_portfolio['replacementCostEUR'],currentReplacementCostEUR=portfolio['replacementCostEUR'],targetedAssetsReviewed=13,otherAssetRecordsRetained=92,reviewOutcomes={'INCREMENT_REPRICED':9,'REFERENCE_REVIEWED':96},boundary=review['boundary'])
    for name,data in [('valuation-register.json',values),('economic-methodology.json',method),('project-presentations.json',pres),('project-evaluations.json',evals)]:
        data['previousFinancialReassessment']=data['latestFinancialReassessment'];data['latestFinancialReassessment']=review;data['catalogueUpdatedAt']=AT;save(name,data)
    save('valuation-sources.json',sources)
    recreation.update(primaryRegisterRecreationCostEUR=sum(recreation['assets']),currentPortfolioRecreationCostEUR=portfolio['replacementCostEUR'],catalogueUpdatedAt=AT)
    for name,data in [('im-data.json',raw),('recreation-costs.json',recreation),('supplemental-assets.json',supp),('independent-assets.json',extra)]:save(name,data)
    future=load('future-economic-references.json')
    for f in future['projects']:
        if f['ref'] not in CONFIG:continue
        v=by_ref[f['ref']];f['currentReplacementCostEUR']=v['replacementCostEUR'];f['economicAssessmentAt']=AT
        if f['status']=='CONDITIONAL':
            f['currentTriangulatedEconomicReferenceEUR']=v['triangulatedEconomicReferenceEUR'];target=economic(v,assets[f['ref']],method,f['targetStage'])['triangulatedEconomicReferenceEUR'];f['milestoneConditionedEconomicReferenceEUR']=target;f['sensitivityDeltaEUR']=target-v['triangulatedEconomicReferenceEUR']
    future['latestIncrementReview']={'reviewedAt':AT,'affectedProjects':9,'boundary':'Only the current cost anchor changed; future references remain maturity-only scenarios, not future prices.'};save('future-economic-references.json',future)
    for name in ['seller-readiness-register.json','ip-ownership-register.json','rights-transfer-register.json']:
        data=load(name)
        for p in data['projects']:
            if p['ref'] not in CONFIG:continue
            p['financialReferencesReviewedAt']=AT
            if 'sellerAskEUR' in p:p['sellerAskEUR']=by_ref[p['ref']]['sellerAskEUR']
            p['pricedDeliverySnapshot']=pmap[p['ref']]['pricedDevelopmentSnapshot']
        data['latestFinancialReferenceCorrection']={'assessedAt':AT,'projects':list(CONFIG),'document':DOC,'qualificationGradesChanged':0};data['catalogueUpdatedAt']=AT;save(name,data)
    audit=load('portfolio-audit-certificate.json')
    for key in list(audit['economics']):
        if key in portfolio:audit['economics'][key]=portfolio[key]
    audit['latestFinancialReassessment']=review;audit['catalogueUpdatedAt']=AT;save('portfolio-audit-certificate.json',audit)
    att=load('public-attestation.json');att['version']='2026.10.16-im76-development-value';att['latestFinancialReassessment']=review;att['latestIndividualPricingAt']=AT;att['catalogueUpdatedAt']=AT;att['purpose']='Verify 105 project references and the source-bound financial correction for nine implemented increments. Current documentation, explicitly priced development snapshots and retained product qualification remain separate.';save('public-attestation.json',att)
    with (AS/'valuation-review.csv').open('w',newline='',encoding='utf-8-sig') as file:
        writer=csv.writer(file,lineterminator='\n');writer.writerow(['Reference','Project','Review date','Current main','Separate development','Priced version','Cost evidence','Seller ask EUR','Recreation anchor EUR','Asking change EUR','Recreation increment EUR','Comparable-sale valuation','Income valuation','Decision'])
        changes={r['ref']:r for r in records}
        for r in sources['projects']:
            f=r['financialReference'];c=changes.get(r['ref'],{});writer.writerow([r['ref'],r['title'],r['reviewedAt'],r['source']['currentVersion'],r['source']['separateDevelopmentVersion'],f.get('pricedVersion'),r['costEvidence']['status'],f['sellerAskEUR'],f['replacementCostEUR'],c.get('askingReferenceChangeEUR',0),c.get('recreationIncrementEUR',0),r['marketTransactionValuation'],r['incomeValuation'],r['decision']])
    print(json.dumps({'reviewed':13,'repriced':9,'askingReferenceChangeEUR':ask_delta,'recreationIncrementEUR':total_inc,'portfolioAskEUR':portfolio['sellerAskEUR'],'portfolioRecreationEUR':portfolio['replacementCostEUR'],'costEvidenceCounts':sources['reviewSummary']['costEvidenceCounts'],'assets':[{'ref':r['ref'],'askBefore':r['previousSellerAskEUR'],'askAfter':r['currentSellerAskEUR'],'recreationIncrementEUR':r['recreationIncrementEUR']} for r in records]},indent=2))

if __name__=='__main__':main()
