#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base='https://thearchitect-max.github.io/MyProjects/';
const links=[['','Overview'],['portfolio.html','Portfolio'],['opportunity.html','Opportunity'],['valuation.html','Valuation'],['evidence.html','Evidence'],['transaction.html','Transaction'],['notice.html','Notice']];
function header(prefix,current){return `<a class="skip" href="#main">Skip to content</a><header><div class="shell nav"><a class="brand" href="${prefix||'./'}" aria-label="THEARCHITECT_MAX portfolio home"><span class="mark">TA</span><span class="brand-copy"><strong>THEARCHITECT_MAX</strong><span>Technology & IP Portfolio</span></span></a><nav class="nav-links" aria-label="Primary navigation">${links.map(([url,label])=>`<a ${url===current?'aria-current="page" ':''}href="${prefix+url||'./'}">${label}</a>`).join('')}</nav></div></header>`}
function footer(prefix){return `<footer class="footer"><div class="shell footer-inner"><div><strong>THEARCHITECT_MAX</strong><p>Technology & IP Portfolio<br>79 individually scoped assets · September 2026</p><div class="footer-links"><a href="${prefix}portfolio.html">Portfolio</a><a href="${prefix}evidence.html">Evidence</a><a href="${prefix}transaction.html">Enquiries</a><a href="${prefix}notice.html">Important notice</a></div></div><div><p>Seller-side commercial references for professional discussion. Subject to asset-specific diligence and definitive agreement.</p><p>© 2026 THEARCHITECT_MAX. All rights reserved.</p></div></div></footer>`}
const elements=new Map();
function el(id,value=''){const e={innerHTML:'',textContent:'',value,dataset:{},addEventListener(){},querySelectorAll(){return[]}};elements.set(id,e);return e}
const context={console,Intl,URLSearchParams,document:{documentElement:{dataset:{}},getElementById:id=>elements.get(id)||null,querySelector:()=>null},location:{pathname:'/',search:''},fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0])),text:async()=>read(url.split('?')[0])})};
vm.createContext(context);
let source=read('assets/im.js').replace(/document.readyState==='loading'[\s\S]*?init\(\);\}\)\(\);\s*$/, 'globalThis.api={load,overview,featured,schedule,detail};})();');
vm.runInContext(source,context);
const data=await context.api.load();
let economic=read('assets/economic.js').replace(/document.readyState==='loading'[\s\S]*?init\(\);\}\)\(\);\s*$/, 'globalThis.economic={parse,economicPanel};})();');
vm.runInContext(economic,context);
const economicRows=context.economic.parse(read('assets/asset-economic-valuations.csv'));
const values=new Map(economicRows.map(r=>[r.slug,r]));
function shell(s,prefix,current){s=s.replace(/<a class="skip"[^>]*>.*?<\/a>/g,'').replace(/<header>[\s\S]*?<\/header>/,header(prefix,current)).replace(/<footer[^>]*>[\s\S]*?<\/footer>/,footer(prefix)).replace(/<main>/,'<main id="main">');return s.replace(/\?v=im\d+/g,'?v=im21')}
// Render the public discovery surfaces from the same functions used by the browser.
for(const id of ['family-grid','featured-assets','sector-grid','software-count','prototype-count','research-count'])el(id);
context.api.overview(data);context.api.featured(data);
let home=read('templates/index.html');
for(const [id,e] of elements)if(e.innerHTML)home=home.replace(`<div class="${id==='family-grid'?'family-grid':id==='featured-assets'?'featured-grid':'sector-grid'}" id="${id}"></div>`,match=>match.replace('</div>',e.innerHTML+'</div>'));
write('index.html',shell(home,'',''));
elements.clear();for(const [id,value]of[['portfolio-schedule',''],['search',''],['sort','potential-desc'],['sector','all'],['family','all'],['filters',''],['result-count','']])el(id,value);
context.api.schedule(data);
let portfolio=read('templates/portfolio.html').replace(/<div class="schedule" id="portfolio-schedule">[\s\S]*?<\/div><\/div>/,`<div class="schedule" id="portfolio-schedule">${elements.get('portfolio-schedule').innerHTML}</div>`);
portfolio=portfolio.replace('<div class="filters" id="filters" aria-label="Development stage filters"></div>',`<div class="filters" id="filters" aria-label="Development stage filters">${elements.get('filters').innerHTML}</div>`);
for(const id of ['family','sector'])portfolio=portfolio.replace(new RegExp(`<select id="${id}">[\\s\\S]*?</select>`),`<select id="${id}">${elements.get(id).innerHTML}</select>`);
portfolio=portfolio.replace('<div class="tools tools-four">','<noscript><div class="notice">All 79 assets are listed below. Enable JavaScript to use search, sorting and filters.</div></noscript><div class="tools tools-four">');
write('portfolio.html',shell(portfolio,'','portfolio.html'));
for(const a of data.assets){elements.clear();const target=el('project');context.location.pathname=`/MyProjects/projects/${a.slug}/`;context.api.detail(data);let body=target.innerHTML;body=body.replace(/<header>[\s\S]*?<\/header>/,'').replace(/<footer[\s\S]*?<\/footer>/,'');body=body.replace('<div class="actions">',`<div id="asset-economic-model">${context.economic.economicPanel(values.get(a.slug))}</div><div class="actions">`);
const title=escape(`${a.name} — Standalone IP Asset`),desc=escape(a.description);const html=`<!doctype html><html lang="en" data-data-path="../../assets/im-data.json"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102c42"><title>${title}</title><meta name="description" content="${desc}"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><link rel="canonical" href="${base}projects/${a.slug}/"><link rel="stylesheet" href="../../assets/im4.css?v=im21"></head><body>${header('../../','portfolio.html')}<main id="main"><div id="project" data-rendered="true">${body}</div></main>${footer('../../')}<script src="../../assets/im.js?v=im21" defer></script><script src="../../assets/economic.js?v=im21" defer></script></body></html>`;write(`projects/${a.slug}/index.html`,html)}
for(const p of ['opportunity.html','valuation.html','evidence.html','transaction.html','notice.html'])write(p,shell(read(p),'',p).replace(/IM(?:18|19|20) (?:valuation context|evidence calibration)/g,'Current valuation context').replace('Five-lens economic model','Asset-level economic model').replace('Five lenses','Four valuation lenses and a separate asking price'));
console.log(`Built overview, searchable portfolio and ${data.assets.length} static profiles; unified seven-page navigation.`);
