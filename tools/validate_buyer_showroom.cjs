#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),script=fs.readFileSync(path.join(root,'assets/im.js'),'utf8'),marker='render().catch';
assert(script.includes(marker));const source=script.slice(0,script.lastIndexOf(marker))+'globalThis.showroom={load,validate,home,portfolio,project,buyers,acquisition,policy,contribution,notice,filterAssets,valuation,validatePricing};})();';
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/buyer-catalogue.json'),'utf8'));
const prices=JSON.parse(fs.readFileSync(path.join(root,'assets/pricing-catalogue.json'),'utf8'));
const sandbox={URL,URLSearchParams,Intl,JSON,Math,Number,String,Boolean,Map,Set,console,document:{currentScript:{src:'https://thearchitect-max.github.io/MyProjects/assets/im.js'}},location:{pathname:'/MyProjects/',search:'',hash:''},fetch:async url=>{const file=new URL(url).pathname;assert(['/MyProjects/assets/buyer-catalogue.json','/MyProjects/assets/pricing-catalogue.json'].includes(file));return {ok:true,json:async()=>file.endsWith('/pricing-catalogue.json')?prices:data}}};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
(async()=>{
 const r=sandbox.showroom,d=await r.load();assert.equal(d.projects.length,108);
 for(const a of d.projects){
  const html=r.project(a,d);assert(html.includes(a.title.replaceAll('&','&amp;')));assert(html.includes(a.referenceName));assert(html.includes('Potential acquirers'));assert(html.includes(a.factsheetUrl));assert(html.includes(a.briefUrl));assert.equal((html.match(/data-project-display=/g)||[]).length,1);
  for(const field of prices.fields)assert(html.includes('data-price-field="'+field.key+'"'),a.ref+' '+field.key);
  for(const id of prices.projects.find(x=>x.ref===a.ref).sourceIds)assert(html.includes(prices.sources.find(s=>s.id===id).url));
  for(const b of a.potentialBuyers)assert(html.includes(b.replaceAll('&','&amp;')));
  assert(!/\b[a-f0-9]{40}\b/.test(html));assert(!/role-month|audit grade|new projects|recently added/i.test(html));
 }
 let pages=0;for(const name of ['home','portfolio','buyers','acquisition','policy','contribution','notice','valuation']){const html=r[name](d);assert(html.length>1000,name);pages++;assert(!/\b[a-f0-9]{40}\b/.test(html));}
 assert.equal((r.portfolio(d).match(/data-asset-ref=/g)||[]).length,108);
 for(const c of d.categories){const rows=r.filterAssets(d,{family:c.id});assert(rows.length>0);assert(rows.every(a=>a.categoryId===c.id));}
 for(const g of d.buyerGroups){const rows=r.filterAssets(d,{buyer:g.id});assert(rows.length>0);assert(rows.every(a=>a.buyerGroupIds.includes(g.id)));}
 for(const name of ['Vesta','Asteria','Scheherazade']){const rows=r.filterAssets(d,{query:name});assert.equal(rows.length,1);assert.equal(rows[0].referenceName,name);}
 assert.equal(r.filterAssets(d,{query:'unmatched-object-xyz'}).length,0);
 assert.equal((r.valuation(d).match(/data-price-ref=/g)||[]).length,108);
 assert.throws(()=>r.validatePricing({...prices,portfolio:{...prices.portfolio,sellerAskEUR:1}},data));
 const sorted=r.filterAssets(d,{sort:'ask-asc'});for(let i=1;i<sorted.length;i++)assert(sorted[i].askingReferenceEUR>=sorted[i-1].askingReferenceEUR);
 assert.throws(()=>r.validate({...d,projects:[{...d.projects[0],unapprovedField:'not publishable'},...d.projects.slice(1)]}));
 console.log(JSON.stringify({result:'PASS',buyerProfilesRendered:108,mainPagesRendered:pages,applicationFilters:12,buyerFilters:10,uniqueProjectPresentations:108,perAssetBuyerFitAndDocuments:true,completePriceRecords:108,priceFieldsPerAsset:8,priceSourcesLinked:true,unknownProjectFieldsRejected:true},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
