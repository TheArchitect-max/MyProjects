#!/usr/bin/env node
'use strict';
const childProcess=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),script=fs.readFileSync(path.join(root,'assets/im.js'),'utf8'),marker='render().catch';
assert(script.includes(marker));const source=script.slice(0,script.lastIndexOf(marker))+'globalThis.showroom={load,validate,home,portfolio,project,buyers,acquisition,policy,notice,filterAssets,valuation,validatePricing,calculationPage,connectionsPage,assurancePage,evidencePage,transferPage,transactionPage,commercializationPage,sourcesPage,identityPage,filterIdentity,filterConnections,validateEvaluationSources,muskPage,filterMusk,strategicEconomicScopes,strategicEconomicModel,strategicEconomicsSection,validateStrategicFit,muskSourceSection,dossierPage,portfolioThesisPage,professionalServicesPage,contributionPage,bindContribution,validateBuyerInformation,connectionValues,connectionSummary,canonicalWorkflowLink,bindConnections};})();';
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/buyer-catalogue.json'),'utf8'));
const prices=JSON.parse(fs.readFileSync(path.join(root,'assets/pricing-catalogue.json'),'utf8'));
const dossiers=JSON.parse(fs.readFileSync(path.join(root,'assets/buyer-dossiers.json'),'utf8')),applications=JSON.parse(fs.readFileSync(path.join(root,'assets/application-combinations-v2.json'),'utf8'));
const strategic=JSON.parse(fs.readFileSync(path.join(root,'assets/musk-opportunities.json'),'utf8'));
const evaluationSources=JSON.parse(fs.readFileSync(path.join(root,'assets/evaluation-sources.json'),'utf8'));
const reassessment=JSON.parse(fs.readFileSync(path.join(root,'assets/portfolio-reassessment-20261107.json'),'utf8'));
const sandbox={PricingMath:require(path.join(root,'assets/pricing-math.js')),URL,URLSearchParams,Intl,JSON,Math,Number,String,Boolean,Map,Set,console,document:{currentScript:{src:'https://thearchitect-max.github.io/MyProjects/assets/im.js'}},location:{pathname:'/MyProjects/',search:'',hash:''},fetch:async url=>{const file=new URL(url).pathname;assert(['/MyProjects/assets/buyer-catalogue.json','/MyProjects/assets/pricing-catalogue.json','/MyProjects/assets/buyer-dossiers.json','/MyProjects/assets/application-combinations-v2.json','/MyProjects/assets/evaluation-sources.json','/MyProjects/assets/musk-opportunities.json','/MyProjects/assets/portfolio-reassessment-20261107.json'].includes(file));return {ok:true,json:async()=>file.endsWith('/pricing-catalogue.json')?prices:file.endsWith('/buyer-dossiers.json')?dossiers:file.endsWith('/application-combinations-v2.json')?applications:file.endsWith('/evaluation-sources.json')?evaluationSources:file.endsWith('/musk-opportunities.json')?strategic:file.endsWith('/portfolio-reassessment-20261107.json')?reassessment:data}}};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
(async()=>{
 const r=sandbox.showroom,d=await r.load();assert.equal(d.projects.length,128);
 for(const a of d.projects){
  const html=r.project(a,d);if(process.env.SHOWROOM_RENDER_DIR){const out=path.join(process.env.SHOWROOM_RENDER_DIR,'projects',a.slug);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),html)}assert(html.includes(a.title.replaceAll('&','&amp;')));assert(html.includes(a.referenceName));assert(html.includes('Potential acquirers'));assert(html.includes(a.factsheetUrl));assert(html.includes(a.briefUrl));assert(html.includes('data-buyer-dossier=\"'+a.ref+'\"'));assert(html.includes('id=\"qualification\"'));assert(html.includes('Items to close before handover'));assert.equal((html.match(/data-project-display=/g)||[]).length,1);
  for(const field of prices.fields)assert(html.includes('data-price-field="'+field.key+'"'),a.ref+' '+field.key);
  for(const id of prices.projects.find(x=>x.ref===a.ref).sourceIds)assert(html.includes(prices.sources.find(s=>s.id===id).url));
  for(const b of a.potentialBuyers)assert(html.includes(b.replaceAll('&','&amp;')));
  assert(!/\b[a-f0-9]{40}\b/.test(html));assert(!/role-month|audit grade|new projects|recently added/i.test(html));
 }
 const renderDir=process.env.SHOWROOM_RENDER_DIR;if(renderDir)fs.mkdirSync(renderDir,{recursive:true});
 if(renderDir)fs.mkdirSync(path.join(renderDir,'acquisition-dossier'),{recursive:true});
 let pages=0;for(const name of ['home','portfolio','buyers','acquisition','policy','notice','valuation','calculationPage','connectionsPage','assurancePage','evidencePage','transferPage','transactionPage','commercializationPage','sourcesPage','identityPage','muskPage','dossierPage','portfolioThesisPage','professionalServicesPage','contributionPage']){const html=r[name](d);if(renderDir){const files={home:'index.html',calculationPage:'proof.html',connectionsPage:'connections.html',assurancePage:'assurance.html',evidencePage:'evidence.html',transferPage:'transfer.html',transactionPage:'transaction.html',commercializationPage:'commercialization.html',sourcesPage:'sources.html',identityPage:'identities.html',muskPage:'musk.html',dossierPage:'acquisition-dossier/index.html',portfolioThesisPage:'portfolio-thesis.html',professionalServicesPage:'professional-services.html',contributionPage:'contribution.html'};fs.writeFileSync(path.join(renderDir,files[name]||name+'.html'),html)}assert(html.length>1000,name);pages++;assert(!/\b[a-f0-9]{40}\b/.test(html));}
 assert.equal((r.portfolio(d).match(/data-asset-ref=/g)||[]).length,128);
 for(const c of d.categories){const rows=r.filterAssets(d,{family:c.id});assert(rows.length>0);assert(rows.every(a=>a.categoryId===c.id));}
 for(const g of d.buyerGroups){const rows=r.filterAssets(d,{buyer:g.id});assert(rows.length>0);assert(rows.every(a=>a.buyerGroupIds.includes(g.id)));}
 for(const name of ['Vesta','Asteria','Scheherazade']){const rows=r.filterAssets(d,{query:name});assert.equal(rows.length,1);assert.equal(rows[0].referenceName,name);}
 assert.equal(r.filterAssets(d,{query:'unmatched-object-xyz'}).length,0);
 assert(r.identityPage(d).includes('numbered consecutively from TA-IP-001 through TA-IP-128.'));
 assert.equal((r.identityPage(d).match(/data-identity-ref=/g)||[]).length,128);assert.equal(r.filterIdentity(d,'Lydia')[0].ref,'TA-IP-089');assert.equal(r.filterIdentity(d,'Lucia')[0].ref,'TA-IP-090');assert.equal((r.portfolio(d).match(/data-project-display=/g)||[]).length,128);assert(!/bitcoin:|<form\b/i.test(r.contributionPage()));
 assert.equal((r.valuation(d).match(/data-price-ref=/g)||[]).length,128);
 assert.equal((r.calculationPage(d).match(/data-calculation-ref=/g)||[]).length,128);
 assert.equal((r.portfolio(d).match(/data-currency="USD"/g)||[]).length,256);
 assert.equal(d.calculation.status,'PASS');assert.equal((r.connectionsPage(d).match(/data-connection-ref=/g)||[]).length,37);assert.equal((r.assurancePage(d).match(/data-assurance-ref=/g)||[]).length,128);
 assert.equal((r.sourcesPage(d).match(/data-evaluation-source=/g)||[]).length,14);assert.equal((r.sourcesPage(d).match(/data-source-asset=/g)||[]).length,128);
 assert.equal(r.filterConnections(d).length,37);assert.equal(r.filterConnections(d,{query:'Asteria'}).length,0);assert.equal(r.filterConnections(d,{query:'unmatched-connection-xyz'}).length,0);const ariadne=r.filterConnections(d,{query:'Ariadne'});assert(ariadne.length>0);assert(ariadne.every(c=>c.members.some(m=>m.ref==='TA-IP-003')));const selected=r.filterConnections(d,{asset:'TA-IP-003'});assert.equal(selected.length,ariadne.length);assert(r.filterConnections(d,{category:'Intelligence & research'}).every(c=>c.category==='Intelligence & research'));
 for(const x of evaluationSources.externalSources)assert(r.sourcesPage(d).includes(x.url));const brokenSources=JSON.parse(JSON.stringify(evaluationSources));brokenSources.externalSources[0].url='https://example.org/unattributed';assert.throws(()=>r.validateEvaluationSources(brokenSources,d));
 const strategicRows=r.filterMusk(d);assert.equal(strategicRows.length,26);assert.equal(new Set(strategicRows.map(x=>x.asset.ref)).size,26);assert.equal(d.strategic.workstreams.length,6);

 const scopes=r.strategicEconomicScopes(d);
 assert.equal(scopes.length,3);
 assert.equal(JSON.stringify(scopes.map(s=>[s.count,s.ask,s.recreation])),JSON.stringify([[14,3465000,12358000],[26,6550500,23428500],[128,23279400,108811500]]));
 assert.equal(scopes[2].rawAsk,25866000);
 const defaultCase=r.strategicEconomicModel(scopes[0],5000000,25,15,5);
 assert.equal(defaultCase.cost,866250);
 assert(Math.abs(defaultCase.breakeven-1292079.4)<2);
 assert(Math.abs(defaultCase.capacity-15894525.49)<2);
 assert(Math.abs(defaultCase.avoidedPercent-35.05)<0.01);
 const zero=r.strategicEconomicModel(scopes[0],0,25,15,5);
 assert(zero.remaining<0);
 const full=r.strategicEconomicModel(scopes[2],0,25,15,5);
 assert.equal(full.cost,5819850);
 assert(full.remaining<0);
 for(const args of [[scopes[0],-1,25,15,5],[scopes[0],5000000,101,15,5],[scopes[0],5000000,25,0,5],[scopes[0],5000000,25,15,2.5]])assert.throws(()=>r.strategicEconomicModel(...args));
 const economics=r.strategicEconomicsSection(d);
 assert(economics.includes('id="economic-case"'));
 for(const id of ['acq-scope','acq-annual','acq-integration','acq-rate','acq-years','acq-value','acq-breakeven','acq-avoid'])assert(economics.includes('id="'+id+'"'));
 assert(economics.includes('WIPO income approach')&&economics.includes('SpaceX Q3 2026 SEC filing'));
 assert(economics.includes('no company-specific benefit'));
 assert(economics.includes('unverified illustrative assumptions'));
 const musk=r.muskPage(d);assert(musk.includes('sources.html#strategic-company-sources'));assert(!musk.includes('href="#company-sources-'));assert.equal((musk.match(/data-strategic-asset=/g)||[]).length,26);assert.equal((musk.match(/data-strategic-route=/g)||[]).length,6);assert.equal((musk.match(/data-strategic-source=/g)||[]).length,0);assert.equal((r.sourcesPage(d).match(/data-strategic-source=/g)||[]).length,8);

 // Company-independent quality reference is a development ambition, never implied buyer approval.
 assert.equal((musk.match(/id="engineering-reference"/g)||[]).length,1);
 assert(musk.includes('Engineered for the most demanding technological environments.'));
 assert(musk.includes('Accessible to companies of every scale.'));
 assert(musk.includes('Independent, proprietary software and research assets developed against rigorous engineering principles'));
 assert(musk.includes('without independently recreating its entire development foundation'));
 assert(musk.includes('A benchmark for how the work is approached, not a claim of external qualification.'));
 assert(musk.includes('Reference context, not endorsement'));
 assert(musk.includes('They have <strong>not</strong> been shown to test, approve, certify, procure, sponsor or endorse'));
 assert(musk.includes('No asset is represented here as independently qualified'));
 assert(musk.includes('no savings, readiness or outcomes are guaranteed'));
 assert(musk.includes('Third-party names and trade marks remain the property of their respective owners'));
 assert(musk.includes('https://business.gov.nl/regulations/advertising/'));
 assert(musk.includes('https://eur-lex.europa.eu/eli/dir/2006/114'));
 assert(musk.includes('href="'+new URL('portfolio.html','https://thearchitect-max.github.io/MyProjects/').href+'"'));
 assert(musk.indexOf('id="engineering-reference"')<musk.indexOf('id="economic-case"'));
 assert(musk.includes('Independent seller-authored analysis. No affiliation, endorsement, commissioning or buyer interest is claimed.'));
 assert(musk.includes('id="economic-case"'));assert(musk.includes('14</td>'));assert(musk.includes('128</td>'));
 assert(musk.includes('No strategic-fit premium or package discount is added'));assert(musk.includes('Market value is not established'));assert(musk.includes('General project connections'));assert(!/github.com\/TheArchitect-max\/Strategic-Software/.test(musk));
 for(const row of strategicRows){const a=row.asset;assert(musk.includes('data-strategic-display="'+a.ref+'"'));for(const key of ['title','referenceName'])assert(musk.includes(a[key].replaceAll('&','&amp;')));for(const key of ['displayUrl','profileUrl','factsheetUrl','briefUrl'])assert(musk.includes(a[key]));}
 assert.equal((musk.match(/data-price-field=/g)||[]).length,26*8);assert.equal(r.filterMusk(d,{query:'Vespera'}).length,1);assert.equal(r.filterMusk(d,{query:'Vespera'})[0].asset.ref,'TA-IP-096');assert.equal(r.filterMusk(d,{query:'TA-IP-098'})[0].asset.referenceName,'Astrid');assert.equal(r.filterMusk(d,{query:'unmatched-strategic-xyz'}).length,0);assert.equal(r.filterMusk(d,{workstream:'invalid'}).length,0);
 for(const w of strategic.workstreams){const rows=r.filterMusk(d,{workstream:w.id});assert.equal(rows.length,w.members.length);assert(rows.every(x=>x.workstream.id===w.id));assert.equal(r.filterMusk(d,{workstream:w.id,query:'unmatched-strategic-xyz'}).length,0);}
 for(const mutate of [s=>s.workstreams[0].members.push(s.workstreams[1].members[0]),s=>s.workstreams[0].members[0].ref='TA-IP-999',s=>s.workstreams[0].members[0].privateSource='hidden',s=>s.sources[0].url='https://example.org/claim',s=>s.workstreams[0].sourceIds=['missing'],s=>s.workstreams[0].reviewPlan=[]]){const bad=JSON.parse(JSON.stringify(strategic));mutate(bad);assert.throws(()=>r.validateStrategicFit(bad,d));}
 assert.throws(()=>r.validatePricing({...prices,portfolio:{...prices.portfolio,sellerAskEUR:1}},data));
 const sorted=r.filterAssets(d,{sort:'ask-asc'});for(let i=1;i<sorted.length;i++)assert(sorted[i].askingReferenceEUR>=sorted[i-1].askingReferenceEUR);
 assert.throws(()=>r.validate({...d,projects:[{...d.projects[0],unapprovedField:'not publishable'},...d.projects.slice(1)]}));
 let loadedMathScripts=0;const cachedShell={...sandbox,PricingMath:undefined,document:{currentScript:sandbox.document.currentScript,createElement:tag=>{assert.equal(tag,'script');return {}},head:{appendChild:script=>{assert.equal(new URL(script.src).pathname,'/MyProjects/assets/pricing-math.js');loadedMathScripts++;cachedShell.PricingMath=require(path.join(root,'assets/pricing-math.js'));script.onload()}}}};
 vm.createContext(cachedShell);vm.runInContext(source,cachedShell);const cachedData=await cachedShell.showroom.load();assert.equal(cachedData.calculation.status,'PASS');assert.equal(loadedMathScripts,1);
 const navigation=r.home(d).match(/<nav class="nav-links"[\s\S]*?<\/nav>/)[0];assert.equal((navigation.match(/<a /g)||[]).length,20);assert(navigation.includes('interviews/">Interviews</a>'));assert(r.home(d).includes('Private technology.<br><em>Public proof.</em>'));assert(r.home(d).includes('Philosopher in Meditation'));assert(r.dossierPage(d).includes('128 assets'));

 // Portfolio-level ambition is explicit, verbatim, and never presented as a completed project.
 const completionCopy=[
  'Every project in THE ARCHITECT portfolio is conceived with the long-term objective of achieving its fully defined product vision. Development follows a structured, evidence-driven roadmap toward comprehensive functionality, engineering maturity, validation, and commercial or scientific readiness, where technically feasible.',
  'Current development status must not be confused with the ultimate project objective. Each asset retains its independent architecture, intellectual property identity, development roadmap, and acceptance criteria.',
  'Full realization remains subject to technical feasibility, successful validation, available resources, and applicable regulatory requirements.'
 ];
 const completionHome=r.home(d);
 assert.equal((completionHome.match(/id="completion-commitment"/g)||[]).length,1);
 assert(completionHome.includes('<h2 id="completion-commitment-title">Our Commitment to Complete Product Realization</h2>'));
 for(const paragraph of completionCopy)assert(completionHome.includes('<p>'+paragraph+'</p>'));
 assert(completionHome.indexOf('class="ledger-strip"')<completionHome.indexOf('id="completion-commitment"'));
 assert(completionHome.indexOf('id="completion-commitment"')<completionHome.indexOf('id="full-portfolio-offer"'));
 assert(completionHome.includes('Long-term intent · Distinct from each asset'));
 assert(completionHome.includes('/MyProjects/assurance.html'));
 assert(completionHome.includes('/MyProjects/portfolio-thesis.html'));
 assert(!r.portfolio(d).includes('id="completion-commitment"'));
 assert(!r.muskPage(d).includes('id="completion-commitment"'));
 assert(!r.project(d.projects[0],d).includes('id="completion-commitment"'));
 assert(!completionHome.includes('Remaining Development Roadmap'));
 assert(!completionHome.includes('Ultimate Objective</h'));
 // Shared assets are allowed across workflows, while each route retains unique members.
 const connected=new Set();let occurrences=0;for(const c of d.applications.connections){assert.equal(new Set(c.members.map(m=>m.ref)).size,c.members.length);for(const m of c.members){connected.add(m.ref);occurrences++}}
 assert.equal(connected.size,84);assert.equal(occurrences,87);assert(!connected.has('TA-IP-107'));
 const planning=r.filterConnections(d,{asset:'TA-IP-075'});assert.deepEqual(Array.from(planning,c=>c.id),['TA-CN-032','TA-CN-035']);
 const unionRefs=['TA-IP-042','TA-IP-075','TA-IP-102'],combined=r.connectionValues(planning,d);
 for(const f of prices.fields){const expected=unionRefs.reduce((n,ref)=>n+prices.projects.find(p=>p.ref===ref).values[f.key],0);assert.equal(combined[f.key],expected,'shared QUBO counted once for '+f.key)}
 assert(r.connectionSummary(planning,d).includes('3 distinct assets'));
 assert(Object.values(r.connectionValues([],d)).every(n=>n===0));
 const byId=id=>applications.connections.find(c=>c.id===id);
 assert(!byId('TA-CN-015').members.some(m=>m.ref==='TA-IP-105'));
 assert.deepEqual(byId('TA-CN-022').members.map(m=>m.ref),['TA-IP-016','TA-IP-006']);
 assert.deepEqual(byId('TA-CN-034').members.map(m=>m.ref),['TA-IP-016','TA-IP-072']);
 assert.equal(byId('TA-CN-029').status,'Redesign required');assert.equal(byId('TA-CN-006').status,'Research hold');assert.equal(byId('TA-CN-037').status,'Research hold');
 for(const status of new Set(applications.connections.map(c=>c.status))){const rows=r.filterConnections(d,{status});assert(rows.length>0);assert(rows.every(c=>c.status===status))}
 assert.equal(r.filterConnections(d,{status:'Research hold',asset:'TA-IP-075'}).length,0);
 assert.equal(r.filterConnections(d,{query:'source-revision manifest',asset:'TA-IP-108'}).length,1);
 const connectionHTML=r.connectionsPage(d),connectionText=connectionHTML.replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&gt;','>').replaceAll('&lt;','<').replaceAll('&amp;','&');for(const c of applications.connections){assert(connectionText.includes(c.review.summary));for(const h of c.handoffs){assert(connectionText.includes(h.artifact));assert(connectionText.includes(h.acceptance))}}
 assert(connectionHTML.includes('id="connection-status"'));assert(connectionHTML.includes('id="connection-selection"'));assert(connectionHTML.includes('application-combinations-v2.json'));
 const spuf=r.project(d.projects.find(a=>a.ref==='TA-IP-016'),d);assert(spuf.includes('#bioacoustic-signal-review'));assert(spuf.includes('#radioastronomy-signal-review'));
 const operationLinks=r.canonicalWorkflowLink(d.projects.find(a=>a.ref==='TA-IP-102'),d);assert(operationLinks.includes('TA-CN-027'));assert(operationLinks.includes('TA-CN-035'));
 assert(!r.project(d.projects.find(a=>a.ref==='TA-IP-107'),d).includes('id="application-context"'));
 const reversed={...d,applications:{...d.applications,connections:[...d.applications.connections].reverse()}};
 r.validateStrategicFit(strategic,reversed); // Primary navigation must not depend on array order.
 for(const mutate of [
  a=>a.connections.push({...a.connections[0],slug:'other-slug'}),
  a=>a.connections[1].slug=a.connections[0].slug,
  a=>a.connections[0].members.push(a.connections[0].members[0]),
  a=>a.connections[0].members[0].ref='TA-IP-107',
  a=>a.connections[0].status='Integrated and production-ready',
  a=>a.connections[0].review.summary='',
  a=>a.connections[0].handoffs[0].to='TA-IP-128',
  a=>a.connections[0].handoffs[0].to=a.connections[0].handoffs[0].from,
  a=>a.connections[0].handoffs[0].acceptance='',
  a=>a.connections[0].handoffs.push(a.connections[0].handoffs[0]),
  a=>a.connections[2].handoffs.pop(),
  a=>a.connections[0].privateSource='unexpected'
 ]){const bad=JSON.parse(JSON.stringify(applications));mutate(bad);assert.throws(()=>r.validateBuyerInformation(dossiers,bad,d))}
 // Exercise the actual filter binding, including URL initialization and empty/reset totals.
 const handlers={},elements={};for(const id of ['connection-search','connection-category','connection-asset','connection-status'])elements[id]={value:id==='connection-search'?'':'all',options:[{value:'all'},...((id==='connection-status')?['Research hold','Research proposal'].map(value=>({value})):id==='connection-asset'?[{value:'TA-IP-075'}]:[])],addEventListener:(event,fn)=>{handlers[id]=fn}};
 for(const id of ['connection-list','connection-count','connection-empty','connection-selection'])elements[id]={innerHTML:'',textContent:'',hidden:false};
 sandbox.document.getElementById=id=>elements[id];sandbox.location.search='?asset=TA-IP-075&status=Research%20proposal';r.bindConnections(d);
 assert.equal(elements['connection-asset'].value,'TA-IP-075');assert.equal(elements['connection-status'].value,'Research proposal');assert.equal(elements['connection-count'].textContent,'2 of 37 connections');
 assert(elements['connection-selection'].innerHTML.includes('3 distinct assets'));assert(elements['connection-empty'].hidden);
 elements['connection-search'].value='unmatched-connection-xyz';handlers['connection-search']();assert.equal(elements['connection-count'].textContent,'0 of 37 connections');assert(elements['connection-selection'].innerHTML.includes('0 distinct assets'));assert(!elements['connection-empty'].hidden);
 for(const id of ['connection-category','connection-asset','connection-status'])elements[id].value='all';elements['connection-search'].value='';handlers['connection-search']();assert.equal(elements['connection-count'].textContent,'37 of 37 connections');assert(elements['connection-selection'].innerHTML.includes('84 distinct assets'));assert(elements['connection-empty'].hidden);sandbox.location.search='';
 // A cached v40 bundle must still load its unchanged 33-route v1 endpoint.
 const oldScript=childProcess.execFileSync('git',['show','34378bdffd921e33a2b40bf574fcfda64594774c:assets/im.js'],{cwd:root,encoding:'utf8'}),legacy=JSON.parse(fs.readFileSync(path.join(root,'assets/application-combinations.json'),'utf8'));
 assert.equal(legacy.connections.length,33);
 const oldSandbox={...sandbox,document:{currentScript:{src:'https://thearchitect-max.github.io/MyProjects/assets/im.js'}},fetch:async url=>{const file=new URL(url).pathname;return {ok:true,json:async()=>file.endsWith('/application-combinations.json')?legacy:file.endsWith('/pricing-catalogue.json')?prices:file.endsWith('/buyer-dossiers.json')?dossiers:file.endsWith('/evaluation-sources.json')?evaluationSources:file.endsWith('/musk-opportunities.json')?strategic:file.endsWith('/portfolio-reassessment-20261107.json')?reassessment:data}}};
 vm.createContext(oldSandbox);vm.runInContext(oldScript.slice(0,oldScript.lastIndexOf(marker))+'globalThis.cachedLoad=load;})();',oldSandbox);const oldData=await oldSandbox.cachedLoad();assert.equal(oldData.applications.connections.length,33);

 for(const w of d.strategic.workstreams)for(const m of w.members){const c=d.applications.connections.find(c=>c.members.some(x=>x.ref===m.ref));assert(c?d.applications.connections.some(c=>c.id===m.canonicalConnectionId&&c.members.some(x=>x.ref===m.ref)):m.canonicalConnectionId===null)}
 const badLink=JSON.parse(JSON.stringify(d.strategic));badLink.workstreams[0].members[0].canonicalConnectionId='TA-CN-999';assert.throws(()=>r.validateStrategicFit(badLink,d));
 // Check the public destination independently, including the Base58Check checksum.
 const address='38dn8ZDf11cYSMv8X1UUARsE2wqdmtjd36',contribution=r.contributionPage();
 assert(contribution.includes('readonly spellcheck="false" aria-describedby="btc-network-warning">'+address+'</textarea>'));
 assert(contribution.includes('Send only BTC on the Bitcoin network.'));
 assert(contribution.includes('No source-code access, software license, ownership rights or exclusive rights.'));
 assert(contribution.includes('No entitlement to development work'));
 assert(contribution.includes('No equity, profit share, investment return or repayment promise.'));
 assert(r.home(d).includes('View voluntary contribution details'));
 assert(r.professionalServicesPage().includes('Voluntary BTC contribution details'));
 const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';let decoded=0n;
 for(const ch of address){assert(alphabet.includes(ch));decoded=decoded*58n+BigInt(alphabet.indexOf(ch));}
 const raw=Buffer.from(decoded.toString(16).padStart(50,'0'),'hex'),sha=x=>require('node:crypto').createHash('sha256').update(x).digest();
 assert.equal(raw.length,25);assert.equal(raw[0],5);assert(raw.subarray(21).equals(sha(sha(raw.subarray(0,21))).subarray(0,4)));
 let click,copied,focused=false,addressSelected=false;const status={textContent:''};
 sandbox.document.getElementById=id=>({'copy-btc-address':{addEventListener:(event,fn)=>{assert.equal(event,'click');click=fn}},'btc-contribution-address':{focus:()=>{focused=true},select:()=>{addressSelected=true}},'btc-copy-status':status}[id]);
 sandbox.navigator={clipboard:{writeText:async value=>{copied=value}}};r.bindContribution();await click();
 assert.equal(copied,address);assert(status.textContent.includes('BTC address copied'));
 sandbox.navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied')};await click();assert(focused&&addressSelected);assert(status.textContent.includes('selected'));
 console.log(JSON.stringify({result:'PASS',contributionAddressChecksumValid:true,contributionCopyAndFallbackChecked:true,buyerProfilesRendered:128,mainPagesRendered:pages,applicationFilters:12,buyerFilters:10,uniqueProjectPresentations:128,perAssetBuyerFitAndDocuments:true,completePriceRecords:128,priceFieldsPerAsset:8,priceSourcesLinked:true,usdAmountsInCollection:256,calculationRows:128,unknownProjectFieldsRejected:true,strategicWorkstreams:6,distinctStrategicAssets:26,officialCompanySources:8,strategicSchemaAndFiltersChecked:true,connectionRoutes:37,distinctConnectedAssets:84,versionedConnectionMigrationChecked:true,overlappingAssetTotalsDeduplicated:true,connectionStageAndDOMFiltersChecked:true,connectionSchemaNegativeCases:12},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
