#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const assert=(c,m)=>{if(!c)throw Error(m)};
const csv=read('assets/asset-economic-valuations.csv').trim().split(/\r?\n/);
const head=csv.shift().split(',');
const rows=csv.map(line=>{const v=line.split(','),o={};head.forEach((k,i)=>o[k]=v[i]);for(const k of ['sellerAskEUR','replacementCostEUR','marketComparableProxyEUR','incomeLicensingProxyEUR','technicalCompletionProbability','commercializationProbability','rightsTransferReserve','timeRiskFactor','probabilityAdjustedStrategicValueEUR','triangulatedEconomicReferenceEUR','askShareOfTriangulated'])o[k]=Number(o[k]);return o});
const method=json('assets/economic-methodology.json');
const evidence=json('assets/external-market-evidence.json');
const replacementScope=json('assets/replacement-cost-scope.json');
const pkg=json('package.json');
const sum=k=>rows.reduce((n,x)=>n+x[k],0);

assert(pkg.version==='2026.9.12-im24','package version');
assert(method.v==='2026.09.08-im20','methodology version');
assert(evidence.v==='2026.09.08-im20','external evidence version');
assert(replacementScope.v==='2026.09.08-im20','replacement scope version');
assert(rows.length===79,'economic asset count');
assert(new Set(rows.map(x=>x.ref)).size===79,'unique economic refs');
assert(new Set(rows.map(x=>x.slug)).size===79,'unique economic slugs');
assert(rows.every(x=>x.sellerAskEUR>0&&x.replacementCostEUR>0&&x.triangulatedEconomicReferenceEUR>0),'positive economic values');
assert(rows.every(x=>x.technicalCompletionProbability>0&&x.technicalCompletionProbability<=1),'technical probability');
assert(rows.every(x=>x.commercializationProbability>0&&x.commercializationProbability<=1),'commercialization probability');
assert(rows.every(x=>x.rightsTransferReserve>0&&x.rightsTransferReserve<=1),'rights reserve');
assert(sum('sellerAskEUR')===14075000,'seller ask aggregate');
assert(sum('replacementCostEUR')===60150000,'replacement aggregate');
assert(sum('marketComparableProxyEUR')===67966649,'market proxy aggregate');
assert(sum('incomeLicensingProxyEUR')===80368396,'income proxy aggregate');
assert(sum('probabilityAdjustedStrategicValueEUR')===76838904,'strategic aggregate');
assert(sum('triangulatedEconomicReferenceEUR')===71598124,'triangulated aggregate');
assert(method.portfolio.assetCount===79,'methodology asset count');
assert(method.portfolio.triangulatedEconomicReferenceEUR===71598124,'methodology triangulated reference');
assert(method.portfolio.sellerAskAsShareOfTriangulated>0.1965&&method.portfolio.sellerAskAsShareOfTriangulated<0.1967,'ask share of economic reference');
const w=method.factors.triangulationWeights;
assert(Math.abs(w.replacementCost+w.marketComparableProxy+w.incomeLicensingProxy+w.probabilityAdjustedStrategicValue-1)<1e-9,'triangulation weights');

assert(Array.isArray(evidence.transactions)&&evidence.transactions.length===13,'transaction anchor count');
assert(Object.keys(evidence.sectorCalibration||{}).length===8,'sector evidence coverage');
assert(evidence.rules?.directPriceCopyingProhibited===true,'direct price copying prohibited');
assert(evidence.rules?.assetSpecificComparabilityRequiredForMarketApproach===true,'asset comparability rule');
assert(evidence.observedIllustrativeRevenueRatios.sampleSize===6,'illustrative ratio sample size');
assert(evidence.observedIllustrativeRevenueRatios.minimum===4.88&&evidence.observedIllustrativeRevenueRatios.median===13.05&&evidence.observedIllustrativeRevenueRatios.maximum===24.98,'illustrative ratio metadata');
assert(evidence.transactions.every(x=>x.id&&x.source&&x.sourceType&&x.use),'transaction evidence completeness');
assert(Object.values(evidence.sectorCalibration).every(x=>x.evidenceConfidence>=0.5&&x.evidenceConfidence<=0.7&&Array.isArray(x.anchors)&&x.anchors.length>=2),'sector confidence controls');
const transactionIds=new Set(evidence.transactions.map(x=>x.id));
for(const sector of Object.values(evidence.sectorCalibration))for(const id of sector.anchors)assert(transactionIds.has(id),`unknown transaction anchor ${id}`);

