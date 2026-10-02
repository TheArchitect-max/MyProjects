(()=>{'use strict';
const SCRIPT=document.currentScript;
const ROOT=new URL('../',SCRIPT.src).href;
const AS=new URL('assets/',ROOT).href;
const VERSION='sites2';
const ESC=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
const fetchText=async n=>{const r=await fetch(`${AS}${n}?v=${VERSION}`,{cache:'no-store'});if(!r.ok)throw Error(`${n} unavailable`);return r.text()};
function siteSlugFromHref(href){
  try{
    const p=new URL(href,location.href).pathname;
    const m=p.match(/\/projects\/([^/]+)\/?/);
    return m?decodeURIComponent(m[1]):'';
  }catch{return''}
}
function currentSlug(){
  const base=new URL(ROOT).pathname.replace(/\/$/,'');
  const p=location.pathname.startsWith(base)?location.pathname.slice(base.length):location.pathname;
  const m=p.match(/\/?projects\/([^/]+)\/?/);
  return m?decodeURIComponent(m[1]):'';
}
function extLink(site,label='Official project site ↗',klass='text-link'){
  return `<a class="${klass}" data-public-site-link="1" target="_blank" rel="noopener external" href="${ESC(site.url)}">${ESC(label)}</a>`;
}
async function load(){
  const [sitesText,attText]=await Promise.all([fetchText('public-sites.json'),fetchText('public-attestation.json')]);
  const directory=JSON.parse(sitesText),att=JSON.parse(attText);
  const expected=att.files&&att.files['public-sites.json']&&att.files['public-sites.json'].sha256;
  const actual=await sha256(sitesText);
  const integrity=Boolean(expected&&actual===expected);
  const map=new Map((directory.sites||[]).filter(s=>s.status==='live').map(s=>[s.slug,s]));
  return{directory,map,integrity,expected,actual};
}
function decorateProject(ctx){
  const slug=currentSlug(),site=ctx.map.get(slug);
  if(!site)return;
  const hero=document.querySelector('.asset-hero .actions');
  if(hero&&!hero.querySelector('[data-public-site-link]'))hero.insertAdjacentHTML('beforeend',extLink(site,'Official project site ↗','btn ghost'));
  const dl=document.querySelector('.profile-panel dl');
  if(dl&&!dl.querySelector('[data-public-site-profile]')){
    dl.insertAdjacentHTML('beforeend',`<div data-public-site-profile="1"><dt>Public project site</dt><dd>${extLink(site,'Open verified GitHub Pages ↗')}</dd></div>`);
  }
}
function decorateCollection(ctx){
  document.querySelectorAll('.collection-row').forEach(row=>{
    if(row.querySelector('[data-public-site-link]'))return;
    const project=row.querySelector('.row-main h2 a');
    if(!project)return;
    const site=ctx.map.get(siteSlugFromHref(project.href));
    if(!site)return;
    const target=row.querySelector('.row-main');
    target&&target.insertAdjacentHTML('beforeend',extLink(site,'Official project site ↗'));
  });
}
function decorateCards(ctx){
  document.querySelectorAll('.asset-card').forEach(card=>{
    if(card.querySelector('[data-public-site-link]'))return;
    const project=card.querySelector('h3 a');
    if(!project)return;
    const site=ctx.map.get(siteSlugFromHref(project.href));
    if(site)card.insertAdjacentHTML('beforeend',extLink(site,'Official project site ↗'));
  });
}
function decorateHome(ctx){
  if(!document.querySelector('.hero-tenebrist')||document.querySelector('[data-public-sites-home]'))return;
  const main=document.querySelector('main');
  if(!main)return;
  const cards=(ctx.directory.sites||[]).map(s=>`<article class="proof-card"><span>LIVE · GITHUB PAGES</span><h3>${ESC(s.title)}</h3><p>${ESC(s.ref)} · Public project presentation linked to the existing portfolio asset; not a separate economic asset.</p>${extLink(s,'Open official project site ↗')}</article>`).join('');
  main.insertAdjacentHTML('beforeend',`<section class="section ink-section" data-public-sites-home="1"><div class="shell"><div class="section-head"><div><p class="eyebrow">Verified public project sites</p><h2>Live presentation surfaces, linked to the right assets.</h2></div><p>${ctx.directory.siteCount} project sites have a confirmed GitHub Pages deployment and a matching public project identity. Private source remains outside these sites.</p></div><div class="proof-grid">${cards}</div></div></section>`);
}
function decorateProof(ctx){
  if(!document.querySelector('.proof-status')||document.querySelector('[data-public-sites-proof]'))return;
  const main=document.querySelector('main');
  if(!main)return;
  const cards=(ctx.directory.sites||[]).map(s=>`<article class="proof-card"><span>${ESC(s.ref)}</span><h3>${ESC(s.title)}</h3><p>${ESC(s.provider)} · deployment confirmed · linked public presentation.</p>${extLink(s,'Open live site ↗')}</article>`).join('');
  main.insertAdjacentHTML('beforeend',`<section class="section" data-public-sites-proof="1"><div class="shell"><div class="section-head"><div><p class="eyebrow">Public site directory</p><h2>${ctx.integrity?'Directory integrity verified.':'Directory integrity requires attention.'}</h2></div><p>SHA-256 ${ctx.integrity?'matches the published attestation':'does not match the published attestation'}. These URLs are presentation surfaces for existing assets, not additional portfolio assets or source-code disclosures.</p></div><div class="proof-grid">${cards}</div></div></section>`);
}
function decorate(ctx){
  decorateProject(ctx);
  decorateCollection(ctx);
  decorateCards(ctx);
  decorateHome(ctx);
  decorateProof(ctx);
}
load().then(ctx=>{
  let scheduled=false;
  const run=()=>{scheduled=false;decorate(ctx)};
  const schedule=()=>{if(!scheduled){scheduled=true;queueMicrotask(run)}};
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
}).catch(err=>console.warn('Public project-site directory unavailable:',err));
})();