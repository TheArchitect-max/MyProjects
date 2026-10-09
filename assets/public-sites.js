(()=>{'use strict';
const SCRIPT=document.currentScript;
const ROOT=new URL('../',SCRIPT.src).href;
const AS=new URL('assets/',ROOT).href;
const VERSION='sites5';
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
function extLink(site,label='Digital display ↗',klass='text-link'){
  return `<a class="${klass}" data-public-site-link="1" target="_blank" rel="noopener external" href="${ESC(site.url)}">${ESC(label)}</a>`;
}
async function load(){
  const [sitesText,attText,identitiesText]=await Promise.all([fetchText('public-sites.json'),fetchText('public-attestation.json'),fetchText('project-identities.json')]);
  const directory=JSON.parse(sitesText),att=JSON.parse(attText),identities=JSON.parse(identitiesText),identityBySlug=new Map(identities.projects.map(p=>[p.slug,p]));
  if(directory.siteCount!==directory.sites.length||new Set(directory.sites.map(p=>p.slug)).size!==directory.siteCount||directory.sites.some(p=>!identityBySlug.has(p.slug)||p.ref!==identityBySlug.get(p.slug).ref||p.title!==identityBySlug.get(p.slug).title||p.kind!=='digital-display'))throw Error('Digital-display identity mismatch');
  const expected=att.files&&att.files['public-sites.json']&&att.files['public-sites.json'].sha256;
  const actual=await sha256(sitesText);
  const integrity=Boolean(expected&&actual===expected&&(await sha256(identitiesText))===att.files['project-identities.json'].sha256);
  const map=new Map((directory.sites||[]).filter(s=>s.status==='live').map(s=>[s.slug,s]));
  return{directory,map,integrity,expected,actual};
}
function decorateProject(ctx){
  const slug=currentSlug(),site=ctx.map.get(slug);
  if(!site)return;
  const hero=document.querySelector('.asset-hero .actions');
  if(hero&&!hero.querySelector('[data-public-site-link]'))hero.insertAdjacentHTML('beforeend',extLink(site,'Digital display ↗','btn ghost'));
  const dl=document.querySelector('.profile-panel dl');
  if(dl&&!dl.querySelector('[data-public-site-profile]')){
    dl.insertAdjacentHTML('beforeend',`<div data-public-site-profile="1"><dt>Digital display</dt><dd>${extLink(site,'Open digital display ↗')}</dd></div>`);
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
    target&&target.insertAdjacentHTML('beforeend',extLink(site,'Digital display ↗'));
  });
}
function decorateCards(ctx){
  document.querySelectorAll('.asset-card').forEach(card=>{
    if(card.querySelector('[data-public-site-link]'))return;
    const project=card.querySelector('h3 a');
    if(!project)return;
    const site=ctx.map.get(siteSlugFromHref(project.href));
    if(site)card.insertAdjacentHTML('beforeend',extLink(site,'Digital display ↗'));
  });
}
function decorateHome(ctx){
  if(!document.querySelector('.hero-tenebrist')||document.querySelector('[data-public-sites-home]'))return;
  const main=document.querySelector('main');
  if(!main)return;
  const cards=(ctx.directory.sites||[]).map(s=>`<article class="proof-card"><span>DIGITAL DISPLAY</span><h3>${ESC(s.title)}</h3><p>${ESC(s.ref)} · Explore this software project through its public digital display.</p>${extLink(s,'Open digital display ↗')}</article>`).join('');
  main.insertAdjacentHTML('beforeend',`<section class="section ink-section" data-public-sites-home="1"><div class="shell"><div class="section-head"><div><p class="eyebrow">Project digital displays</p><h2>Explore a project before making your next decision.</h2></div><p>Open ${ctx.directory.siteCount} available digital displays, each linked to its software project. Website repositories are excluded from the IP-asset count.</p></div><div class="proof-grid">${cards}</div></div></section>`);
}
function decorateProof(ctx){
  if(!document.querySelector('.proof-status')||document.querySelector('[data-public-sites-proof]'))return;
  const main=document.querySelector('main');
  if(!main)return;
  const cards=(ctx.directory.sites||[]).map(s=>`<article class="proof-card"><span>${ESC(s.ref)}</span><h3>${ESC(s.title)}</h3><p>${ESC(s.provider)} · linked project display.</p>${extLink(s,'Open digital display ↗')}</article>`).join('');
  main.insertAdjacentHTML('beforeend',`<section class="section" data-public-sites-proof="1"><div class="shell"><div class="section-head"><div><p class="eyebrow">Digital display directory</p><h2>${ctx.integrity?'Directory integrity verified.':'Directory integrity requires attention.'}</h2></div><p>Check the directory against the dated public record. Each display uses the same TA-IP identifier and project title as its asset profile. Display websites are excluded from the IP-asset count.</p></div><div class="proof-grid">${cards}</div></div></section>`);
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