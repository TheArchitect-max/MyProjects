#!/usr/bin/env python3
"""Publish the bounded, source-linked review of all retained seller references.

No price is inferred from version numbers, file counts or contextual rate sources.
Run once against the preceding 16 October catalogue publication.
"""
from pathlib import Path
from collections import Counter, defaultdict
import csv
import copy
import json

ROOT = Path(__file__).resolve().parents[1]
AS = ROOT / 'assets'
AT = '2026-10-16T07:06:02Z'
DATE = AT[:10]
DOC = 'docs/MULTISOURCE_VALUATION_REVIEW_2026-10-16.md'

def load(name):
    return json.loads((AS / name).read_text())

def save(name, data):
    (AS / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def main():
    values = load('valuation-register.json')
    assert values.get('latestFinancialReassessment', {}).get('type') != 'FULL_PORTFOLIO_MULTISOURCE_REVIEW', 'Already applied'
    method = load('economic-methodology.json')
    sources = load('valuation-sources.json')
    presentation = load('project-presentations.json')
    evaluations = load('project-evaluations.json')
    identities = {p['ref']: p for p in load('project-identities.json')['projects']}
    pmap = {p['ref']: p for p in presentation['projects']}
    emap = {p['ref']: p for p in evaluations['projects']}
    readiness = {p['ref']: p for p in load('seller-readiness-register.json')['projects']}
    calibration = method['rebuildCostCalibration']
    packages = defaultdict(list)
    for collection in ['workPackageEstimates', 'incrementalWorkPackageEstimates']:
        for index, budget in enumerate(calibration[collection]):
            item = copy.deepcopy(budget)
            item['methodologyPath'] = f'rebuildCostCalibration.{collection}[{index}]'
            item['coverage'] = 'INCREMENT_ONLY' if collection.startswith('incremental') or budget.get('adoptedRecreationIncrementEUR') else 'BASE_SCOPE'
            # These are the original disclosed assumptions, never a fresh quote.
            packages[item['ref']].append(item)

    boundary = ('Documentary and financial-reference review of all 105 independent projects using the frozen repository documentation, '
                'retained qualification/transfer records, disclosed cost assumptions and external method/rate context. '
                'No project tests were rerun. No independent market appraisal, comparable sale or project cash-flow valuation is established. '
                'All seller asking references, negotiation ranges, recreation anchors and model factors are retained. '
                'Current source scope is not automatically included in an older cost budget; a delivery-specific re-estimate remains required.')
    reviews = []
    for value in sorted(values['updates'], key=lambda x: x['ref']):
        ref = value['ref']; p = pmap[ref]; e = emap[ref]; identity = identities[ref]; r = readiness[ref]
        source = p['catalogueSourceReview']
        dated = value.get('financialReferencesReviewedAt') or p.get('economicAssessmentAt') or e.get('financialReferencesReviewedAt') or e.get('assessedAt')
        work = packages[ref]
        base = [b for b in work if b['coverage'] == 'BASE_SCOPE']
        increments = [b for b in work if b['coverage'] == 'INCREMENT_ONLY']
        disclosed = sum(b.get('adoptedRecreationCostEUR', b.get('adoptedRecreationIncrementEUR', 0)) for b in work)
        # Matching sums establish arithmetic coverage only, not effort or delivery acceptance.
        complete = bool(base) and disclosed == value['replacementCostEUR']
        cost_status = 'BASE_AND_INCREMENT_BUDGETS_RECONCILE' if complete else 'PARTIAL_WORK_PACKAGE_BASIS' if work else 'LEGACY_COST_REFERENCE_ONLY'
        cost_note = ('Disclosed base/increment assumptions reconcile to the retained recreation anchor. Effort remains an analyst estimate for its original scope.' if complete else
                     'Some dated work-package assumptions are disclosed, but they do not reconstruct the complete retained recreation anchor. A complete scope-specific budget is required.' if work else
                     'The retained recreation anchor has no explicit per-role work-package budget in the current methodology register. It remains a low-confidence seller estimate requiring reconstruction before reliance.')
        decision_note = (f"Retain the existing EUR {value['sellerAskEUR']:,} seller ask and EUR {value['replacementCostEUR']:,} recreation anchor. "
                         f"Reviewed main: {p.get('currentVersion') or 'no semantic version established'}. "
                         'A documentation/version update is not evidence of an agreed deliverable or a market-price change. '
                         + cost_note)
        review = {
            'ref': ref, 'slug': p['slug'], 'title': p['title'], 'reviewedAt': AT,
            'reviewType': 'DOCUMENTARY_AND_FINANCIAL_REFERENCE_REVIEW',
            'decision': 'RETAIN_REFERENCE_PENDING_DELIVERY_SPECIFIC_REESTIMATE',
            'decisionNote': decision_note,
            'source': {'repository': identity['repository'], 'repositoryId': identity['repositoryId'],
                       'defaultBranch': source['defaultBranch'], 'head': source['head'], 'readmeBlobSha': source['readmeBlobSha'],
                       'documentationReviewedAt': source['reviewedAt'], 'currentVersion': p.get('currentVersion'),
                       'separateDevelopmentVersion': p.get('developmentVersion'), 'productTestsExecutedForThisReview': False},
            'currentScopeNote': p['statusNote'],
            'financialReference': {'originalReferenceReviewedAt': dated, 'pricedSourceHead': value.get('sourceHead'),
                                   'pricedSourceHeadStatus': 'RECORDED' if value.get('sourceHead') else 'NOT_RECORDED_IN_FINANCIAL_REGISTER',
                                   'sellerAskEUR': value['sellerAskEUR'], 'negotiationLowEUR': value['negotiationLowEUR'],
                                   'negotiationHighEUR': value['negotiationHighEUR'], 'replacementCostEUR': value['replacementCostEUR'],
                                   'currentDocumentationAutomaticallyRepriced': False},
            'costEvidence': {'status': cost_status, 'confidence': 'SELLER_ASSUMPTION_NOT_INDEPENDENTLY_VERIFIED' if complete else 'LOW',
                             'note': cost_note, 'disclosedWorkPackageCount': len(work), 'disclosedAdoptedAmountsEUR': disclosed,
                             'completeAnchorReconstructedFromDisclosedBudgets': complete,
                             'workPackages': [{'methodologyPath': b['methodologyPath'], 'coverage': b['coverage'],
                                               'basisDate': b.get('economicAssessmentAt'), 'scope': b['scope'],
                                               'sourceHead': b.get('sourceHead')} for b in work]},
            'externalSourceIds': ['WIPO-COST', 'KNAB-2026', 'UPWORK-RATES'],
            'sourceRoles': ['Current first-party scope documentation', 'Retained dated qualification and transfer conditions',
                            'Disclosed seller cost/price assumptions', 'External method and contractor-rate context'],
            'marketTransactionValuation': 'NOT_ESTABLISHED', 'incomeValuation': 'NOT_ESTABLISHED',
            'independentAppraisal': 'NOT_ESTABLISHED', 'scenarioIndependence': 'CORRELATED_RECREATION_ANCHOR',
            'transactionReadiness': r['transactionReadiness'], 'openTransferConditions': r.get('openSellerItems', []),
            'retainedQualificationAssessedAt': r.get('readinessAssessment', {}).get('sourceEvidenceAssessedAt') or r.get('assessedAt'),
            'exclusions': ['Unmerged development is not automatically part of the priced main baseline.',
                           'Future work, production operation, hardware and unperformed qualification are excluded.',
                           'Third-party rights, datasets, media and model weights retain their own terms.',
                           'Revenue, comparable-sale value and guaranteed buyer savings are not established.'],
        }
        if ref == 'TA-IP-106':
            review['exclusions'].append('Later staged Style Studio documents do not establish full repository delivery of the later application; its source is excluded from the v0.1 price.')
        reviews.append(review)
        value['financialReferencesReviewedAt'] = AT
        value['financialReviewDecision'] = review['decision']
        value['financialReviewSource'] = 'assets/valuation-sources.json#' + ref
        value['costEvidenceStatus'] = cost_status
        value['originalFinancialReferenceReviewedAt'] = dated
        for record in [p, e]:
            record['financialReferencesReviewedAt'] = AT
            record['valuationReview'] = {'reviewedAt': AT, 'decision': review['decision'], 'costEvidenceStatus': cost_status,
                                        'sourceRegister': 'assets/valuation-sources.json', 'document': DOC,
                                        'originalFinancialReferenceReviewedAt': dated}
        p['previousEvaluationDate'] = p['evaluationDate']
        p['evaluationDate'] = DATE; p['evaluationTimestamp'] = AT
        p['evaluationResult'] = 'REFERENCE_REVIEWED'
        p['evaluationNote'] = decision_note
        e['previousAssessmentDate'] = e['assessmentDate']
        e['assessmentDate'] = DATE; e['assessedAt'] = AT
        e['reviewResult'] = 'REFERENCE_REVIEWED'; e['reviewNote'] = decision_note
        e['evidenceBoundary'] = boundary
        e['previousSellerAskEUR'] = e['sellerAskEUR'] = value['sellerAskEUR']
        e['previousReplacementCostEUR'] = e['replacementCostEUR'] = value['replacementCostEUR']
        e['monetaryEstimateChanged'] = False

    counts = Counter(p['costEvidence']['status'] for p in reviews)
    summary = {'projectsReviewed': 105, 'uniqueProjectReferences': 105, 'monetaryReferencesChanged': 0,
               'askingReferencesRetained': 105, 'recreationAnchorsRetained': 105,
               'costEvidenceCounts': dict(counts), 'projectsWithDisclosedWorkPackages': sum(bool(p) for p in packages.values()),
               'marketTransactionValuationsEstablished': 0, 'incomeValuationsEstablished': 0,
               'independentAppraisalsEstablished': 0, 'productTestsExecuted': 0,
               'projectSites': 105, 'publicationRepositoriesExcludedFromValuation': 2}
    sources['previousScope'] = sources['scope']
    sources.update({'schema':'valuation-sources-2.0', 'reviewedAt':AT, 'catalogueUpdatedAt':AT,
                    'title':'Full portfolio source and financial-reference review', 'scope':boundary,
                    'reviewSummary':summary, 'projects':reviews})
    for source in sources['sources']:
        source['previousReviewedAt'] = source['reviewedAt']; source['reviewedAt'] = AT
        source['verification'] = 'PRIMARY_PAGE_RETRIEVED'
    upwork = next(s for s in sources['sources'] if s['id'] == 'UPWORK-RATES')
    upwork['previousFinding'] = upwork['finding']; upwork['originalCostPageUrl'] = upwork['url']
    upwork.update({'url':'https://www.upwork.com/hire/software-developers/',
                   'finding':'The primary-publisher search result reports a global USD 10-100/hour software-developer range. The cost and category pages returned HTTP 403 during this review; the prior expert-tier detail was not freshly verified.',
                   'application':'Limited contextual cross-check only; no expert-tier premium, currency-converted role rate or asset value is inferred from this source.',
                   'verification':'PRIMARY_PUBLISHER_SEARCH_RESULT_ONLY_PAGE_BLOCKED'})
    sources['sources'].append({'id':'ECB-FX','publisher':'European Central Bank','title':'Euro reference exchange rate - US dollar',
                              'url':'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html',
                              'reviewedAt':AT,'type':'DISPLAY_CURRENCY_ONLY','verification':'PRIMARY_PAGE_RETRIEVED',
                              'finding':'Latest available dated observation at review: 15 October 2026, EUR 1 = USD 1.1208. No 16 October observation was published in the retrieved table.',
                              'application':'Indicative USD display conversion only; authoritative project references remain in EUR.'})
    sources['displayCurrency'] = {'base':'EUR','quote':'USD','rate':1.1208,'date':'2026-10-15','sourceId':'ECB-FX'}
    sources['assumptions'] += [
        'No per-project hours are reverse-engineered from a published price and presented as independently estimated effort.',
        'Missing whole-project work budgets and missing price-basis source heads are explicitly reported, not inferred from current README files.',
        'All four model lenses share the same recreation anchor. Their weighted blend is an internal sensitivity, not independent triangulation.',
    ]
    review = {'assessedAt':AT,'type':'FULL_PORTFOLIO_MULTISOURCE_REVIEW','assetsReassessed':105,'monetaryReferencesChanged':0,
              'assetAdditions':0,'unchangedAssetPrices':105,'otherAssetRecordsRetained':0,'unchangedCommercialFactors':True,
              'softwareMaturityChanged':0,'assets':[],'previousPortfolio':copy.deepcopy(values['portfolio']),
              'currentPortfolio':copy.deepcopy(values['portfolio']),'sourceRegister':'assets/valuation-sources.json',
              'costAssumptionsDocument':DOC,'summary':summary,'boundary':boundary}
    values['previousValuationBasisDate'] = values['valuationBasisDate']; values['valuationBasisDate'] = DATE
    values['assessedAt'] = AT; values['scope'] = boundary
    values['portfolio']['monetaryScope'] = '105 independent project references, reviewed individually on 16 October 2026. Seller asks and cost anchors retained; two publication repositories excluded. No independent market or income valuation established.'
    evaluations['previousBasisDate'] = evaluations['basisDate']; evaluations['basisDate'] = DATE; evaluations['assessedAt'] = AT
    evaluations['previousSummary'] = copy.deepcopy(evaluations['summary'])
    evaluations['summary'].update({'projectsReviewed':105,'ipAssetsEvaluated':105,'reviewOutcomes':{'REFERENCE_REVIEWED':105},
                                   'monetaryReferencesChanged':0,'previousSellerAskEUR':values['portfolio']['sellerAskEUR'],
                                   'currentSellerAskEUR':values['portfolio']['sellerAskEUR'],
                                   'previousReplacementCostEUR':values['portfolio']['replacementCostEUR'],
                                   'currentReplacementCostEUR':values['portfolio']['replacementCostEUR'],
                                   'targetedAssetsReviewed':0,'newAssetsEvaluated':0,'otherAssetRecordsRetained':0,'boundary':boundary})
    presentation['assessedAt'] = AT
    method['definitions'].update({
        'marketComparableProxy':'Marketability-weighted internal cost scenario. No observed comparable IP transaction is used.',
        'incomeLicensingProxy':'Monetization-weighted internal cost scenario. No project revenue, cash-flow forecast, DCF or royalty valuation is established.',
        'triangulatedEconomicReference':'Weighted internal cost-scenario blend. Shared inputs make the scenarios correlated; this is not independent triangulation or certified market value.'})
    calibration['approach'] = 'Retained seller cost anchors, reviewed against source scope and individually classified for disclosed work-budget coverage. No new effort budget is invented where it is absent.'
    calibration['latestReviewBoundary'] = boundary
    method['sourceTransparency'] = {'reviewedAt':AT,'sourceRegister':'assets/valuation-sources.json','summary':summary,'boundary':boundary}
    review['currentPortfolio'] = copy.deepcopy(values['portfolio'])
    for name, data in [('valuation-register.json',values),('economic-methodology.json',method),('project-evaluations.json',evaluations),('project-presentations.json',presentation)]:
        if 'latestFinancialReassessment' in data:
            data['previousFinancialReassessment'] = data['latestFinancialReassessment']
        data['latestFinancialReassessment'] = review; data['catalogueUpdatedAt'] = AT
        save(name,data)
    save('valuation-sources.json',sources)
    # Scope/date synchronization without rewriting historical qualification evidence.
    for name in ['recreation-costs.json','future-economic-references.json','portfolio-audit-certificate.json','project-connections.json']:
        data = load(name)
        if name == 'project-connections.json': data['priceBasisDate'] = DATE
        elif name == 'recreation-costs.json': data['valuationBasisDate'] = DATE
        else: data['previousBasisDate'] = data['basisDate']; data['basisDate'] = DATE
        data['latestMultisourceValuationReview'] = {'reviewedAt':AT,'sourceRegister':'assets/valuation-sources.json','boundary':boundary}
        data['catalogueUpdatedAt'] = AT
        save(name,data)
    data=load('im-data.json'); data['fx']=[1.1208,'2026-10-15']; save('im-data.json',data)
    with (AS/'valuation-review.csv').open('w',newline='',encoding='utf-8-sig') as file:
        writer=csv.writer(file,lineterminator="\n"); writer.writerow(['Reference','Project','Review date','Current main','Separate development','Cost evidence','Seller ask EUR','Recreation anchor EUR','Original reference date','Comparable-sale valuation','Income valuation','Decision'])
        for r in reviews:
            f=r['financialReference'];writer.writerow([r['ref'],r['title'],DATE,r['source']['currentVersion'],r['source']['separateDevelopmentVersion'],r['costEvidence']['status'],f['sellerAskEUR'],f['replacementCostEUR'],f['originalReferenceReviewedAt'],r['marketTransactionValuation'],r['incomeValuation'],r['decision']])
    print(json.dumps(summary,indent=2))

if __name__ == '__main__': main()
