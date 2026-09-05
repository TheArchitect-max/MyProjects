#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p)),exists=p=>fs.existsSync(path.join(root,p)),assert=(c,m)=>{if(!c)throw new Error(m)};
const d=json('assets/im-data.json'),a=d.a,rc=json('assets/recreation-costs.json');
assert(d.v==='2026.09.05-im7'&&rc.v==='2026.09.05-im7','IM7 data versions');
assert(d.p[0]===68&&a.length===68&&rc.assets.length===68,'active asset count');
assert(new Set(a.map(x=>x[1])).size===68&&new Set(a.map(x=>x[2])).size===68,'unique refs/slugs');
assert(!a.some(x=>x[1]==='TA-IP-014'||x[2]==='aegis-vision-offline'),'withdrawn TA-IP-014 absent');
assert(a.some(x=>x[1]==='TA-IP-069'&&x[2]==='chimera-spectral-perception-system'),'TA-IP-069 retained');
assert(a.every(x=>/^TA-IP-\d{3}$/.test(x[1])),'reference format');
assert(a.every(x=>x[1]===`TA-IP-${String(x[0]).padStart(3,'0')}`),'stable id/ref mapping');
a.forEach((x,i)=>{assert(x[9]<=x[8]&&x[8]<=x[10],`range ${x[1]}`);assert(Number(rc.assets[i])>0,`recreation ${x[1]}`);assert(!x[11],`stale external URL ${x[1]}`)});
const sum=i=>a.reduce((n,x)=>n+Number(x[i]),0),count=i=>a.reduce((m,x)=>(m[x[i]]=(m[x[i]]||0)+1,m),{});
assert(sum(8)===11725000&&sum(9)===9355000&&sum(10)===14675000,'portfolio values');
assert(rc.portfolioRecreationCostEUR===47070000&&rc.assets.reduce((n,x)=>n+Number(x),0)===47070000,'recreation cost');
const sc=count(5),pc=count(6);assert(sc.V===36&&sc.P===27&&sc.R===5,'stage counts');assert(pc.VH===13&&pc.H===33&&pc.M===13&&pc.S===9,'potential counts');
assert(d.fx[0]===1.1622&&d.fx[1]==='2026-09-04','FX');
for(const page of ['index.html','portfolio.html','opportunity.html','transaction.html','notice.html']){const h=read(page);assert(h.includes('Information Memorandum'),page);assert(h.includes('rel="canonical"'),`canonical ${page}`);assert(h.includes('im4.css?v=im7'),`IM7 cache ${page}`)}
const expected=new Set(a.map(x=>x[2])),actual=new Set(fs.readdirSync(path.join(root,'projects'),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name));
assert(actual.size===expected.size,'project directory count');for(const x of expected)assert(actual.has(x),`missing project ${x}`);for(const x of actual)assert(expected.has(x),`stale project ${x}`);
for(const x of a){const p=`projects/${x[2]}/index.html`;assert(exists(p),`missing ${x[2]}`);const h=read(p);assert(h.includes('../../assets/im-data.json')&&h.includes('../../assets/im.js?v=im7')&&h.includes('../../assets/im4.css?v=im7')&&!h.includes('noindex'),`profile ${x[2]}`)}
const forbidden=['systemic-absolute-topology','lewis-hybrid-llm-orchestrator','sentinelbio-verify','agentic-engineering-control-plane','best-of-github-agentic-engineering','axiomcrypt','shield-breaker-research','titan-evtol-research-platform','avedi','biospeak','sovereign-commerce-engine','unified-execution-engine','aegis-vision-offline'];
for(const x of forbidden)assert(!exists(`projects/${x}`),`withdrawn route ${x}`);
const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);assert(locs.length===73&&new Set(locs).size===73,'sitemap');for(const x of a)assert(locs.includes(`https://thearchitect-max.github.io/MyProjects/projects/${x[2]}/`),`sitemap ${x[2]}`);assert(!locs.some(x=>x.includes('aegis-vision-offline')),'withdrawn sitemap route');
const js=read('assets/im.js');new vm.Script(js,{filename:'assets/im.js'});assert(!js.includes('const aliases='),'legacy alias runtime removed');assert(!js.includes('SonicFabric-Site'),'stale SonicFabric link removed');
if(exists('assets/im4.css')){const css=read('assets/im4.css');assert(css.includes('.memorandum-card>strong')&&css.includes('white-space:nowrap')&&css.includes('min-width:0')&&css.includes('@media(max-width:640px)'),'responsive finance CSS')}
assert(!exists('evidence'),'evidence directory must not be in public tree');assert(!exists('.github/workflows'),'GitHub Actions workflows prohibited');
console.log(JSON.stringify({informationMemorandum:true,presentationRelease:'IM7',activeAssets:68,withdrawnReferences:['TA-IP-014'],highestStableReference:'TA-IP-069',askingReferenceEUR:11725000,rangeEUR:[9355000,14675000],recreationCostEUR:47070000,stageCounts:{developedSoftware:36,developedPrototype:27,researchStage:5},potentialCounts:{veryHigh:13,high:33,moderate:13,specialist:9},sitemapUrls:73,staleProjectRoutes:0,staleExternalUrls:0,githubActions:false},null,2));
