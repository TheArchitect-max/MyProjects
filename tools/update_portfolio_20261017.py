#!/usr/bin/env python3
"""Apply the source-frozen 17 October portfolio review to the preceding publication.

Inputs are locally retained connector receipts. Private source is never copied into
the public portfolio. Cost hours below are disclosed analyst assumptions.
"""
from pathlib import Path
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
import copy, csv, hashlib, importlib.util, json, math, re, shutil

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT.parent
AS=ROOT/'assets'
AT='2026-10-17T06:30:00Z'
DATE=AT[:10]
DOC='docs/PORTFOLIO_REEVALUATION_2026-10-17.md'
VERSION='2026.10.17-im77-full-review'
OLD_SLUG='sensor-fusion-digital-twin-engine'
NEW_SLUG='universal-sensor-fusion-digital-twin-intelligence-platform'
NEW_TITLE='Universal Sensor Fusion & Digital Twin Intelligence Platform'

CONFIG={
 'TA-IP-003':dict(version='1.9.1',before='1.3.0',hours=[64,80,56],
  packages=['Evidence custody, guarded infrastructure qualification and benchmark repairs','Alibaba/Azure trace adapters, full coverage and sensitivity tooling','Outcome-label contracts, leakage controls, regression and transfer documentation'],
  finding='Adds hash-bound evidence custody, guarded local infrastructure qualification, Alibaba/Azure measured-trace adapters, full-trace sensitivity and operational outcome/readiness contracts.',
  limitation='Measured external workloads remain separate from simulated controller responses. Operational calibration on genuinely labeled outcomes, environment-specific acceptance and production deployment remain open. v1.9.1 is a metadata/transfer patch over the v1.9 functional baseline.',
  evidence='All 92 Git blobs verified. Eleven repository-native static gates passed, including parsing 61 Python files. Full dependency-based tests and external-data campaigns were not rerun.',
  next='Freeze and accept an exact delivery; run the full dependency-based suite and qualify measured, labeled outcomes in the intended environment.'),
 'TA-IP-025':dict(version='1.8.0',before='1.5.0',hours=[48,64,48],
  packages=['Single-writer coordination, fencing, runtime and install hardening','Transparent decision layer and heterogeneous telemetry alignment','Replay/provenance, regression checks and transfer documentation'],
  finding='Adds coordinated single-writer runtime, fencing/idempotency controls, transparent scenario decisions and deterministic multi-source telemetry alignment with replayable provenance.',
  limitation='The separate v1.8.1 hardening PR is unmerged and excluded from the v1.8.0 cost scope. Domain calibration, physical sensor accuracy and production acceptance remain open.',
  evidence='All 60 Git blobs verified; 73 local Python tests passed on the exact v1.8.0 snapshot. This is software testing, not physical-system or production certification.',
  next='Review the separate v1.8.1 hardening candidate, then qualify representative domain telemetry and recipient deployment conditions.'),
 'TA-IP-107':dict(id=107,repository='Universal-Property-Intelligence-Platform',slug='universal-property-intelligence-platform',title='Universal Property Intelligence Platform',alias='Vesta',version='0.1.0',family='specialist-verticals',sector='Enterprise, Web & Commerce',route='Private deployment / enterprise licensing',hours=[44,40,36],
  packages=['Property hierarchy, evidence registry and validation contracts','Deterministic replacement-cost, graph, CLI and exports','Synthetic fixtures, regression, documentation and handover'],
  description='Organise property, room and asset evidence, distinguish observed facts from assumptions, and prepare traceable replacement-cost summaries.',
  finding='A standard-library property evidence core with hierarchy, observed/declared/inferred records, deterministic low/base/high replacement estimates, condition/risk fields, graph and JSON/CSV exports.',
  limitation='No automatic extraction from photographs/video, certified property appraisal, verified insurance value, production integration or real-property accuracy is established. Reference Property 001 is synthetic demonstration evidence.',
  evidence='All 30 Git blobs verified; all 7 local Python tests passed on the exact v0.1.0 snapshot.',
  next='Qualify realistic, permissioned property evidence, strengthen hash/ontology checks and agree rights and recipient acceptance.',
  functions=['Record property, floor, room, asset and supporting evidence','Keep observed, declared and inferred statements distinct','Calculate supplied-rate replacement-cost ranges','Export asset graphs, summaries and JSON/CSV packages'],
  buyers=['Property documentation software teams','Insurance evidence specialists','Facilities and estate inventory teams'],outputs=['Property evidence registers','Replacement-cost summaries','Asset graphs and JSON/CSV exports']),
 'TA-IP-108':dict(id=108,repository='Visual-Effects-Spatial-Computing-Platform',slug='visual-effects-spatial-computing-platform',title='Visual-Effects-Spatial-Computing-Platform',alias='Asteria',version='0.2.0',family='visual-multimodal',sector='Media & Creator Technology',route='Media / creator software',hours=[76,64,40],
  packages=['Standalone scene/layer editor, timeline and validated project files','Typed deterministic graph engine and integrated graph editor','Model/graph/server checks, security bounds and delivery documentation'],
  description='Create local 2D scenes, animate layer properties and drive visual effects with a bounded node graph.',
  finding='An independent local 2D Canvas editor with shape/text layers, timeline/keyframes, validated JSON import/export and a typed deterministic visual-effect graph.',
  limitation='R1 is a development alpha. Full browser interaction acceptance, hardware camera checks, genuine 3D, AR/VR/XR, computer vision, physics, AI, video encoding and production packaging remain open. Architectural isolation is mandatory: no integration or shared code with other portfolio projects.',
  evidence='All 24 Git blobs verified; 24 JavaScript model/graph tests and 5 Python policy/server tests passed. Browser GUI/device acceptance was not rerun.',
  next='Perform source-pinned browser GUI acceptance and continue the independent roadmap with explicit device and export gates.',
  functions=['Edit shape and text layers in a local 2D scene','Animate transforms and opacity with keyframes','Connect typed nodes to bounded layer outputs','Import/export validated project JSON'],buyers=['Visual authoring software teams','Creative-tool developers','Interactive media R&D teams'],outputs=['Editable scene projects','Timeline/keyframe data','Typed visual-effect graphs']),
 'TA-IP-109':dict(id=109,repository='Narrative-Collectibles-Platform',slug='narrative-collectibles-platform',title='Narrative Collectibles Platform',alias='Scheherazade',version='0.4.0',family='enterprise-web-commerce',sector='Enterprise, Web & Commerce',route='Private deployment / enterprise licensing',hours=[88,78,62,52],
  packages=['Transactional collectible/edition registry, local API and studio','Narrative continuity, fictional world graph and deterministic replay','Keyed assurance checkpoints, custody, backup and cold recovery','Concurrency/tamper regressions, instructions and handover'],
  description='Register object-independent collectibles, keep fictional narratives separate from physical facts, and review editions, evidence and local integrity records.',
  finding='An object-independent local SQLite registry and studio with edition limits, narrative checks, fictional world graph, deterministic replay, keyed checkpoints, evidence custody and verified backup/restore.',
  limitation='No public commerce, payments, shipping, production accounts or hosted deployment is delivered. HMAC is keyed local integrity, not independently witnessed ownership or certified provenance. Lithonarra is a separate consumer application/brand; physical stock and fictional content rights are not automatically transferred with the software.',
  evidence='All 40 Git blobs verified; all 84 local Python tests passed on the exact R3/v0.4.0 snapshot, including concurrency, tamper rejection and recovery cases.',
  next='Complete domain and operator acceptance, key/anchor custody and the final security, legal and operational production gates.',
  functions=['Maintain object, collection and edition identities','Review fictional narrative continuity separately from facts','Replay fictional world and timeline changes','Verify keyed checkpoints and evidence custody','Create and verify local backup/recovery packages'],buyers=['Collectible registry software teams','Narrative product studios','Independent collection operators'],outputs=['Edition and object records','Fictional world/event histories','Issuer records and integrity receipts','Verified local recovery packages'])
}