assert(replacementScope.currentPortfolioReplacementBaselineEUR===60150000,'replacement scope baseline');
assert(replacementScope.policy?.doNotAutoUplift===true,'no automatic replacement uplift');
assert(replacementScope.policy?.avoidDoubleCounting===true,'replacement double-count control');
assert(Array.isArray(replacementScope.componentsToAudit)&&replacementScope.componentsToAudit.length===13,'replacement component count');
assert(new Set(replacementScope.componentsToAudit.map(x=>x.id)).size===13,'unique replacement components');
assert(method.externalEvidence.transactionAnchorCount===13&&method.externalEvidence.sectorCoverageCount===8,'methodology evidence integration');
assert(method.replacementCostScope.currentBaselineEUR===60150000,'methodology replacement integration');

const projectRoot=path.join(root,'projects');
const dirs=fs.readdirSync(projectRoot,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
assert(dirs.length===81,'project route count');
for(const x of rows){assert(dirs.includes(x.slug),`missing route ${x.slug}`);const h=read(`projects/${x.slug}/index.html`);assert(h.includes('economic.js?v=im24'),`economic runtime ${x.slug}`);assert(h.includes('im4.css?v=im24'),`IM19 asset shell stylesheet ${x.slug}`)}

for(const p of ['index.html','portfolio.html','valuation.html','evidence.html','opportunity.html','transaction.html','notice.html'])assert(read(p).includes('rel="canonical"'),`canonical ${p}`);
assert(read('index.html').includes('€71.598M')&&read('index.html').includes('€76.839M'),'homepage economic values');
assert(read('valuation.html').includes('€67.967M')&&read('valuation.html').includes('€80.368M')&&read('valuation.html').includes('€71.598M'),'valuation lenses');
assert(read('valuation.html').includes('13 transaction anchors')&&read('valuation.html').includes('fully componentized'),'valuation IM20 evidence and replacement scope');
assert(read('evidence.html').includes('13.1×')&&read('evidence.html').includes('Direct application prohibited'),'external evidence presentation');
assert(read('portfolio.html').includes('economic.js?v=im24'),'portfolio economic runtime');
const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
assert(locs.length===92&&new Set(locs).size===92,'sitemap URL count');
assert(locs.includes('https://thearchitect-max.github.io/MyProjects/evidence.html'),'evidence sitemap route');
new vm.Script(read('assets/economic.js'));
new vm.Script(read('assets/im.js'));
for(const p of ['README.md','valuation.html','evidence.html','assets/economic-methodology.json','assets/external-market-evidence.json','assets/replacement-cost-scope.json'])assert(!/chatgpt/i.test(read(p)),`forbidden attribution ${p}`);
assert(!fs.existsSync(path.join(root,'.github/workflows')),'Actions prohibited');
console.log(JSON.stringify({presentationRelease:'IM24',standaloneAssets:79,sellerAskEUR:14075000,replacementCostEUR:60150000,marketComparableProxyEUR:67966649,incomeLicensingProxyEUR:80368396,probabilityAdjustedStrategicValueEUR:76838904,triangulatedEconomicReferenceEUR:71598124,averageEconomicReferencePerAssetEUR:906305.37,askShareOfTriangulated:0.196583363,externalTransactionAnchors:13,externalEvidenceSectors:8,illustrativeRevenueRatioMedian:13.05,replacementComponentsToAudit:13,sitemapUrls:92},null,2));
