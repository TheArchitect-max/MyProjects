(()=>{'use strict';
const SCRIPT=document.currentScript;
const ROOT=new URL('../',SCRIPT.src).href;
const AS=new URL('assets/',ROOT).href;
const VERSION='sites14-20261016';
const ESC=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
const fetchText=async n=>{const r=await fetch(`${AS}${n}?v=${VERSION}`,{cache:'no-store'});if(!r.ok)throw Error(`${n} unavailable`);return r.text()};
function slugFromHref(href){
  try{return decodeURIComponent(new URL(href,location.href).pathname.match(/\/projects\/([^/]+)\/?/)?.[1]||'')}catch{return''}
}
function displayLink(site,label='Open project display ↗',klass='text-link'){
  const href=new URL(`displays/products/${site.displaySlug}/`,ROOT).href;
  return `<a class="${klass}" data-public-site-link="${ESC(site.ref)}" href="${ESC(href)}">${ESC(label)}</a>`;
}
async function load(){
  const [sitesText,attText,identitiesText]=await Promise.all([fetchText('public-sites.json'),fetchText('public-attestation.json'),fetchText('project-identities.json')]);
  const directory=JSON.parse(sitesText),att=JSON.parse(attText),identities=JSON.parse(identitiesText);
  const identityBySlug=new Map(identities.projects.map(p=>[p.slug,p]));
  if(directory.siteCount!==identityBySlug.size||directory.siteCount!==directory.sites.length||new Set(directory.sites.map(p=>p.slug)).size!==directory.siteCount||new Set(directory.sites.map(p=>p.displaySlug)).size!==directory.siteCount||directory.sites.some(p=>!identityBySlug.has(p.slug)||p.ref!==identityBySlug.get(p.slug).ref||p.title!==identityBySlug.get(p.slug).title||p.kind!=='digital-display'||p.status!=='live'||!/^[-a-z0-9]+$/.test(p.displaySlug)))throw Error('Project-display identity mismatch');
  const expected=att.files?.['public-sites.json']?.sha256;
  if(!expected||(await sha256(sitesText))!==expected||(await sha256(identitiesText))!==att.files['project-identities.json'].sha256)throw Error('Project-display directory integrity mismatch');
  return{directory,map:new Map(directory.sites.map(s=>[s.slug,s]))};
}
function decorateProject(ctx){
  const site=ctx.map.get(slugFromHref(location.href));if(!site)return;
  const hero=document.querySelector('.asset-hero .actions');
  if(hero&&!hero.querySelector('[data-public-site-link]'))hero.insertAdjacentHTML('beforeend',displayLink(site,'Open project display ↗','btn primary'));
  const dl=document.querySelector('.profile-panel dl');
  if(dl&&!dl.querySelector('[data-public-site-profile]'))dl.insertAdjacentHTML('beforeend',`<div data-public-site-profile="1"><dt>Project display</dt><dd>${displayLink(site)}</dd></div>`);
}
function decorateListings(ctx){
  for(const row of document.querySelectorAll('.collection-row,.asset-card')){
    if(row.querySelector('[data-public-site-link]'))continue;
    const project=row.querySelector('.row-main h2 a,h3 a');if(!project)continue;
    const site=ctx.map.get(slugFromHref(project.href));if(!site)continue;
    (row.querySelector('.row-main')||row).insertAdjacentHTML('beforeend',displayLink(site));
  }
  for(const row of document.querySelectorAll('[data-connection-member]')){
    if(row.querySelector('[data-public-site-link]'))continue;
    const cell=row.querySelector('td'),project=cell?.querySelector('a');if(!project)continue;
    const site=ctx.map.get(slugFromHref(project.href));
    if(site)cell.insertAdjacentHTML('beforeend',displayLink(site));
  }
}
function decorateHome(ctx){
  const hero=document.querySelector('.hero-tenebrist');if(!hero)return;
  const actions=hero.querySelector('.actions');
  if(actions&&!actions.querySelector('[data-display-collection]'))actions.insertAdjacentHTML('beforeend',`<a class="btn ghost" data-display-collection href="${ESC(ROOT)}displays/">Explore ${ctx.directory.siteCount} project displays ↗</a>`);
  if(document.querySelector('[data-public-sites-home]'))return;
  const featured=['universal-video-intelligence-platform','manuscript-integrity-publishing-platform','bio-inspired-neural-dynamics-active-inference-simulation-platform','evidence-grounded-multi-expert-reasoning-system','vision-evidence-governed-multimodal-perception-framework','causoryn'].map(s=>ctx.map.get(s)).filter(Boolean);
  const cards=featured.map(s=>`<article class="proof-card"><span>${ESC(s.ref)} · PROJECT DISPLAY</span><h3>${ESC(s.title)}</h3><p>Explore the product, documented functions, buyer fit, scope and factsheet.</p>${displayLink(s)}</article>`).join('');
  document.querySelector('main')?.insertAdjacentHTML('beforeend',`<section class="section ink-section" data-public-sites-home="1"><div class="shell"><div class="section-head"><div><p class="eyebrow">The project exhibition</p><h2>One portfolio. ${ctx.directory.siteCount} individual displays.</h2></div><p>Each page belongs to one independently scoped software asset. Open its product display, review its factsheet and return to this hub.</p></div><div class="proof-grid">${cards}</div><div class="actions"><a class="btn primary" href="${ESC(ROOT)}displays/">Browse all ${ctx.directory.siteCount} displays ↗</a><a class="btn" href="${ESC(ROOT)}portfolio.html">Compare full project profiles</a></div></div></section>`);
}
function decorateProof(ctx){
  if(!document.querySelector('.proof-status')||document.querySelector('[data-public-sites-proof]'))return;
  const entries=ctx.directory.sites.map(s=>`<li><span>${ESC(s.ref)}</span>${displayLink(s,s.title)}</li>`).join('');
  document.querySelector('main')?.insertAdjacentHTML('beforeend',`<section class="section" data-public-sites-proof="1"><div class="shell"><div class="section-head"><div><p class="eyebrow">Project display directory</p><h2>${ctx.directory.siteCount} matched project displays.</h2></div><p>The directory and canonical project identities pass their publication integrity checks. Every display has the same project reference and title as its hub profile.</p></div><details class="display-directory"><summary>Review all ${ctx.directory.siteCount} project-to-display links</summary><ul>${entries}</ul></details></div></section>`);
}
function decorate(ctx){decorateProject(ctx);decorateListings(ctx);decorateHome(ctx);decorateProof(ctx)}
load().then(ctx=>{
  let scheduled=false;
  const run=()=>{scheduled=false;decorate(ctx)};
  const schedule=()=>{if(!scheduled){scheduled=true;queueMicrotask(run)}};
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
}).catch(err=>console.warn('Project display directory unavailable:',err));
})();
