#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),script=fs.readFileSync(path.join(root,'assets/im.js'),'utf8'),marker='render().catch';
assert(script.includes(marker));const source=script.slice(0,script.lastIndexOf(marker))+'globalThis.showroom={load,validate,home,portfolio,project,buyers,acquisition,policy,notice,filterAssets,valuation,validatePricing,calculationPage,connectionsPage,assurancePage,evidencePage,transferPage,transactionPage,commercializationPage,sourcesPage,identityPage,filterIdentity,filterConnections,validateEvaluationSources};})();';
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/buyer-catalogue.json'),'utf8'));
const prices=JSON.parse(fs.readFileSync(path.join(root,'assets/pricing-catalogue.json'),'utf8'));
const dossiers=JSON.parse(fs.readFileSync(path.join(root,'assets/buyer-dossiers.json'),'utf8')),applications=JSON.parse(fs.readFileSync(path.join(root,'assets/application-combinations.json'),'utf8'));
const evaluationSources=JSON.parse(fs.readFileSync(path.join(root,'assets/evaluation-sources.json'),'utf8'));
const sandbox={PricingMath:require(path.join(root,'assets/pricing-math.js')),URL,URLSearchParams,Intl,JSON,Math,Number,String,Boolean,Map,Set,console,document:{currentScript:{src:'https://thearchitect-max.github.io/MyProjects/assets/im.js'}},location:{pathname:'/MyProjects/',search:'',hash:''},fetch:async url=>{const file=new URL(url).pathname;assert(['/MyProjects/assets/buyer-catalogue.json','/MyProjects/assets/pricing-catalogue.json','/MyProjects/assets/buyer-dossiers.json','/MyProjects/assets/application-combinations.json','/MyProjects/assets/evaluation-sources.json'].includes(file));return {ok:true,json:async()=>file.endsWith('/pricing-catalogue.json')?prices:file.endsWith('/buyer-dossiers.json')?dossiers:file.endsWith('/application-combinations.json')?applications:file.endsWith('/evaluation-sources.json')?evaluationSources:data}}};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
(async()=>{
 const r=sandbox.showroom,d=await r.load();assert.equal(d.projects.length,108);
 for(const a of d.projects){
  const html=r.project(a,d);assert(html.includes(a.title.replaceAll('&','&amp;')));assert(html.includes(a.referenceName));assert(html.includes('Potential acquirers'));assert(html.includes(a.factsheetUrl));assert(html.includes(a.briefUrl));assert(html.includes('data-buyer-dossier=\"'+a.ref+'\"'));assert(html.includes('id=\"qualification\"'));assert(html.includes('Items to close before handover'));assert.equal((html.match(/data-project-display=/g)||[]).length,1);
  for(const field of prices.fields)assert(html.includes('data-price-field="'+field.key+'"'),a.ref+' '+field.key);
  for(const id of prices.projects.find(x=>x.ref===a.ref).sourceIds)assert(html.includes(prices.sources.find(s=>s.id===id).url));
  for(const b of a.potentialBuyers)assert(html.includes(b.replaceAll('&','&amp;')));
  assert(!/\b[a-f0-9]{40}\b/.test(html));assert(!/role-month|audit grade|new projects|recently added/i.test(html));
 }
 let pages=0;for(const name of ['home','portfolio','buyers','acquisition','policy','notice','valuation','calculationPage','connectionsPage','assurancePage','evidencePage','transferPage','transactionPage','commercializationPage','sourcesPage','identityPage']){const html=r[name](d);assert(html.length>1000,name);pages++;assert(!/\b[a-f0-9]{40}\b/.test(html));}
 assert.equal((r.portfolio(d).match(/data-asset-ref=/g)||[]).length,108);
 for(const c of d.categories){const rows=r.filterAssets(d,{family:c.id});assert(rows.length>0);assert(rows.every(a=>a.categoryId===c.id));}
 for(const g of d.buyerGroups){const rows=r.filterAssets(d,{buyer:g.id});assert(rows.length>0);assert(rows.every(a=>a.buyerGroupIds.includes(g.id)));}
 for(const name of ['Vesta','Asteria','Scheherazade']){const rows=r.filterAssets(d,{query:name});assert.equal(rows.length,1);assert.equal(rows[0].referenceName,name);}
 assert.equal(r.filterAssets(d,{query:'unmatched-object-xyz'}).length,0);
 assert.equal((r.identityPage(d).match(/data-identity-ref=/g)||[]).length,108);assert.equal(r.filterIdentity(d,'Lydia')[0].ref,'TA-IP-090');assert.equal(r.filterIdentity(d,'Lucia')[0].ref,'TA-IP-091');assert.equal((r.portfolio(d).match(/data-project-display=/g)||[]).length,108);assert(!/Bitcoin|voluntary contribution/.test(r.acquisition(d)+r.home(d)+r.policy(d)));
 assert.equal((r.valuation(d).match(/data-price-ref=/g)||[]).length,108);
 assert.equal((r.calculationPage(d).match(/data-calculation-ref=/g)||[]).length,108);
 assert.equal((r.portfolio(d).match(/data-currency="USD"/g)||[]).length,216);
 assert.equal(d.calculation.status,'PASS');assert.equal((r.connectionsPage(d).match(/data-connection-ref=/g)||[]).length,33);assert.equal((r.assurancePage(d).match(/data-assurance-ref=/g)||[]).length,108);
 assert.equal((r.sourcesPage(d).match(/data-evaluation-source=/g)||[]).length,10);assert.equal((r.sourcesPage(d).match(/data-source-asset=/g)||[]).length,108);
 assert.equal(r.filterConnections(d).length,33);assert.equal(r.filterConnections(d,{query:'Asteria'}).length,0);assert.equal(r.filterConnections(d,{query:'unmatched-connection-xyz'}).length,0);const ariadne=r.filterConnections(d,{query:'Ariadne'});assert(ariadne.length>0);assert(ariadne.every(c=>c.members.some(m=>m.ref==='TA-IP-003')));const selected=r.filterConnections(d,{asset:'TA-IP-003'});assert.equal(selected.length,ariadne.length);assert(r.filterConnections(d,{category:'Intelligence & research'}).every(c=>c.category==='Intelligence & research'));
 for(const x of evaluationSources.externalSources)assert(r.sourcesPage(d).includes(x.url));const brokenSources=JSON.parse(JSON.stringify(evaluationSources));brokenSources.externalSources[0].url='https://example.org/unattributed';assert.throws(()=>r.validateEvaluationSources(brokenSources,d));
 assert.throws(()=>r.validatePricing({...prices,portfolio:{...prices.portfolio,sellerAskEUR:1}},data));
 const sorted=r.filterAssets(d,{sort:'ask-asc'});for(let i=1;i<sorted.length;i++)assert(sorted[i].askingReferenceEUR>=sorted[i-1].askingReferenceEUR);
 assert.throws(()=>r.validate({...d,projects:[{...d.projects[0],unapprovedField:'not publishable'},...d.projects.slice(1)]}));
 let loadedMathScripts=0;const cachedShell={...sandbox,PricingMath:undefined,document:{currentScript:sandbox.document.currentScript,createElement:tag=>{assert.equal(tag,'script');return {}},head:{appendChild:script=>{assert.equal(new URL(script.src).pathname,'/MyProjects/assets/pricing-math.js');loadedMathScripts++;cachedShell.PricingMath=require(path.join(root,'assets/pricing-math.js'));script.onload()}}}};
 vm.createContext(cachedShell);vm.runInContext(source,cachedShell);const cachedData=await cachedShell.showroom.load();assert.equal(cachedData.calculation.status,'PASS');assert.equal(loadedMathScripts,1);
 console.log(JSON.stringify({result:'PASS',buyerProfilesRendered:108,mainPagesRendered:pages,applicationFilters:12,buyerFilters:10,uniqueProjectPresentations:108,perAssetBuyerFitAndDocuments:true,completePriceRecords:108,priceFieldsPerAsset:8,priceSourcesLinked:true,usdAmountsInCollection:216,calculationRows:108,unknownProjectFieldsRejected:true},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
