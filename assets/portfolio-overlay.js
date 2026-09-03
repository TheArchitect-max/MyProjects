(()=>{'use strict';
const script=document.currentScript;
const PATCH_URL=new URL('portfolio-refresh.json',script?.src||location.href).toString();
const nativeFetch=window.fetch.bind(window);
const CURRENT_ADDITIONS=new Set(['evidence-grounded-multi-expert-reasoning-system','goldennet-signal-intelligence-platform','autonomous-documentary-engine']);
const IDENTITY_UPDATES=new Set(['modular-key-cryptanalysis-platform','protein-structure-evidence-qualification-platform','electric-flight-systems-simulation-validation-platform','agentic-engineering-control-plane','vision-evidence-governed-multimodal-perception-framework']);
let refreshCache=null;
async function getRefresh(){if(refreshCache)return refreshCache;const r=await nativeFetch(PATCH_URL,{cache:'no-store'});if(!r.ok)throw new Error('Portfolio refresh unavailable');refreshCache=await r.json();return refreshCache}
function merge(base,patch){
 if(!base||base.v!==patch.base_version||!Array.isArray(base.a))return base;
 const out=JSON.parse(JSON.stringify(base));
 for(const change of patch.replacements||[]){const row=out.a.find(x=>x[0]===change.id);if(!row)continue;row[2]=change.slug;row[3]=change.name;row[6]=change.summary}
 const existing=new Set(out.a.map(row=>row[1]));
 for(const row of patch.additions||[]){if(!existing.has(row[1]))out.a.push(row)}
 out.n=patch.canonical_assets;
 out.t=[...patch.totals];
 out.sc={...patch.status_counts};
 out.pc={...patch.potential_counts};
 out.re={...out.re,method:'full repository audit plus release-17 canonical asset reconciliation',scope:`${out.re?.scope||'current implementation and evidence'}; ${patch.canonical_assets} canonical assets reconciled against ${patch.private_repositories_observed} observed private repositories with ${patch.legacy_private_repositories_retained} retained legacy migration repository`};
 return out
}
window.fetch=async(input,init)=>{
 const url=typeof input==='string'?input:(input&&input.url)||'';
 const response=await nativeFetch(input,init);
 if(!/assets\/projects\.json(?:\?|$)|\/projects\.json(?:\?|$)/.test(url)||/portfolio-refresh\.json/.test(url))return response;
 try{const [base,patch]=await Promise.all([response.clone().json(),getRefresh()]);const merged=merge(base,patch);return new Response(JSON.stringify(merged),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}catch(error){console.error(error);return response}
};
function slugFromCard(card){const href=card?.getAttribute('href')||'';const m=href.match(/projects\/([^/]+)\/?/);return m?m[1]:''}
function addChip(card,label,className){const box=card.querySelector('.chips');if(!box||box.querySelector(`[data-refresh-chip="${className}"]`))return;const chip=document.createElement('span');chip.className=`chip ${className}`;chip.dataset.refreshChip=className;chip.textContent=label;box.prepend(chip)}
function decorateCards(){
 document.querySelectorAll('#project-grid a.card').forEach(card=>{const slug=slugFromCard(card);if(CURRENT_ADDITIONS.has(slug))addChip(card,'New · Current update','release-chip');if(IDENTITY_UPDATES.has(slug))addChip(card,'Identity updated','priority-chip')});
 const legacyFilter=[...document.querySelectorAll('#filters button')].find(b=>b.textContent.trim()==='New in this release');if(legacyFilter)legacyFilter.textContent='Release 16 additions';
}
const TEXT_SWAPS=[
 [/54 \/ 54/g,'57 / 57'],[/54 private core repositories verified/g,'57 canonical private repositories verified'],[/54 proprietary first-party boundaries reviewed/g,'57 canonical proprietary first-party boundaries reviewed'],[/54 private software\/IP assets/g,'57 private software/IP assets'],[/54 private software and IP assets/g,'57 private software and IP assets'],[/54 assets/g,'57 assets'],[/€20\.78M/g,'€21.66M'],[/€20\.780\.000/g,'€21.660.000'],[/\$24\.06M/g,'$25.08M'],[/\$24,059,084/g,'$25,077,948'],[/€36\.92M/g,'€38.77M'],[/€36\.920\.000/g,'€38.770.000'],[/\$42\.75M/g,'$44.89M'],[/\$42,745,976/g,'$44,887,906'],[/32 \/ 19 \/ 3/g,'33 / 21 / 3'],[/56\.3%/g,'55.9%']
];
function swapText(root=document.body){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){let value=node.nodeValue;for(const [from,to] of TEXT_SWAPS)value=value.replace(from,to);if(value!==node.nodeValue)node.nodeValue=value}}
function injectUpdateSection(){
 if(!document.querySelector('#portfolio')||document.getElementById('release-17-update'))return;
 const target=document.querySelector('#portfolio');const section=document.createElement('section');section.id='release-17-update';section.className='economics';section.innerHTML=`<div class="shell section"><div class="section-head"><div><p class="eyebrow">Portfolio update · 03 Sep 2026</p><h2 class="section-title">Current identities.<br>New assets added.</h2></div><p>The live register now reconciles 57 canonical private software/IP assets against 58 observed private repositories. One former perception repository is intentionally retained as legacy migration evidence and is not counted as a separate canonical asset.</p></div><div class="metrics"><article class="metric"><small>Canonical assets</small><strong>57</strong><p>current public portfolio identities</p></article><article class="metric"><small>New assets</small><strong>3</strong><p>EGMERS, GoldenNet and Autonomous Documentary Engine</p></article><article class="metric"><small>Identity updates</small><strong>5</strong><p>current professional product identities reconciled</p></article><article class="metric"><small>Private repositories observed</small><strong>58</strong><p>57 canonical + 1 retained legacy migration repository</p></article></div></div>`;target.insertAdjacentElement('beforebegin',section)
}
function updateMeta(){
 const meta=document.querySelector('meta[name=description]');if(meta&&meta.content.includes('54'))meta.content=meta.content.replace(/54/g,'57');
 const og=document.querySelector('meta[property="og:description"]');if(og&&og.content.includes('54'))og.content=og.content.replace(/54/g,'57');
 const footer=[...document.querySelectorAll('.footer-inner div')].find(x=>x.textContent.includes('Release 20260903-16'));if(footer)footer.textContent=footer.textContent.replace('Release 20260903-16','Release 20260903-17');
}
function enhance(){decorateCards();swapText();injectUpdateSection();updateMeta()}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;enhance()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
