#!/usr/bin/env node
'use strict';
// Exercise the actual display decorators repeatedly; live browser QA is separate.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const original=fs.readFileSync(path.join(root,'assets/public-sites.js'),'utf8');
const source=original.slice(0,original.lastIndexOf('load().then(ctx=>'))+'globalThis.siteRuntime={load,decorateProject,decorateListings,decorateHome,decorateProof};})();';
class Container{
 constructor(project){this.html='';this.project=project;this.insertionCount=0}
 querySelector(selector){
  if(selector==='[data-public-site-link]')return this.html.includes('data-public-site-link=')?{}:null;
  if(selector==='[data-display-collection]')return this.html.includes('data-display-collection')?{}:null;
  if(selector==='.row-main')return this;
  if(selector==='.row-main h2 a,h3 a')return {href:`https://thearchitect-max.github.io/MyProjects/projects/${this.project.slug}/`};
  if(selector==='.actions')return this.actions;
  return null;
 }
 insertAdjacentHTML(position,html){assert.equal(position,'beforeend');this.html+=html;this.insertionCount++}
}
let nodes=new Map(),rows=[],overrideSites=null;
const sandbox={URL,TextEncoder,Uint8Array,Map,Set,JSON,String,console,crypto:webcrypto,
 document:{currentScript:{src:'https://thearchitect-max.github.io/MyProjects/assets/public-sites.js'},querySelector:s=>nodes.get(s)||null,querySelectorAll:s=>s==='.collection-row,.asset-card'?rows:[]},
 location:{href:'https://thearchitect-max.github.io/MyProjects/'},
 fetch:async url=>{const file=new URL(url).pathname.split('/assets/')[1];return{ok:true,text:async()=>file==='public-sites.json'&&overrideSites?JSON.stringify(overrideSites):fs.readFileSync(path.join(root,'assets',file),'utf8')}}};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
(async()=>{
 const r=sandbox.siteRuntime,ctx=await r.load();
 for(const site of ctx.directory.sites){
  const hero=new Container(),dl=new Container();nodes=new Map([['.asset-hero .actions',hero],['.profile-panel dl',dl]]);
  sandbox.location.href=site.profileUrl;
  for(let n=0;n<3;n++)r.decorateProject(ctx);
  assert.equal((hero.html.match(/data-public-site-link=/g)||[]).length,1,site.ref);
  assert.equal(dl.html,'',site.ref);
 }
 nodes=new Map();rows=ctx.directory.sites.map(s=>new Container(s));
 for(let n=0;n<3;n++)r.decorateListings(ctx);
 assert.equal(rows.reduce((n,row)=>n+(row.html.match(/data-public-site-link=/g)||[]).length,0),105);
 const hero=new Container();hero.actions=new Container();const main=new Container();
 nodes=new Map([['.hero-tenebrist',hero],['main',main]]);
 for(let n=0;n<3;n++)r.decorateHome(ctx);
 assert.equal(hero.actions.insertionCount,1);assert.equal(main.html,'');
 for(const field of ['ref','url']){
  overrideSites=JSON.parse(JSON.stringify(ctx.directory));overrideSites.sites[1][field]=overrideSites.sites[0][field];
  await assert.rejects(r.load(),/identity mismatch/);
 }
 overrideSites=null;
 const result={result:'PASS',canonicalDisplayRecords:105,profileDecoratorsChecked:105,repeatedDecorationPasses:3,collectionDisplayLinks:105,profileDisplayLinksPerProject:1,extraHomepageDisplayCards:0,duplicateReferenceAndURLRejected:true,browserDOMExecuted:false};
 const text=JSON.stringify(result,null,2)+'\n';if(process.argv[2])fs.writeFileSync(process.argv[2],text);process.stdout.write(text);
})().catch(error=>{console.error(error);process.exitCode=1});
