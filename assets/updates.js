(()=>{'use strict';
const VERSION='im25-sync1';
const SAFE=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const OVERRIDES={
'omnisynth-intelligence-engine':{name:'SourceVector Intelligence Platform',state:'SourceVector v5.2 establishes the canonical product layer over the retained OmniSynth compatibility core, with persistent subject dossiers, claim-to-evidence qualification, source-diversity controls and offline internal validation. Buyer-specific deployment, source rights and external performance validation remain subject to diligence.',activity:'2026-09-12'},
'autonomous-adaptation-framework':{state:'AAF 0.11.0 remains a research prototype/reference implementation and adds fail-closed durable-store locking, single-writer leases and restart-safe promotion intent. The repository records 1,064,875 finite-model cases PASS for its declared abstractions, while current Rust/Cargo execution, cross-process lock testing, independent validation and production evidence remain pending.',activity:'2026-09-12'},
'veritas-evidence-intelligence':{state:'VEI v0.11.0 adds a verified proof catalog, bounded proof-query surfaces, explicit environment policy objects, provider-capability negotiation, offline optional-provider checks, compatibility fixtures and release provenance bound to exact source/distribution hashes. Evidence quality and operational suitability remain bounded by configured verification, lawful source access and deployment-specific review.',activity:'2026-09-12'},
'telluric-actualization-research-platform':{state:'Active research software is 0.7.0.dev0. The increment adds fail-closed geodynamo benchmark execution planning and a machine-readable claim registry; TAM 3.1.0 remains blocked and is not a release. Observational V2 data and benchmark execution remain absent, and the theory remains speculative and not empirically verified.',activity:'2026-09-12'}
};
async function init(){
  const [dres,sres,ires]=await Promise.all([fetch(`assets/im-data.json?v=${VERSION}`,{cache:'no-store'}),fetch(`assets/development-status.json?v=${VERSION}`,{cache:'no-store'}),fetch(`assets/intake-assets.json?v=${VERSION}`,{cache:'no-store'})]);
  if(!dres.ok||!sres.ok||!ires.ok)throw Error('Development review unavailable');
  const d=await dres.json(),status=await sres.json(),intake=await ires.json();
  const names=new Map(d.a.map(x=>[x[2],x[3]]));
  const rows=status.assets.map(x=>{const o=OVERRIDES[x.slug]||{};return{...x,name:o.name||names.get(x.slug)||x.slug,currentState:o.state||x.currentState,lastRepositoryActivity:o.activity||x.lastRepositoryActivity,postSnapshot:Boolean(OVERRIDES[x.slug])}}).sort((a,b)=>b.lastRepositoryActivity.localeCompare(a.lastRepositoryActivity)||Number(b.postSnapshot)-Number(a.postSnapshot)||a.name.localeCompare(b.name));
  const grid=document.getElementById('development-grid');
  grid.innerHTML=rows.map(x=>`<article class="panel"><p class="eyebrow">${SAFE(x.ref)} · ${SAFE(x.lastRepositoryActivity)}${x.postSnapshot?' · POST-SNAPSHOT SYNC':''}</p><h2>${SAFE(x.name)}</h2><p>${SAFE(x.currentState)}</p><p class="fine">${SAFE(x.postSnapshot?'Repository documentation and post-snapshot default-branch activity':x.reviewBasis)}</p><a class="text-link" href="projects/${SAFE(x.slug)}/">Review asset →</a></article>`).join('');
  const intakeGrid=document.getElementById('intake-grid');
  intakeGrid.innerHTML=(intake.assets||[]).map(x=>`<article class="panel"><p class="eyebrow">${SAFE(x.ref)} · Awaiting qualification</p><h3>${SAFE(x.name)}</h3><p>${SAFE(x.description||'')}</p><p>${SAFE(x.currentState||'')}</p><p class="fine">Reviewed ${SAFE(x.reviewedOn||'2026-09-12')} · Latest activity ${SAFE(x.lastRepositoryActivity||'')}</p><a class="text-link" href="projects/${SAFE(x.slug)}/">Review project →</a></article>`).join('');
  document.getElementById('review-count').textContent=`${rows.length} commercially referenced assets + ${(intake.assets||[]).length} intake projects`;
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>init().catch(e=>{console.error(e);document.getElementById('development-grid').innerHTML='<div class="panel">Development review is temporarily unavailable.</div>'}),{once:true}):init().catch(console.error);
})();
