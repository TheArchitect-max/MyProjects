#!/usr/bin/env node
'use strict';
// Execute the actual data loader and HTML render functions without a browser.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'assets/im.js'),'utf8');
const marker='render().catch(e=>';
assert(script.includes(marker));
const prefix=script.slice(0,script.lastIndexOf(marker));
const source=prefix+'globalThis.catalogueRuntime={load,home,portfolio,project,proofPage,connectionsPage,assurancePage,valuation,developmentPage,policyPage};})();';
const sandbox={URL,URLSearchParams,TextEncoder,Uint8Array,Map,Set,Intl,Number,String,Boolean,JSON,Math,Date,console,crypto:webcrypto,
 document:{currentScript:{src:'https://thearchitect-max.github.io/MyProjects/assets/im.js'}},
 location:{href:'https://thearchitect-max.github.io/MyProjects/',pathname:'/MyProjects/'},
 fetch:async url=>{
  const file=new URL(url).pathname.split('/assets/')[1];
  assert(file && !file.includes('..'));
  const content=fs.readFileSync(path.join(root,'assets',file),'utf8');
  return {ok:true,text:async()=>content};
 }};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'assets/im.js'});
(async()=>{
 const r=sandbox.catalogueRuntime;
 const data=await r.load();
 assert.equal(data.projects.length,105);
 assert(data.integrity.ok);assert(data.reconciliation.ok);
 const identities=new Map(data.identities.projects.map(p=>[p.ref,p]));
 let profileCount=0;
 const renderedPageAnchors={};
 const anchorIds=html=>[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 for(const project of data.projects){
  const html=r.project(project,data);
  assert(html.includes('<h1>'));
  assert(html.includes(project.ref));
  assert.equal(project.name,identities.get(project.ref).title);
  assert(!/OSSN-UAP|SourceVector Intelligence Platform|TrueLane Flora/.test(html),project.ref);
  assert.equal((html.match(/data-project-valuation-review=/g)||[]).length,1,project.ref);
  assert(html.includes('Comparable-sale valuation: NOT_ESTABLISHED'));
  renderedPageAnchors[`projects/${project.slug}/index.html`]=anchorIds(html);
  profileCount++;
 }
 let pages=0;
 const pageNames={home:'index.html',portfolio:'portfolio.html',proofPage:'proof.html',connectionsPage:'connections.html',assurancePage:'assurance.html',valuation:'valuation.html',developmentPage:'development.html',policyPage:'policy.html'};
 for(const name of Object.keys(pageNames)){
  const html=r[name](data);assert.equal(typeof html,'string');assert(html.length>1000,name);pages++;
  renderedPageAnchors[pageNames[name]]=anchorIds(html);
 }
 const reviews=data.valuationSourceRegister.projects;
 assert.equal(reviews.length,105);assert.equal(new Set(reviews.map(p=>p.ref)).size,105);
 const statusCounts={};for(const p of reviews){statusCounts[p.costEvidence.status]=(statusCounts[p.costEvidence.status]||0)+1;assert.equal(p.source.head,data.presentation.projects.find(x=>x.ref===p.ref).defaultBranchBaselineCommit);assert.equal(p.source.productTestsExecutedForThisReview,false)}
 assert.equal(statusCounts.LEGACY_COST_REFERENCE_ONLY,91);assert.equal(statusCounts.PARTIAL_WORK_PACKAGE_BASIS,6);assert.equal(statusCounts.BASE_AND_INCREMENT_BUDGETS_RECONCILE,8);
 const valuationHTML=r.valuation(data);
 assert.equal((valuationHTML.match(/data-valuation-review="TA-IP-/g)||[]).length,105);
 assert(!valuationHTML.includes('Frozen MIPP source:'));
 const result={result:'PASS',runtime:'Node VM executing the actual browser data loader and HTML generators',profileRenderFunctions:profileCount,mainPageRenderFunctions:pages,individualFinancialReviews:105,costEvidenceCounts:statusCounts,registerIntegrity:true,financialReconciliation:true,browserLayoutExecuted:false};
 const text=JSON.stringify(result,null,2)+'\n';
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({...result,renderedPageAnchors},null,2)+'\n');
 process.stdout.write(text);
})().catch(error=>{console.error(error);process.exitCode=1});
