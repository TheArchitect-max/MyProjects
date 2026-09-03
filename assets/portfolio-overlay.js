(()=>{'use strict';
const script=document.currentScript;
const PATCH_URL=new URL('portfolio-refresh.json',script?.src||location.href).toString();
const PRICING_URL=new URL('pricing-review.json',script?.src||location.href).toString();
const nativeFetch=window.fetch.bind(window);
const CURRENT_ADDITIONS=new Set(['evidence-grounded-multi-expert-reasoning-system','goldennet-signal-intelligence-platform','autonomous-documentary-engine']);
const IDENTITY_UPDATES=new Set(['modular-key-cryptanalysis-platform','protein-structure-evidence-qualification-platform','electric-flight-systems-simulation-validation-platform','agentic-engineering-control-plane','vision-evidence-governed-multimodal-perception-framework']);
let refreshCache=null,pricingCache=null,mergedPortfolioCache=null;
const EUR=value=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(value)||0);
async function getRefresh(){if(refreshCache)return refreshCache;const r=await nativeFetch(PATCH_URL,{cache:'no-store'});if(!r.ok)throw new Error('Portfolio refresh unavailable');refreshCache=await r.json();return refreshCache}
async function getPricing(){if(pricingCache)return pricingCache;const r=await nativeFetch(PRICING_URL,{cache:'no-store'});if(!r.ok)throw new Error('Pricing review unavailable');pricingCache=await r.json();return pricingCache}
function merge(base,patch,pricing){
 if(!base||base.v!==patch.base_version||!Array.isArray(base.a))return base;
 const out=JSON.parse(JSON.stringify(base));
 for(const change of patch.replacements||[]){const row=out.a.find(x=>x[0]===change.id);if(!row)continue;row[2]=change.slug;row[3]=change.name;row[6]=change.summary}
 const existing=new Set(out.a.map(row=>row[1]));
 for(const row of patch.additions||[]){if(!existing.has(row[1]))out.a.push(row)}
 if(pricing&&pricing.basis_release===patch.v&&Array.isArray(pricing.records))for(const record of pricing.records){const row=out.a.find(x=>x[0]===record[0]);if(row)row[7]=Number(record[1])}
 out.n=patch.canonical_assets;
 out.t=[Number(pricing?.portfolio?.strategic_asking_reference)||patch.totals[0],Number(pricing?.portfolio?.recreation_cost_reference)||patch.totals[1],patch.totals[2]];
 out.sc={...patch.status_counts};out.pc={...patch.potential_counts};out.pricing_review=pricing||null;
 out.re={...out.re,method:'full repository audit, canonical reconciliation and multi-source market-calibrated pricing review',scope:`${out.re?.scope||'current implementation and evidence'}; ${patch.canonical_assets} canonical assets reconciled against ${patch.private_repositories_observed} observed private repositories; strategic pricing calibrated separately from recreation cost and revenue-based operating-company valuation`};
 mergedPortfolioCache=out;return out
}
window.fetch=async(input,init)=>{
 const url=typeof input==='string'?input:(input&&input.url)||'';
 const response=await nativeFetch(input,init);
 if(!/assets\/projects\.json(?:\?|$)|\/projects\.json(?:\?|$)/.test(url)||/portfolio-refresh\.json|pricing-review\.json/.test(url))return response;
 try{const [base,patch,pricing]=await Promise.all([response.clone().json(),getRefresh(),getPricing()]);const merged=merge(base,patch,pricing);return new Response(JSON.stringify(merged),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}catch(error){console.error(error);return response}
};
function slugFromCard(card){const href=card?.getAttribute('href')||'';const m=href.match(/projects\/([^/]+)\/?/);return m?m[1]:''}
function addChip(card,label,className){const box=card.querySelector('.chips');if(!box||box.querySelector(`[data-refresh-chip="${className}"]`))return;const chip=document.createElement('span');chip.className=`chip ${className}`;chip.dataset.refreshChip=className;chip.textContent=label;box.prepend(chip)}
function priceRecordForSlug(slug){if(!mergedPortfolioCache||!pricingCache)return null;const row=mergedPortfolioCache.a.find(x=>x[2]===slug);if(!row)return null;return pricingCache.records.find(r=>r[0]===row[0])||null}
function decorateCards(){
 document.querySelectorAll('#project-grid a.card').forEach(card=>{const slug=slugFromCard(card);if(CURRENT_ADDITIONS.has(slug))addChip(card,'New · Current update','release-chip');if(IDENTITY_UPDATES.has(slug))addChip(card,'Identity updated','priority-chip');const rec=priceRecordForSlug(slug),box=card.querySelector('.card-commercial');if(rec&&box&&!box.querySelector('[data-pricing-band]')){const d=document.createElement('div');d.className='pricing-review-mini';d.dataset.pricingBand='1';d.innerHTML=`<span><b>Strategic band</b> ${EUR(rec[2])}–${EUR(rec[3])}</span><span><b>Liquidity reference</b> ${EUR(rec[4])}</span>`;box.querySelector('.card-foot')?.before(d)}});
 const legacyFilter=[...document.querySelectorAll('#filters button')].find(b=>b.textContent.trim()==='New in this release');if(legacyFilter)legacyFilter.textContent='Release 16 additions';
}
function decorateProject(){const root=document.getElementById('project');if(!root||root.querySelector('[data-pricing-review-panel]'))return;const slug=document.documentElement.dataset.asset||location.pathname.replace(/\/$/,'').split('/').pop(),rec=priceRecordForSlug(slug);if(!rec)return;const target=root.querySelector('.facts .shell')||root.querySelector('.facts');if(!target)return;const panel=document.createElement('div');panel.className='market-note pricing-review-panel';panel.dataset.pricingReviewPanel='1';panel.innerHTML=`<strong>Market-calibrated transfer pricing · 03 Sep 2026</strong><p>Strategic seller target: <b>${EUR(rec[1])}</b>. Defensible negotiation band: <b>${EUR(rec[2])}–${EUR(rec[3])}</b>. Liquidity/quick-sale reference: <b>${EUR(rec[4])}</b>. Recreation cost remains a separate technical reference and is not treated as fair-market transaction value.</p>`;target.appendChild(panel)}
const TEXT_SWAPS=[
 [/€21\.66M/g,'€10.31M'],[/€21\.660\.000/g,'€10.310.000'],[/\$25\.08M/g,'$11.94M'],[/\$25,077,948/g,'$11,936,918'],[/55\.9%/g,'26.6%'],
 [/€20\.78M/g,'€10.31M'],[/€20\.780\.000/g,'€10.310.000'],[/\$24\.06M/g,'$11.94M'],[/\$24,059,084/g,'$11,936,918'],
 [/54 \/ 54/g,'57 / 57'],[/54 private core repositories verified/g,'57 canonical private repositories verified'],[/54 proprietary first-party boundaries reviewed/g,'57 canonical proprietary first-party boundaries reviewed'],[/54 private software\/IP assets/g,'57 private software/IP assets'],[/54 private software and IP assets/g,'57 private software and IP assets'],[/54 assets/g,'57 assets'],[/32 \/ 19 \/ 3/g,'33 / 21 / 3']
];
function swapText(root=document.body){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){let value=node.nodeValue;for(const [from,to] of TEXT_SWAPS)value=value.replace(from,to);if(value!==node.nodeValue)node.nodeValue=value}}
function injectUpdateSection(){
 if(!document.querySelector('#portfolio')||document.getElementById('release-18-pricing'))return;
 const target=document.querySelector('#portfolio');const section=document.createElement('section');section.id='release-18-pricing';section.className='economics';section.innerHTML=`<div class="shell section"><div class="section-head"><div><p class="eyebrow">Multi-source price review · 03 Sep 2026</p><h2 class="section-title">Market value is not<br>replacement cost.</h2></div><p>The prior €21.66M seller reference is retained as historical pricing evidence. The live register now uses a stricter market-calibrated strategic transfer target because verified portfolio-level ARR, profit, customers and retention are not established.</p></div><div class="metrics"><article class="metric"><small>Strategic asking reference</small><strong>€10.31M</strong><span class="metric-usd">≈ $11.94M USD</span><p>57 market-calibrated seller targets</p></article><article class="metric"><small>Defensible portfolio band</small><strong>€8.23M–€12.90M</strong><p>negotiation range, not a certified appraisal</p></article><article class="metric"><small>Liquidity reference</small><strong>€4.07M</strong><p>portfolio quick-sale / execution-risk layer</p></article><article class="metric"><small>Recreation reference</small><strong>€38.77M</strong><p>technical replacement-cost layer retained separately</p></article></div><div class="actions"><a class="btn" href="commercialization.html">Open full valuation analysis</a></div></div>`;target.insertAdjacentElement('beforebegin',section)
}
function style(){if(document.getElementById('pricing-review-style'))return;const s=document.createElement('style');s.id='pricing-review-style';s.textContent='.pricing-review-mini{display:grid;gap:5px;border-top:1px solid var(--line);padding-top:12px;margin-top:12px;font-size:.62rem;color:var(--muted)}.pricing-review-mini span{display:flex;justify-content:space-between;gap:12px}.pricing-review-mini b{color:#d8c39e;font-weight:500}.pricing-review-panel{margin-top:20px}.pricing-review-panel b{color:#d8c39e}';document.head.appendChild(s)}
function updateMeta(){
 const meta=document.querySelector('meta[name=description]');if(meta&&meta.content.includes('54'))meta.content=meta.content.replace(/54/g,'57');
 const og=document.querySelector('meta[property="og:description"]');if(og&&og.content.includes('54'))og.content=og.content.replace(/54/g,'57');
 document.documentElement.dataset.release='20260903-18';
 document.querySelectorAll('link[rel=stylesheet],script[src]').forEach(el=>{const attr=el.tagName==='LINK'?'href':'src',value=el.getAttribute(attr);if(value&&value.includes('20260903-17'))el.setAttribute(attr,value.replace('20260903-17','20260903-18'))});
 document.querySelectorAll('.footer-inner div').forEach(x=>{if(x.textContent.includes('Release 20260903-17'))x.textContent=x.textContent.replace('Release 20260903-17','Release 20260903-18')});
}
function enhance(){style();decorateCards();decorateProject();swapText();injectUpdateSection();updateMeta()}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;enhance()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
Promise.all([getRefresh(),getPricing()]).then(()=>schedule()).catch(console.error);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
