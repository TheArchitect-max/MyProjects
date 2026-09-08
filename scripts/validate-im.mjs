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
const pkg=json('package.json');
const sum=k=>rows.reduce((n,x)=>n+x[k],0);

assert(pkg.version==='2026.9.8-im19','package version');
assert(method.v==='2026.09.08-im19','methodology version');
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

const projectRoot=path.join(root,'projects');
const dirs=fs.readdirSync(projectRoot,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
assert(dirs.length===79,'project route count');
for(const x of rows){assert(dirs.includes(x.slug),`missing route ${x.slug}`);const h=read(`projects/${x.slug}/index.html`);assert(h.includes('economic.js?v=im19'),`economic runtime ${x.slug}`);assert(h.includes('im4.css?v=im19'),`IM19 stylesheet ${x.slug}`)}

for(const p of ['index.html','portfolio.html','valuation.html','opportunity.html','transaction.html','notice.html'])assert(read(p).includes('rel="canonical"'),`canonical ${p}`);
assert(read('index.html').includes('€71.598M')&&read('index.html').includes('€76.839M'),'homepage economic values');
assert(read('valuation.html').includes('€67.967M')&&read('valuation.html').includes('€80.368M')&&read('valuation.html').includes('€71.598M'),'valuation lenses');
assert(read('portfolio.html').includes('economic.js?v=im19'),'portfolio economic runtime');
new vm.Script(read('assets/economic.js'));
new vm.Script(read('assets/im.js'));
assert(!fs.existsSync(path.join(root,'.github/workflows')),'Actions prohibited');
console.log(JSON.stringify({presentationRelease:'IM19',standaloneAssets:79,sellerAskEUR:14075000,replacementCostEUR:60150000,marketComparableProxyEUR:67966649,incomeLicensingProxyEUR:80368396,probabilityAdjustedStrategicValueEUR:76838904,triangulatedEconomicReferenceEUR:71598124,averageEconomicReferencePerAssetEUR:906305.37,askShareOfTriangulated:0.196583363},null,2));
