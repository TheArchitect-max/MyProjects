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
 for(const project of data.projects){
  const html=r.project(project,data);
  assert(html.includes('<h1>'));
  assert(html.includes(project.ref));
  assert.equal(project.name,identities.get(project.ref).title);
  assert(!/OSSN-UAP|SourceVector Intelligence Platform|TrueLane Flora/.test(html),project.ref);
  profileCount++;
 }
 let pages=0;
 for(const name of ['home','portfolio','proofPage','connectionsPage','assurancePage','valuation','developmentPage','policyPage']){
  const html=r[name](data);assert.equal(typeof html,'string');assert(html.length>1000,name);pages++;
 }
 const result={result:'PASS',runtime:'Node VM executing the actual browser data loader and HTML generators',profileRenderFunctions:profileCount,mainPageRenderFunctions:pages,registerIntegrity:true,financialReconciliation:true,browserLayoutExecuted:false};
 const text=JSON.stringify(result,null,2)+'\n';
 if(process.argv[2])fs.writeFileSync(process.argv[2],text);
 process.stdout.write(text);
})().catch(error=>{console.error(error);process.exitCode=1});
