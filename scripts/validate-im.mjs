#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p)),exists=p=>fs.existsSync(path.join(root,p)),assert=(c,m)=>{if(!c)throw new Error(m)};
const d=json('assets/im-data.json'),a=d.a,rc=json('assets/recreation-costs.json');
assert(d.v==='2026.09.05-im5'&&rc.v==='2026.09.05-im5','IM5 data versions');
assert(d.p[0]===68&&a.length===68&&rc.assets.length===68,'asset count');
assert(new Set(a.map(x=>x[1])).size===68&&new Set(a.map(x=>x[2])).size===68,'unique refs/slugs');
a.forEach((x,i)=>{assert(x[0]===i+1,`id ${i+1}`);assert(x[1]===`TA-IP-${String(i+1).padStart(3,'0')}`,`ref ${i+1}`);assert(x[9]<=x[8]&&x[8]<=x[10],`range ${x[1]}`);assert(Number(rc.assets[i])>0,`recreation ${x[1]}`)});
const sum=i=>a.reduce((n,x)=>n+Number(x[i]),0),count=i=>a.reduce((m,x)=>(m[x[i]]=(m[x[i]]||0)+1,m),{});
assert(sum(8)===11875000&&sum(9)===9475000&&sum(10)===14865000,'portfolio values');
assert(rc.portfolioRecreationCostEUR===47320000&&rc.assets.reduce((n,x)=>n+Number(x),0)===47320000,'recreation cost');
const sc=count(5),pc=count(6);assert(sc.V===37&&sc.P===26&&sc.R===5,'stage counts');assert(pc.VH===13&&pc.H===34&&pc.M===13&&pc.S===8,'potential counts');assert(d.fx[0]===1.1622&&d.fx[1]==='2026-09-04','FX');
const osdrp=a[67];assert(osdrp[1]==='TA-IP-068'&&osdrp[2]==='organismal-state-dynamics-research-platform'&&osdrp[5]==='P'&&osdrp[8]===120000&&osdrp[9]===95000&&osdrp[10]===150000&&rc.assets[67]===900000,'TA-IP-068');
for(const page of ['index.html','portfolio.html','opportunity.html','transaction.html','notice.html']){const h=read(page);assert(h.includes('Information Memorandum'),page);assert(h.includes('rel="canonical"'),`canonical ${page}`);assert(h.includes('im4.css?v=im5'),`IM5 cache ${page}`);assert(!/repository register|release 22|SHA-256|liquidity reference|validation runner|test modules/i.test(h),`internal language ${page}`)}
for(const x of a){const p=`projects/${x[2]}/index.html`;assert(exists(p),`missing ${x[2]}`);const h=read(p);assert(h.includes('../../assets/im-data.json')&&h.includes('../../assets/im.js?v=im5')&&h.includes('../../assets/im4.css?v=im5'),`profile ${x[2]}`)}
const aliases=['systemic-absolute-topology','lewis-hybrid-llm-orchestrator','sentinelbio-verify','agentic-engineering-control-plane','best-of-github-agentic-engineering','axiomcrypt','shield-breaker-research','titan-evtol-research-platform','chimera-spectral-perception-system','avedi','biospeak','sovereign-commerce-engine','unified-execution-engine'];
for(const x of aliases){const h=read(`projects/${x}/index.html`);assert(h.includes('noindex')&&h.includes('im4.css?v=im5'),`alias ${x}`)}
const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);assert(locs.length===73&&new Set(locs).size===73,'sitemap');for(const x of a)assert(locs.includes(`https://thearchitect-max.github.io/MyProjects/projects/${x[2]}/`),`sitemap ${x[2]}`);
new vm.Script(read('assets/im.js'),{filename:'assets/im.js'});if(exists('assets/im4.css')){const css=read('assets/im4.css');assert(css.includes('.memorandum-card>strong')&&css.includes('white-space:nowrap')&&css.includes('min-width:0')&&css.includes('@media(max-width:640px)'),'responsive finance CSS')}
const allowedAssets=new Set(['im.css','im4.css','im.js','im-data.json','recreation-costs.json']);for(const f of fs.readdirSync(path.join(root,'assets')))assert(allowedAssets.has(f),`unexpected public asset ${f}`);
assert(!exists('evidence'),'evidence directory must not be in public tree');assert(!exists('.github/workflows'),'GitHub Actions workflows prohibited');
console.log(JSON.stringify({informationMemorandum:true,presentationRelease:'IM5',assets:68,askingReferenceEUR:11875000,rangeEUR:[9475000,14865000],recreationCostEUR:47320000,stageCounts:{developedSoftware:37,developedPrototype:26,researchStage:5},sitemapUrls:73,taIp068:'Organismal State Dynamics Research Platform',responsiveFinanceTypography:true,mobileNavigation:true,publicAssetFiles:[...allowedAssets]},null,2));