def load(name): return json.loads((AS/name).read_text())
def save(name,data): (AS/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def round500(v): return int((Decimal(str(v))/500).quantize(Decimal('1'),rounding=ROUND_HALF_UP)*500)
def economic(v,a,m,stage=None):
 f=m['factors']; rep=v['replacementCostEUR']; s=stage or v['stage']; p=v['potential']; sc=f['sectorContext'].get(a['sector'],1); rt=f['routeMonetization'].get(a['route'],1)
 jr=lambda n:math.floor(n+.5)
 market=jr(rep*f['marketPotential'][p]*f['marketMaturity'][s]*sc);income=jr(rep*f['incomePotential'][p]*f['incomeMaturity'][s]*rt)
 strategic=jr(rep*f['strategicOpportunityMultiplier'][p]*f['technicalCompletionProbability'][s]*f['commercializationProbability'][p]*f['rightsTransferDiligenceReserve']*f['timeRisk'][s]*sc)
 w=f['triangulationWeights'];tri=jr(rep*w['replacementCost']+market*w['marketComparableProxy']+income*w['incomeLicensingProxy']+strategic*w['probabilityAdjustedStrategicValue'])
 return dict(marketComparableProxyEUR=market,incomeLicensingProxyEUR=income,probabilityAdjustedStrategicValueEUR=strategic,triangulatedEconomicReferenceEUR=tri,askShareOfTriangulated=v['sellerAskEUR']/tri)

def main():
 names=[p.name for p in AS.glob('*.json')];data={n:load(n) for n in names}
 values=data['valuation-register.json'];assert values['portfolio']['assetCount']==105,'Apply once to the preceding publication'
 old_portfolio=copy.deepcopy(values['portfolio']);method=data['economic-methodology.json'];sources=data['valuation-sources.json'];ids=data['project-identities.json'];pres=data['project-presentations.json'];ev=data['project-evaluations.json'];ready=data['seller-readiness-register.json']
 source_rows=json.loads((WORK/'sources-20261017.json').read_text());byrepo={r['repository']:r for r in source_rows};byid={r['id']:r for r in source_rows};trees={r['repository']:r for r in json.loads((WORK/'trees-20261017.json').read_text())}
 original_ids=copy.deepcopy(ids['projects']);original_values=copy.deepcopy(values['updates'])
 # Canonical route/title migration; historical documents remain untouched.
 def rename(x):
  if isinstance(x,dict):return {(NEW_SLUG if k==OLD_SLUG else k):rename(v) for k,v in x.items()}
  if isinstance(x,list):return [rename(v) for v in x]
  if isinstance(x,str):return x.replace(OLD_SLUG,NEW_SLUG).replace('Sensor Fusion Digital Twin Engine',NEW_TITLE).replace('Sensor-Fusion-Digital-Twin-Engine','Universal-Sensor-Fusion-Digital-Twin-Intelligence-Platform')
  return x
 for name in names:data[name]=rename(data[name])
 values=data['valuation-register.json'];method=data['economic-methodology.json'];sources=data['valuation-sources.json'];ids=data['project-identities.json'];pres=data['project-presentations.json'];ev=data['project-evaluations.json'];ready=data['seller-readiness-register.json']
 for ref,c in CONFIG.items():
  if 'id' not in c:continue
  r=byrepo[c['repository']]
  ids['projects'].append(dict(id=c['id'],ref=ref,repository=c['repository'],repositoryId=r['id'],slug=c['slug'],title=c['title'],identityName=c['alias'],existingCanonical=True,independentIpAsset=True,scopeUpdatedAt=AT,referenceAliasAssignment='PORTFOLIO_REFERENCE_ONLY'))
 idmap={p['ref']:p for p in ids['projects']};pmap={p['ref']:p for p in pres['projects']};vmap={v['ref']:v for v in values['updates']};emap={e['ref']:e for e in ev['projects']};rmap={r['ref']:r for r in ready['projects']};smap={r['ref']:r for r in sources['projects']}
 raw=data['im-data.json'];supp=data['supplemental-assets.json'];extra=data['independent-assets.json'];recreation=data['recreation-costs.json']
 assetmap={x[1]:dict(sector=raw['s'][x[4]],route=raw['r'][x[7]]) for x in raw['a']};assetmap.update({x['ref']:x for x in supp['assets']+extra['assets']})
 for ref,c in CONFIG.items():
  if 'id' in c:
   pmap[ref]=dict(ref=ref,slug=c['slug'],title=c['title'],description=c['description'],currentVersion=c['version'],developmentVersion=None,implemented=True,countsAsIpAsset=True,independentIpAsset=True,valuationStage='P',statusLabel='Developed prototype; local acceptance scope',statusNote=c['finding']+' '+c['evidence']+' '+c['limitation'],nextMilestone=c['next'],lastUpdated=DATE)
   pres['projects'].append(pmap[ref]);assetmap[ref]=c
   vmap[ref]=dict(ref=ref,slug=c['slug'],name=c['title'],stage='P',potential='M',description=c['description'],sellerAskEUR=0,negotiationLowEUR=0,negotiationHighEUR=0,replacementCostEUR=0)
   values['updates'].append(vmap[ref])
   extra['assets'].append(dict(id=c['id'],ref=ref,slug=c['slug'],name=c['title'],familyId=c['family'],sector=c['sector'],route=c['route'],stage='P',potential='M',description=c['description'],independentIpAsset=True,pricingStatus='SELLER_SIDE_ESTIMATE_ESTABLISHED'))
  else:
   pmap[ref].update(currentVersion=c['version'],statusNote=c['finding']+' '+c['evidence']+' '+c['limitation'],reviewNote=c['evidence'],nextMilestone=c['next'],lastUpdated=DATE,statusLabel='Developed software; bounded reference qualification')
 pmap['TA-IP-025']['developmentVersion']='1.8.1 — unmerged hardening candidate; excluded from current price'
 boundary=('All 108 projects receive a fresh repository-documentation and financial-reference decision. 103 existing main heads are unchanged; two existing implementations and three new projects are examined in full-byte snapshots. '
           'Costs are seller-side reproduction assumptions, not actual spending or established market value. New budgets select an explicit low-effort working scenario; older retained anchors do not thereby become independently verified lower bounds. '
           'Current main, unmerged candidates, retained qualification and future objectives remain distinct.')
 review_records=[]
 for ref,c in CONFIG.items():
  identity=idmap[ref];r=byid[identity['repositoryId']];v=vmap[ref];p=pmap[ref];old=copy.deepcopy(v)
  hours=sum(c['hours']);direct=hours*94;total=round(direct*1.15,2);adopted=int(total//500)*500
  new='id' in c;cost=adopted if new else old['replacementCostEUR']+adopted
  share=.3 if new else old['sellerAskEUR']/old['replacementCostEUR'];ask=round500(cost*share)
  low=round500(ask*(.8 if new else old['negotiationLowEUR']/old['sellerAskEUR']));high=round500(ask*(1.25 if new else old['negotiationHighEUR']/old['sellerAskEUR']))
  budget=dict(ref=ref,sourceHead=r['head'],pricedVersion=c['version'],sourceScope='DEFAULT_BRANCH',economicAssessmentAt=AT,scope=c['finding'],workPackages=[dict(scope=s,lowEffortHours=h) for s,h in zip(c['packages'],c['hours'])],assumedHours=hours,hourlyRateEUR=94,rateSource='KNAB-2026',rawEngineeringCostEUR=direct,coordinationToolingAllowance=.15,withAllowanceEUR=total,adoptedRecreationCostEUR=cost if new else None,adoptedRecreationIncrementEUR=None if new else adopted,selectedScenario='LOW_EFFORT_WORKING_ESTIMATE',rounding='DOWN_TO_EUR_500',effortAlternatives=dict(lowHours=hours,referenceHours=hours*1.5,extendedHours=hours*2,lowCostEUR=total,referenceCostEUR=round(total*1.5,2),extendedCostEUR=round(total*2,2)),boundary='Hours and the 15% allowance are analyst assumptions for bounded reproduction with modern tooling. EUR 94 is a Dutch mean, not a minimum rate or a contractor quote. This is the lowest of the explicitly scoped working scenarios, not an absolute market or cost floor.',exclusions=[c['limitation'],'Previously priced base scope is not counted again.','Future features, independent certification, physical stock, third-party ownership, hosting and revenue are excluded.'])
  note=(f"New present-source low-effort recreation reference EUR {cost:,}; seller asking choice EUR {ask:,}." if new else f"Retained EUR {old['replacementCostEUR']:,} base plus EUR {adopted:,} low-effort implementation increment = EUR {cost:,}. Seller asking reference EUR {old['sellerAskEUR']:,} to EUR {ask:,}, retaining the earlier asking/cost proportion.")+ ' Market value remains NOT_ESTABLISHED. Estimated hours are not logged time or expenditure.'
  scope=f"Present first-party v{c['version']} software at {r['head']}. {c['limitation']}"
  rec=dict(ref=ref,slug=identity['slug'],title=identity['title'],reviewedAt=AT,pricedVersion=c['version'],beforeVersion=c.get('before'),sourceScope='DEFAULT_BRANCH',pricedSourceHead=r['head'],comparisonBaselineCommit=None if new else next(x for x in source_rows if x['id']==identity['repositoryId']).get('previousHead'),previousSellerAskEUR=None if new else old['sellerAskEUR'],currentSellerAskEUR=ask,previousReplacementCostEUR=None if new else old['replacementCostEUR'],currentReplacementCostEUR=cost,recreationIncrementEUR=adopted,askingReferenceChangeEUR=ask if new else ask-old['sellerAskEUR'],finding=c['finding'],retainedEvidence=c['evidence'],remainingQualification=c['limitation'],budget=budget,pricingScope=scope,decisionNote=note,costAssumptionsDocument=DOC,newAsset=new,priorAskingShareOfRecreation=share)
  if not new:rec['comparisonBaselineCommit']=p['defaultBranchBaselineCommit']
  review_records.append(rec);p['lowCostReview']=rec
  v.update(sellerAskEUR=ask,negotiationLowEUR=low,negotiationHighEUR=high,replacementCostEUR=cost,sourceHead=r['head'],economicAssessmentAt=AT,pricingScope=scope,economicAssessmentNote=note,costAssumptionsDocument=DOC,financialReviewDecision='NEW_ASSET_COST_ESTIMATE' if new else 'REPRICED_IMPLEMENTED_INCREMENT',costEvidenceStatus='BASE_AND_INCREMENT_BUDGETS_RECONCILE' if new else 'INCREMENT_BUDGET_WITH_LEGACY_BASE')
  f=method['factors'];v.update(technicalCompletionProbability=f['technicalCompletionProbability'][v['stage']],commercializationProbability=f['commercializationProbability'][v['potential']],rightsTransferReserve=f['rightsTransferDiligenceReserve'],timeRiskFactor=f['timeRisk'][v['stage']]);v.update(economic(v,assetmap[ref],method))
  p.update(evaluationResult='NEW_SOFTWARE_ASSET_EVALUATION' if new else 'INCREMENT_REPRICED',evaluationNote=note,economicAssessmentAt=AT,economicAssessmentNote=note,economicAssessmentDocument=DOC,pricingScope=scope,pricedDevelopmentSnapshot=dict(version=c['version'],head=r['head'],scope='DEFAULT_BRANCH',includedInAskingReference=True))
  method['rebuildCostCalibration'].setdefault('conservativeWorkPackageEstimates',[]).append(budget)
  # Fresh seller-readiness review for the five exact source snapshots.
  tree=trees[identity['repository']];files=[x for x in tree['tree'] if x['type']=='blob'];paths=[x['path'] for x in files]
  rights=[x for x in paths if re.search(r'(^|/)(LICENSE|NOTICE|THIRD.PARTY)',x,re.I)];man=[x for x in paths if x in ['pyproject.toml','package.json','requirements.txt']];security=[x for x in paths if 'SECURITY' in x.upper()];sbom=[x for x in paths if 'sbom' in x.lower()]
  assurance=copy.deepcopy(rmap[ref]['assurance']) if not new else dict(technicalMaturity='P',evidenceMaturity='E2',ipRightsMaturity='R1',commercialMaturity='C2',transferReadiness='T2')
  conditions=['Agree exact first-party rights, component obligations and excluded content in the definitive agreement.','Freeze a release-specific delivery manifest and complete recipient acceptance.','Complete independent security review or expressly accept its absence within the local reference scope.']
  if ref=='TA-IP-003':conditions+=['Run the full dependency-based release suite and retain its source-pinned receipt.','Qualify genuinely labeled operational outcomes and the intended environment; external workload traces alone do not supply those labels.']
  elif ref=='TA-IP-025':conditions+=['Review the unmerged v1.8.1 candidate separately.','Qualify physical-domain models, representative telemetry and production conditions.']
  else:conditions+=[c['next']]
  criteria=[dict(axis=k,label=l,grade=assurance[k],criterion=t) for k,l,t in [
   ('technicalMaturity','Technical scope',c['finding']),('evidenceMaturity','Evidence and validation',c['evidence']),('ipRightsMaturity','Rights and component obligations','Proprietary declaration and repository notices reviewed; independent chain of title and freedom to operate remain unestablished.'),('commercialMaturity','Commercial basis','Explicit low-effort cost assumptions and seller asking choice; no independently determined market or income value.'),('transferReadiness','Delivery and handover','Source, tests and instructions inspected; exact rights, manifest and recipient acceptance remain open.')]]
  assessment=dict(assessedAt=AT,sourceEvidenceAssessedAt=AT,basis='SOURCE_BYTE_AND_LOCAL_CHECK_REVIEW',decision='READY_WITH_CONDITIONS',decisionBasis=c['evidence']+' '+c['limitation'],transferClosure='OPEN_SELLER_ITEMS',readyGate='NOT_ESTABLISHED',openConditionCount=len(conditions),criteria=criteria,evidenceBoundary=c['evidence'])
  checks=([dict(name='unit-tests',testsRun=7,passed=True)] if ref=='TA-IP-107' else [dict(name='node-model-graph',testsRun=24,passed=True),dict(name='python-policy-server',testsRun=5,passed=True)] if ref=='TA-IP-108' else [dict(name='python-suite',testsRun=84,passed=True)] if ref=='TA-IP-109' else [dict(name='python-suite',testsRun=73,passed=True)] if ref=='TA-IP-025' else [dict(name='repository-static-gates',checksRun=11,passed=True)])
  local=dict(sourceHead=r['head'],sourceKind='main',sourceFilesByteVerified=len(files),assessedAt=AT,independentValidation=False,commands=checks,fullProductSuiteExecuted=ref!='TA-IP-003',browserGUIAcceptanceExecuted=False,physicalQualificationExecuted=False)
  rr=dict(ref=ref,slug=identity['slug'],repository=identity['repository'],identityName=identity['identityName'],commercialReference=ref,commercialStatus='SELLER_REFERENCE_ESTABLISHED',currentStage=v['stage'],independentIpAsset=True,auditStatus='COMPLETE',externalOrBuyerSideItems=[],baselineCommit=r['head'],defaultBranchBaselineCommit=r['head'],sourceScope='DEFAULT_BRANCH',assurance=assurance,transactionReadiness='READY_WITH_CONDITIONS',assessmentDate=DATE,assessedAt=AT,reviewResult='UPDATED',openSellerItems=conditions,currentSourceReviewBoundary=c['evidence'],readinessAssessment=assessment,evidence={f'EV-SRC-{i+1:03}':dict(kind='reviewed-source-and-scope',path=x['path'],gitBlobSha=x['sha'],baselineCommit=r['head']) for i,x in enumerate(files) if x['path'] in ['README.md','pyproject.toml','LICENSE','docs/VALIDATION.md','docs/VALIDATION_R3.md','CHANGELOG.md']},dependencySummary=dict(manifestCount=len(man),lockfileCount=0,sbomCount=len(sbom),manifests=man,locks=[],sbomFiles=sbom),rightsSummary=dict(licenceFiles=rights,thirdPartyFiles=[x for x in rights if 'THIRD' in x.upper()],legalTitleOpinion='NOT_PERFORMED',ftoOpinion='NOT_PERFORMED'),securitySummary=dict(securityFiles=security,sensitiveFilenameIndicators=[],independentPenetrationTest='NOT_ASSUMED'),transferSummary=dict(buildReleaseEvidence=man,provenanceEvidence=['README.md'],transferEvidence=rights,transferEvidenceBoundary=c['evidence']),localVerification=local,sourceRecheckedAt=AT,scopeDocument=DOC,sellerAskEUR=ask,economicAssessmentAt=AT,pricingScope=scope)
  if new:ready['projects'].append(rr);rmap[ref]=rr
  else:rmap[ref].update(rr)
  ee=dict(ref=ref,slug=identity['slug'],title=identity['title'],independentIpAsset=True,stage=v['stage'],countsAsIpAsset=True,assessmentDate=DATE,assessedAt=AT,reviewResult=p['evaluationResult'],reviewNote=note,currentVersion=c['version'],developmentVersion=p.get('developmentVersion'),assurance=assurance,transactionReadiness=rr['transactionReadiness'],sellerOpenItems=conditions,evidenceBoundary=c['evidence'],statusNote=p['statusNote'],readinessAssessment=assessment,sourceHead=r['head'],defaultBranchBaselineCommit=r['head'],sourceScope='DEFAULT_BRANCH',localVerification=local,repositoryEmpty=False,repositoryFileCount=len(files),retainedFileCount=len(files),scopeDocument=DOC,sellerAskEUR=ask,replacementCostEUR=cost,monetaryEstimateChanged=True,economicAssessmentAt=AT,pricingScope=scope,economicAssessmentNote=note,triangulatedEconomicReferenceEUR=v['triangulatedEconomicReferenceEUR'],lowCostReview=rec)
  if new:ev['projects'].append(ee);emap[ref]=ee
  else:emap[ref].update(ee)
  p['localVerification']=local
  common=dict(ref=ref,slug=identity['slug'],repository=identity['repository'],identityName=identity['identityName'],baselineCommit=r['head'],assessmentDate=DATE,sourceRecheckedAt=AT)
  for name in ['ip-ownership-register.json','software-supply-chain-summary.json','rights-transfer-register.json']:
   col=data[name]['projects'];entry=next((x for x in col if x['ref']==ref),None)
   if entry is None:entry=dict(common);col.append(entry)
   else:entry.update(common)
   if name=='software-supply-chain-summary.json':entry.update(manifests=man,lockfiles=[],existingSbomFiles=sbom,sbomStatus='EXISTING_INVENTORY_REQUIRES_DELIVERY_REVIEW' if sbom else 'MANIFEST_EVIDENCED_SBOM_NOT_PRESENT',licenceFiles=rights,thirdPartyDisclosureFiles=[x for x in rights if 'THIRD' in x.upper()],securityEvidenceFiles=security,sensitiveFilenameIndicators=[],licensingClearanceStatus='NOT_ESTABLISHED',runtimeDependencies='Python standard library / native browser APIs only' if new or ref=='TA-IP-025' else 'Declared NumPy, SciPy, NetworkX, FastAPI and related Python dependencies; full environment suite not rerun.')
   else:entry.update(commercialReference=ref,repositoryLicenceFiles=rights,thirdPartyDisclosureFiles=[x for x in rights if 'THIRD' in x.upper()],legalChainOfTitleOpinion='NOT_PERFORMED',freedomToOperateOpinion='NOT_PERFORMED',sourceScope='DEFAULT_BRANCH',buyerSpecificLegalReviewRequired=True)
   if name=='ip-ownership-register.json':entry.update(defaultBranchBaselineCommit=r['head'],ipRightsMaturity=assurance['ipRightsMaturity'],ownershipEvidenceStatus='SELLER_DECLARATION_AND_DOCUMENTATION_BASIS; INDEPENDENT_TITLE_NOT_ESTABLISHED')
   if name=='rights-transfer-register.json':entry.update(auditedBaselineCommit=r['head'],firstPartyRightsPosition='SELLER_DECLARED_OWNED_OR_CONTROLLED_TO_EXTENT_TRANSFERABLE',externalHumanCoOwners='NONE_KNOWN_OR_DISCLOSED_BY_SELLER',thirdPartyIpTreatment='EXCLUDED_FROM_SELLER_OWNERSHIP_TRANSFER; GOVERNED_BY_OWN_TERMS',rightsMaturity=assurance['ipRightsMaturity'],offeredTransferPerimeter=scope,definitiveAgreementRequired=True)
 # Every project gets an explicit current source/reference decision; retained evidence dates remain visible.
 inventory=[]
 for identity in sorted(ids['projects'],key=lambda x:x['ref']):
  ref=identity['ref'];p=pmap[ref];v=vmap[ref];e=emap[ref];r=byid[identity['repositoryId']];rr=rmap[ref]
  source=dict(reviewedAt=AT,repository=r['repository'],repositoryId=r['id'],defaultBranch='main',head=r['head'],readmeBlobSha=r['readmeSha'],openPullRequests=len(r['pulls']),productTestsExecutedForThisReview=ref in CONFIG and ref!='TA-IP-003',staticChecksExecuted=ref=='TA-IP-003')
  previous_head=p.get('defaultBranchBaselineCommit');p.update(checkedDate=DATE,evaluationDate=DATE,evaluationTimestamp=AT,sourceCheckedAt=AT,sourceRecheckedAt=AT,defaultBranchBaselineCommit=r['head'],catalogueSourceReview=source,financialReferencesReviewedAt=AT)
  p['developmentRecords']=[dict(number=x['number'],title=x['title'],state='open',draft=x['draft'],head=dict(ref=x['branch'],sha=x['head'],repo='TheArchitect-max/'+r['repository'])) for x in r['pulls']]
  if ref not in CONFIG:p.update(evaluationResult='REFERENCE_REVIEWED',evaluationNote='Current main source and existing development heads reviewed. The priced scope and disclosed cost assumptions are unchanged; existing cost/asking references are retained. Market value remains NOT_ESTABLISHED.')
  cost_status=v.get('costEvidenceStatus','LEGACY_COST_REFERENCE_ONLY');decision=v.get('financialReviewDecision','RETAIN_REFERENCE_PENDING_DELIVERY_SPECIFIC_REESTIMATE') if ref in CONFIG else 'RETAIN_UNCHANGED_SOURCE_REFERENCE'
  v.update(financialReferencesReviewedAt=AT,financialReviewDecision=decision)
  vr=dict(reviewedAt=AT,decision=decision,costEvidenceStatus=cost_status,sourceRegister='assets/valuation-sources.json',document=DOC,originalFinancialReferenceReviewedAt=v.get('originalFinancialReferenceReviewedAt') or v.get('economicAssessmentAt'))
  p['valuationReview']=vr;e.update(assessmentDate=DATE,assessedAt=AT,currentVersion=p.get('currentVersion'),developmentVersion=p.get('developmentVersion'),catalogueSourceReview=source,financialReferencesReviewedAt=AT,valuationReview=vr,reviewResult=p['evaluationResult'],reviewNote=p['evaluationNote'],sellerAskEUR=v['sellerAskEUR'],replacementCostEUR=v['replacementCostEUR'])
  if ref not in CONFIG:e['monetaryEstimateChanged']=False
  review=smap.get(ref)
  if review is None:
   review=dict(ref=ref,slug=identity['slug'],title=identity['title'],reviewType='SOURCE_AND_COST_REFERENCE_REVIEW',externalSourceIds=['WIPO-COST','KNAB-2026','UPWORK-RATES'],marketTransactionValuation='NOT_ESTABLISHED',incomeValuation='NOT_ESTABLISHED',independentAppraisal='NOT_ESTABLISHED',scenarioIndependence='CORRELATED_RECREATION_ANCHOR',costEvidence=dict(workPackages=[]));sources['projects'].append(review);smap[ref]=review
  review.update(reviewedAt=AT,decision=decision,decisionNote=p['evaluationNote'],source=dict(repository=r['repository'],repositoryId=r['id'],defaultBranch='main',head=r['head'],readmeBlobSha=r['readmeSha'],documentationReviewedAt=AT,currentVersion=p.get('currentVersion'),separateDevelopmentVersion=p.get('developmentVersion'),productTestsExecutedForThisReview=source['productTestsExecutedForThisReview'],staticChecksExecuted=source['staticChecksExecuted']),currentScopeNote=p['statusNote'],transactionReadiness=rr['transactionReadiness'],openTransferConditions=rr['openSellerItems'])
  original=review.get('financialReference',{}).get('originalReferenceReviewedAt') or v.get('originalFinancialReferenceReviewedAt') or v.get('economicAssessmentAt')
  review['financialReference']={**review.get('financialReference',{}),**{k:v[k] for k in ['sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR']},'originalReferenceReviewedAt':original,'pricedSourceHead':v.get('sourceHead'),'pricedSourceHeadStatus':'RECORDED' if v.get('sourceHead') else 'NOT_RECORDED_IN_FINANCIAL_REGISTER','currentDocumentationAutomaticallyRepriced':False}
  if ref in CONFIG:
   rec=p['lowCostReview'];review['lowCostReview']=rec;review['financialReference'].update(pricedVersion=CONFIG[ref]['version'],pricedSourceScope='DEFAULT_BRANCH',referenceRepricedAt=AT)
   review['costEvidence'].update(status=cost_status,confidence='ANALYST_LOW_EFFORT_ASSUMPTION' if rec['newAsset'] else 'LEGACY_BASE_UNVERIFIED_INCREMENT_ESTIMATED',note=rec['decisionNote'],disclosedWorkPackageCount=len(rec['budget']['workPackages']),disclosedAdoptedAmountsEUR=rec['recreationIncrementEUR'],completeAnchorReconstructedFromDisclosedBudgets=rec['newAsset'])
   review['costEvidence']['workPackages'].append(dict(methodologyPath='rebuildCostCalibration.conservativeWorkPackageEstimates',coverage='BASE_SCOPE' if rec['newAsset'] else 'INCREMENT_ONLY',basisDate=AT,scope=rec['finding'],sourceHead=r['head']))
   review['exclusions']=[CONFIG[ref]['limitation'],'First-party source only; third-party data/content, future development, certification and production business operations are excluded.']
  inv_old=next((x for x in data['repository-inventory.json']['projects'] if x['ref']==ref),{})
  tree=trees.get(r['repository']);files=[x for x in tree['tree'] if x['type']=='blob'] if tree else []
  inventory.append({**inv_old,'repository':r['repository'],'repositoryId':r['id'],'ref':ref,'sourceHead':r['head'],'treeSha':r['tree'],'sourceUpdatedAt':r['date'],'sourceCheckedAt':AT,'readmeRead':True,'readmeBlobSha':r['readmeSha'],'openPullRequests':len(r['pulls']),'profile':'projects/'+identity['slug']+'/','freshLocalTestsPerformed':source['productTestsExecutedForThisReview'],'staticChecksPerformed':source['staticChecksExecuted'],'treeRead':bool(tree),'fileCount':len(files) if tree else inv_old.get('fileCount'),'treeTruncated':False if tree else inv_old.get('treeTruncated'),'existingAssessmentRetained':ref not in CONFIG})
 # Financial model inputs and all totals.
 for i,row in enumerate(raw['a']):
  v=vmap[row[1]];row[8:11]=[v['sellerAskEUR'],v['negotiationLowEUR'],v['negotiationHighEUR']];recreation['assets'][i]=v['replacementCostEUR']
 raw['p'][1:4]=[sum(x[i] for x in raw['a']) for i in [8,9,10]]
 for group in [supp,extra]:
  for a in group['assets']:
   v=vmap[a['ref']];a.update(ask=v['sellerAskEUR'],low=v['negotiationLowEUR'],high=v['negotiationHighEUR'],recreationCost=v['replacementCostEUR'])
   if a['ref'] in CONFIG:a.update(pricingScope=v['pricingScope'],economicAssessmentAt=AT)
 portfolio=values['portfolio'];portfolio.update(assetCount=108,pricedAssetCount=108,unpricedAssetCount=0,stageCounts=dict(developedSoftware=56,developedPrototype=49,researchStage=3,definitionStage=0))
 for k in ['sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR','marketComparableProxyEUR','incomeLicensingProxyEUR','probabilityAdjustedStrategicValueEUR','triangulatedEconomicReferenceEUR']:portfolio[k]=sum(v[k] for v in vmap.values())
 portfolio.update(sellerAskAsShareOfTriangulated=portfolio['sellerAskEUR']/portfolio['triangulatedEconomicReferenceEUR'],sellerAskAsShareOfReplacementCost=portfolio['sellerAskEUR']/portfolio['replacementCostEUR'],averageTriangulatedEconomicReferencePerPricedAsset=portfolio['triangulatedEconomicReferenceEUR']/108,monetaryScope='108 independent projects: three new source-bound low-effort estimates, two newly budgeted implementation increments and 103 retained existing price records. Earlier nine incremental budgets remain included once. Market value is not established.')
 reassess=dict(assessedAt=AT,type='FULL_PORTFOLIO_REEVALUATION',assetsReassessed=108,assetAdditions=3,monetaryReferencesChanged=5,existingAssetsRepriced=2,unchangedAssetPrices=103,assets=review_records,previousPortfolio=old_portfolio,currentPortfolio=copy.deepcopy(portfolio),sourceRegister='assets/valuation-sources.json',costAssumptionsDocument=DOC,recreationIncrementEUR=portfolio['replacementCostEUR']-old_portfolio['replacementCostEUR'],askingReferenceChangeEUR=portfolio['sellerAskEUR']-old_portfolio['sellerAskEUR'],boundary=boundary)
 counts=dict(Counter(r['costEvidence']['status'] for r in sources['projects']));summary=dict(projectsReviewed=108,uniqueProjectReferences=108,monetaryReferencesChanged=5,askingReferencesRetained=103,recreationAnchorsRetained=103,costEvidenceCounts=counts,projectsWithDisclosedWorkPackages=28,marketTransactionValuationsEstablished=0,incomeValuationsEstablished=0,independentAppraisalsEstablished=0,productTestSuitesExecuted=4,staticCheckSuitesExecuted=1,projectSites=108,publicationRepositoriesExcludedFromValuation=2)
 sources.update(reviewedAt=AT,catalogueUpdatedAt=AT,title='Complete portfolio source and cost-reference reevaluation',scope=boundary,previousReviewSummary=sources['reviewSummary'],reviewSummary=summary,latestPortfolioReview=reassess)
 for s in sources['sources']:
  if s['id'] in ['WIPO-COST','KNAB-2026','UPWORK-RATES']:s['reviewedAt']=AT
 sources['methodBoundary']='Cost is distinct from market value. Existing seller asking references are separate transaction choices. New budgets use the lowest explicitly scoped low-effort scenario at EUR 94/hour plus 15%, rounded down to EUR 500. These estimates and retained legacy anchors do not establish an absolute cost floor, a market minimum, actual expenditure, attributable income or a completed sale.'
 method['rebuildCostCalibration'].update(assessedAt=AT,latestReviewBoundary=boundary,lowestCostPolicy=sources['methodBoundary'])
 method['portfolio']=copy.deepcopy(portfolio);method['sourceTransparency'].update(reviewedAt=AT,summary=summary,boundary=boundary)
 for obj in [values,method,pres,ev]:obj['previousFinancialReassessment']=obj.get('latestFinancialReassessment');obj['latestFinancialReassessment']=reassess
 values.update(assessedAt=AT,valuationBasisDate=DATE,developmentStatusDate=DATE,scope=boundary);ev.update(basisDate=DATE,assessedAt=AT,previousSummary=ev['summary'],summary=dict(projectsReviewed=108,ipAssetsEvaluated=108,reviewOutcomes=dict(REFERENCE_REVIEWED=103,INCREMENT_REPRICED=2,NEW_SOFTWARE_ASSET_EVALUATION=3),monetaryReferencesChanged=5,newAssetsEvaluated=3,currentSellerAskEUR=portfolio['sellerAskEUR'],currentReplacementCostEUR=portfolio['replacementCostEUR'],boundary=boundary))
 recreation.update(primaryRegisterRecreationCostEUR=sum(recreation['assets']),currentPortfolioRecreationCostEUR=portfolio['replacementCostEUR'],valuationBasisDate=DATE)
 inv=data['repository-inventory.json'];inv.update(reviewedAt=AT,sourceInventoryAssessedAt=AT,repositoryPresenceCheckedAt=AT,websiteBaselineCommit='1d3ba27f1224330138d3d68b9c7f57d8f991f87b',projects=inventory,summary=dict(repositoryCount=110,projectRepositoryCount=108,publicationRepositoryCount=2,repositoryPresenceChecked=110,repositoryHeadsChecked=108,projectReadmesRead=108,projectTreesRead=5,openPullRequestsReviewed=41,publicDisplayCount=108,newProjects=[dict(ref=r['ref'],title=r['title']) for r in review_records if r['newAsset']],renamedRepositories=1,migratedProfilePaths=6,boundary=boundary))
 ids['scope'].update(ipAssetCount=108,pricedAssetCount=108);ids['latestIdentityUpdate']=dict(assessedAt=AT,type='THREE_ADDITIONS_AND_CONFIRMED_RENAME',identifiersReassigned=False,existingAliasesRetained=True,newAliases=[dict(ref=r['ref'],identityName=idmap[r['ref']]['identityName']) for r in review_records if r['newAsset']],canonicalIdentityRegister='assets/project-identities.json',boundary='Portfolio identifiers are authoritative. Historical repository status blocks can contain shifted legacy IDs; they do not reassign portfolio assets. Feminine names are reference aliases and do not replace canonical product titles.')
 data['display-names.json']['scope']=108;data['display-names.json']['names']={p['slug']:dict(displayName=p['identityName']) for p in ids['projects']}
 for ref,c in CONFIG.items():
  if 'id' in c:
   data['descriptions.json']['descriptions'][c['slug']]=c['description']
   next(f for f in data['portfolio-structure.json']['families'] if f['id']==c['family'])['assets'].append(c['slug'])
 future=data['future-economic-references.json'];future['basisDate']=DATE
 for r in future['projects']:
  if r['ref'] in CONFIG:
   v=vmap[r['ref']];r.update(currentReplacementCostEUR=v['replacementCostEUR'],currentTriangulatedEconomicReferenceEUR=v['triangulatedEconomicReferenceEUR'],economicAssessmentAt=AT)
   if r['status']=='CONDITIONAL':target=economic(v,assetmap[r['ref']],method,r['targetStage'])['triangulatedEconomicReferenceEUR'];r.update(milestoneConditionedEconomicReferenceEUR=target,sensitivityDeltaEUR=target-v['triangulatedEconomicReferenceEUR'])
 for ref,c in CONFIG.items():
  if 'id' in c:future['projects'].append(dict(ref=ref,slug=c['slug'],name=c['title'],identityName=c['alias'],assessmentDate=DATE,status='NOT_ESTABLISHED',futureReferenceStatus='NOT_ESTABLISHED',currentStage='P',targetStage=None,currentReplacementCostEUR=vmap[ref]['replacementCostEUR'],currentTriangulatedEconomicReferenceEUR=vmap[ref]['triangulatedEconomicReferenceEUR'],reason='No accepted next-maturity evidence or future sale/income value is established.',targetMilestone=c['next'],acceptanceRule='Future work is unpriced and requires its own evidence and scope.'))
 future['summary'].update(projects=108,notEstablished=sum(x['status']=='NOT_ESTABLISHED' for x in future['projects']),numericConditionalReferences=sum(x['status']=='CONDITIONAL' for x in future['projects']))
 # Recompute readiness/supply distributions from the actual records.
 ready['summary']=dict(audited=108,pending=0,ready=0,readyWithConditions=sum(x['transactionReadiness']=='READY_WITH_CONDITIONS' for x in ready['projects']),notReady=sum(x['transactionReadiness']=='NOT_READY' for x in ready['projects']))
 supply=data['software-supply-chain-summary.json'];supply['summary']=dict(projects=108,**{key:sum(bool(p.get(field)) for p in supply['projects']) for key,field in [('withDependencyManifest','manifests'),('withLockfile','lockfiles'),('withExistingSbom','existingSbomFiles'),('withLicenceFile','licenceFiles'),('withThirdPartyDisclosure','thirdPartyDisclosureFiles'),('withSecurityEvidence','securityEvidenceFiles'),('withSensitiveFilenameIndicators','sensitiveFilenameIndicators')]})
 audit=data['portfolio-audit-certificate.json'];audit['basisDate']=DATE;audit['scope'].update(ipAssetCount=108,pricedAssetCount=108);audit['audit'].update(auditedProjects=108,transactionReadiness=copy.deepcopy(ready['summary']))
 for key,axis in [('evidenceMaturityDistribution','evidenceMaturity'),('ipRightsMaturityDistribution','ipRightsMaturity'),('commercialMaturityDistribution','commercialMaturity'),('transferReadinessDistribution','transferReadiness')]:audit['audit'][key]=dict(Counter(p['assurance'][axis] for p in ready['projects']))
 audit['audit']['topOpenSellerItems']=[dict(item=k,count=v) for k,v in Counter(i for p in ready['projects'] for i in p['openSellerItems']).most_common(12)]
 for k in list(audit['economics']):
  if k in portfolio:audit['economics'][k]=portfolio[k]
 audit['latestFinancialReassessment']=reassess
 connections=data['project-connections.json'];connections.update(portfolioAssetCount=108,priceBasisDate=DATE)
 for x in connections['sourceDocumentation']:
  if x['ref']=='TA-IP-025':x.update(repository=idmap['TA-IP-025']['repository'],blobSha=byid[idmap['TA-IP-025']['repositoryId']]['readmeSha'])
 # Keep all three additions independent. In particular VESCP has a strict isolation contract.
 att=data['public-attestation.json'];att.update(version=VERSION,publicationDate=DATE,valuationBasisDate=DATE,portfolioAssetCount=108,projectCount=108,ipAssetCount=108,pricedAssetCount=108,publicDisplayCount=108,assessedAt=AT,directoryReviewAt=AT,latestFinancialReassessment=reassess,purpose=boundary)
 data['public-sites.json'].update(siteCount=108,updatedAt=AT)
 route=data['project-route-aliases.json'];route['aliases'].append(dict(ref='TA-IP-025',legacySlug=OLD_SLUG,slug=NEW_SLUG,title=NEW_TITLE));route['updatedAt']=AT
 for name,obj in data.items():
  obj['catalogueUpdatedAt']=AT
  if isinstance(obj.get('scope'),dict):
   for k in ['ipAssetCount','pricedAssetCount','projectCount','portfolioAssetCount']:
    if k in obj['scope']:obj['scope'][k]=108
  if 'version' in obj:obj['version']=VERSION
  if 'v' in obj:obj['v']=VERSION
  save(name,obj)
 with (AS/'valuation-review.csv').open('w',newline='',encoding='utf-8-sig') as f:
  w=csv.writer(f,lineterminator='\n');w.writerow(['Reference','Project','Review date','Current main','Separate development','Priced version','Cost evidence','Seller ask EUR','Recreation anchor EUR','Asking change EUR','Recreation increment EUR','Comparable-sale valuation','Income valuation','Decision'])
  changes={r['ref']:r for r in review_records}
  for r in sorted(sources['projects'],key=lambda x:x['ref']):
   v=r['financialReference'];c=changes.get(r['ref'],{});w.writerow([r['ref'],r['title'],AT,r['source']['currentVersion'],r['source']['separateDevelopmentVersion'],v.get('pricedVersion'),r['costEvidence']['status'],v['sellerAskEUR'],v['replacementCostEUR'],c.get('askingReferenceChangeEUR',0),c.get('recreationIncrementEUR',0),'NOT_ESTABLISHED','NOT_ESTABLISHED',r['decision']])
 # Source receipts contain hashes and check results, never private implementation.
 (ROOT/'docs/SOURCE_VERIFICATION_2026-10-17.json').write_text(json.dumps(dict(reviewedAt=AT,allProjectReadmes=108,openPullRequests=41,files=json.loads((WORK/'source-byte-checks-20261017.json').read_text()),localChecks={ref:pmap[ref]['localVerification'] for ref in CONFIG},boundary='246 original Git blobs verified. Source content remains private. Four local product suites and one static suite executed; no physical, production or independent certification is claimed.'),indent=2)+'\n')
 # A review document includes every project decision and all five inspectable budgets.
 text='# Complete portfolio reevaluation — 17 October 2026\n\n'+boundary+'\n\n110 repositories: 108 independent projects and two publication sources. Existing IDs and aliases are preserved; withdrawn IDs are not reused. TA-IP-025 retains Artemis and migrates to its renamed canonical route.\n\n'
 text+='| New ID | Canonical product | Feminine reference alias |\n|---|---|---|\n'+''.join(f"| {r['ref']} | {r['title']} | {idmap[r['ref']]['identityName']} |\n" for r in review_records if r['newAsset'])
 text+='\n## Financial decisions\n\n| ID | Earlier asking EUR | Current asking EUR | Earlier recreation EUR | Current recreation EUR |\n|---|---:|---:|---:|---:|\n'+''.join(f"| {r['ref']} | {r['previousSellerAskEUR'] if r['previousSellerAskEUR'] is not None else 'New'} | {r['currentSellerAskEUR']} | {r['previousReplacementCostEUR'] if r['previousReplacementCostEUR'] is not None else 'New'} | {r['currentReplacementCostEUR']} |\n" for r in review_records)
 text+=f"\nPortfolio asking references: EUR {portfolio['sellerAskEUR']:,}. Recreation references: EUR {portfolio['replacementCostEUR']:,}. 103 preceding individual amounts remain unchanged. The earlier nine increment corrections are included once. These are not established market values.\n\n"
 text+='## Lowest-cost working basis and limits\n\n'+sources['methodBoundary']+' A modern assisted rebuild is assumed. Each package names concrete delivered work; no price is derived from commit counts, file counts, release counts or elapsed days. The 15% allowance and asking discounts are seller/analyst choices. Older anchors remain separately dated; this review does not silently recast them as verified minimum costs. The previous quarter-effort sensitivities remain illustrative historical alternatives, not evidence-backed minimum bids.\n\n'
 for r in review_records:
  b=r['budget'];text+=f"## {r['ref']} — {r['title']}\n\nSource: `{r['pricedSourceHead']}`; v{r['pricedVersion']}. "
  if r['comparisonBaselineCommit']:text+=f"Comparison baseline: `{r['comparisonBaselineCommit']}` / v{r['beforeVersion']}. "
  text+='\n\n'+r['finding']+'\n\n'+r['retainedEvidence']+'\n\n| Work package | Low-effort hours assumed |\n|---|---:|\n'+''.join(f"| {w['scope']} | {w['lowEffortHours']} |\n" for w in b['workPackages'])
  text+=f"\n{b['assumedHours']} assumed hours × EUR 94 = EUR {b['rawEngineeringCostEUR']:,}; including 15%: EUR {b['withAllowanceEUR']:,}; selected low estimate rounded down: EUR {r['recreationIncrementEUR']:,}. Alternative 1.5× and 2× effort scenarios: EUR {b['effortAlternatives']['referenceCostEUR']:,} / EUR {b['effortAlternatives']['extendedCostEUR']:,}. Asking proportion: {r['priorAskingShareOfRecreation']:.6%}, rounded to EUR 500.\n\n"+r['remainingQualification']+'\n\n'
 text+='## Sources\n\n[WIPO cost method](https://www.wipo.int/web-publications/intellectual-property-valuation-basics-for-technology-transfer-professionals/en/4-the-cost-method.html) supplies method context and distinguishes replica and modern-equivalent cost. [Knab 2026](https://bieb.knab.nl/ondernemen/wat-verdient-een-software-developer-zzp-bekijk-uurtarief-en-winst) reports a Dutch developer mean of EUR 94/hour excluding VAT, not a minimum or project quote. [Upwork](https://www.upwork.com/hire/software-developers/cost/) provides a broad USD 10–100/hour publisher search cross-check; page retrieval remains limited and no asset-specific price is inferred. Current exact README/PR records, full snapshots of five projects, retained qualification and disclosed cost assumptions are separate source roles. No independent market or income valuation is established.\n\n## Complete decision register\n\n| ID | Main | Decision | Cost evidence |\n|---|---|---|---|\n'+''.join(f"| {r['ref']} | {r['source']['currentVersion'] or 'Unversioned'} | {r['decision']} | {r['costEvidence']['status']} |\n" for r in sorted(sources['projects'],key=lambda x:x['ref']))
 (ROOT/DOC).write_text(text)
 (WORK/'review-result-20261017.json').write_text(json.dumps(dict(portfolio=portfolio,reviewRecords=review_records,costCounts=counts),indent=2)+'\n')
 print(json.dumps(dict(projects=108,portfolio=portfolio,costEvidence=counts),indent=2))

if __name__=='__main__':main()
