#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p)),exists=p=>fs.existsSync(path.join(root,p)),assert=(c,m)=>{if(!c)throw new Error(m)};
const d=json('assets/im-data.json'),a=d.a,rc=json('assets/recreation-costs.json');
assert(d.v==='2026.09.06-im10'&&rc.v==='2026.09.06-im10','IM10 data versions');
assert(d.p[0]===75&&a.length===75&&rc.assets.length===75,'active asset count');
assert(new Set(a.map(x=>x[1])).size===75&&new Set(a.map(x=>x[2])).size===75,'unique refs/slugs');
assert(!a.some(x=>x[1]==='TA-IP-014'||x[2]==='aegis-vision-offline'),'withdrawn TA-IP-014 absent');
assert(a.every(x=>/^TA-IP-\d{3}$/.test(x[1])),'reference format');assert(a.every(x=>x[1]===`TA-IP-${String(x[0]).padStart(3,'0')}`),'stable id/ref mapping');
a.forEach((x,i)=>{assert(x[9]<=x[8]&&x[8]<=x[10],`range ${x[1]}`);assert(Number(rc.assets[i])>0,`recreation ${x[1]}`);assert(!x[11],`stale external URL ${x[1]}`)});
const sum=i=>a.reduce((n,x)=>n+Number(x[i]),0),count=i=>a.reduce((m,x)=>(m[x[i]]=(m[x[i]]||0)+1,m),{}),byRef=ref=>a.find(x=>x[1]===ref);
assert(sum(8)===12950000&&sum(9)===10325000&&sum(10)===16225000,'portfolio values');assert(rc.portfolioRecreationCostEUR===54120000&&rc.assets.reduce((n,x)=>n+Number(x),0)===54120000,'recreation cost');
const sc=count(5),pc=count(6);assert(sc.V===38&&sc.P===31&&sc.R===6,'stage counts');assert(pc.VH===15&&pc.H===37&&pc.M===13&&pc.S===10,'potential counts');assert(d.fx[0]===1.1622&&d.fx[1]==='2026-09-04','FX');
const contracts={
'TA-IP-036':[36,'TA-IP-036','advanced-ground-vehicle-engineering','Advanced Ground Vehicle Engineering',1,'P','M',1,55000,45000,70000,''],
'TA-IP-059':[59,'TA-IP-059','fusionlunar-energy-systems-engineering-platform','FusionLunar Energy Systems Engineering Platform',6,'P','M',1,225000,180000,280000,''],
'TA-IP-071':[71,'TA-IP-071','adaptive-audio-synthesis-platform','Adaptive Audio Synthesis Platform',5,'P','M',6,75000,60000,95000,''],
'TA-IP-072':[72,'TA-IP-072','adaptive-cognitive-runtime','Adaptive Cognitive Runtime',0,'P','H',1,110000,85000,140000,''],
'TA-IP-073':[73,'TA-IP-073','content-integrity-assurance-platform','Content Integrity Assurance Platform',3,'P','H',4,140000,110000,175000,''],
'TA-IP-074':[74,'TA-IP-074','radioastronomy-signal-validation-platform','Radioastronomy Signal Validation Platform — VelaTrace',6,'V','H',1,160000,125000,200000,''],
'TA-IP-075':[75,'TA-IP-075','spatial-wearable-perception-platform','Spatial Wearable Perception Platform',0,'P','H',1,140000,110000,180000,''],
'TA-IP-076':[76,'TA-IP-076','telluric-actualization-research-platform','Telluric Actualization Research Platform',6,'R','S',1,25000,20000,35000,'']};
for(const [ref,v] of Object.entries(contracts))assert(JSON.stringify(byRef(ref))===JSON.stringify(v),`${ref} contract`);
for(const page of ['index.html','portfolio.html','opportunity.html','transaction.html','notice.html']){const h=read(page);assert(h.includes('Information Memorandum'),page);assert(h.includes('rel="canonical"'),`canonical ${page}`);assert(h.includes('im4.css?v=im10'),`IM10 cache ${page}`)}
const home=read('index.html');assert(home.includes('75 proprietary software and digital intellectual-property assets')&&home.includes('id="asset-count">75')&&home.includes('id="software-count">38')&&home.includes('id="prototype-count">31')&&home.includes('id="research-count">6'),'homepage static fallback counts');
const expected=new Set(a.map(x=>x[2])),actual=new Set(fs.readdirSync(path.join(root,'projects'),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name));assert(actual.size===expected.size,'project directory count');for(const x of expected)assert(actual.has(x),`missing project ${x}`);for(const x of actual)assert(expected.has(x),`stale project ${x}`);
for(const x of a){const p=`projects/${x[2]}/index.html`;assert(exists(p),`missing ${x[2]}`);const h=read(p);assert(h.includes('../../assets/im-data.json')&&h.includes('../../assets/im.js?v=im10')&&h.includes('../../assets/im4.css?v=im10')&&!h.includes('noindex'),`profile ${x[2]}`)}
const forbidden=['systemic-absolute-topology','lewis-hybrid-llm-orchestrator','sentinelbio-verify','agentic-engineering-control-plane','best-of-github-agentic-engineering','axiomcrypt','shield-breaker-research','titan-evtol-research-platform','avedi','biospeak','sovereign-commerce-engine','unified-execution-engine','aegis-vision-offline','unifiedcannabis','aegis-vision'];for(const x of forbidden)assert(!exists(`projects/${x}`),`withdrawn route ${x}`);
const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);assert(locs.length===80&&new Set(locs).size===80,'sitemap');for(const x of a)assert(locs.includes(`https://thearchitect-max.github.io/MyProjects/projects/${x[2]}/`),`sitemap ${x[2]}`);
const js=read('assets/im.js');new vm.Script(js,{filename:'assets/im.js'});assert(js.includes("VERSION='im10'")&&js.includes("DATA_VERSION='2026.09.06-im10'"),'IM10 runtime');assert(!js.includes('SonicFabric-Site'),'stale SonicFabric link removed');
assert(!exists('evidence'),'evidence directory must not be in public tree');assert(!exists('.github/workflows'),'GitHub Actions workflows prohibited');
console.log(JSON.stringify({informationMemorandum:true,presentationRelease:'IM10',activeAssets:75,newReferences:['TA-IP-071','TA-IP-072','TA-IP-073','TA-IP-074','TA-IP-075','TA-IP-076'],withdrawnReferences:['TA-IP-014'],highestStableReference:'TA-IP-076',askingReferenceEUR:12950000,rangeEUR:[10325000,16225000],recreationCostEUR:54120000,stageCounts:{developedSoftware:38,developedPrototype:31,researchStage:6},potentialCounts:{veryHigh:15,high:37,moderate:13,specialist:10},sitemapUrls:80,staleProjectRoutes:0,staleExternalUrls:0,githubActions:false},null,2));
