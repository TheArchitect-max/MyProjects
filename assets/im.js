(()=>{'use strict';
const SCRIPT=document.currentScript;
const ROOT=new URL('../',SCRIPT.src).href;
const AS=new URL('assets/',ROOT).href;
const VERSION='im39';
const EXPECTED_ASSETS=89;
const FX=1.12448, FXDATE='2026-10-07';
const STAGES={V:'Developed software',P:'Developed prototype',R:'Research-stage'};
const POT={VH:'Very high',H:'High',M:'Moderate',S:'Specialist'};
const PS={VH:4,H:3,M:2,S:1};
const ART={
caravaggio:{src:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Caravaggio_%E2%80%94_The_Calling_of_Saint_Matthew.jpg/1280px-Caravaggio_%E2%80%94_The_Calling_of_Saint_Matthew.jpg',page:'https://commons.wikimedia.org/wiki/File:Caravaggio_%E2%80%94_The_Calling_of_Saint_Matthew.jpg',credit:'Caravaggio, The Calling of Saint Matthew — CC0 photographic file / public-domain artwork'},
rembrandt:{src:'https://upload.wikimedia.org/wikipedia/commons/d/d6/Rembrandt_-_The_Philosopher_in_Meditation.jpg',page:'https://commons.wikimedia.org/wiki/File:Rembrandt_-_The_Philosopher_in_Meditation.jpg',credit:'Rembrandt, Philosopher in Meditation — public-domain artwork / PD-Art reproduction'}
};
const BUYERS={
'evidence-intelligence':'enterprise intelligence, research, assurance and decision-support teams',
'adaptive-intelligence':'AI product, applied research and advanced software teams',
'visual-multimodal':'computer-vision, spatial-computing and mobile-product teams',
'audio-media':'media technology, creator-platform and production-software companies',
'industrial-digital-twins':'industrial software, reliability, operations and digital-twin teams',
'software-assurance-control':'platform engineering, software assurance, infrastructure and enterprise-control teams',
'security-traceability':'security, identity, assurance and regulated-workflow technology teams',
'aerospace-mobility':'mobility, automotive, aerospace and engineering-software teams',
'scientific-observation':'research organisations, scientific-software companies and domain R&D teams',
'physics-math-optimization':'advanced engineering, optimisation and scientific-computing teams',
'enterprise-web-commerce':'enterprise software, SaaS, publishing, search and commerce-platform teams',
'specialist-verticals':'specialist software acquirers and vertical-technology operators'
};
const ESC=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const EUR=v=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(v)||0);
const USD=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format((Number(v)||0)*FX);
const EURM=v=>`€${((Number(v)||0)/1e6).toLocaleString('en-US',{minimumFractionDigits:3,maximumFractionDigits:3})}M`;
const USDM=v=>`$${(((Number(v)||0)*FX)/1e6).toLocaleString('en-US',{minimumFractionDigits:3,maximumFractionDigits:3})}M`;
const PCT=v=>`${(Number(v)*100).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
const FXNOTE=()=>`Indicative USD conversion at 1 EUR = ${FX.toFixed(5)} USD (${FXDATE}). EUR amounts are authoritative.`;
const fetchText=async n=>{const r=await fetch(`${AS}${n}?v=${VERSION}`,{cache:'no-store'});if(!r.ok)throw Error(`${n} unavailable`);return r.text()};
const fetchJSON=async n=>JSON.parse(await fetchText(n));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
function econ(a,m,u){
  if(u&&u.marketComparableProxyEUR!=null)return u;
  const f=m.factors,rep=a.replacementCost,stage=a.stage,p=a.potential,sc=f.sectorContext[a.sector]||1,rm=f.routeMonetization[a.route]||1;
  const tech=f.technicalCompletionProbability[stage],comm=f.commercializationProbability[p],risk=f.timeRisk[stage],rights=f.rightsTransferDiligenceReserve;
  const market=Math.round(rep*f.marketPotential[p]*f.marketMaturity[stage]*sc);
  const income=Math.round(rep*f.incomePotential[p]*f.incomeMaturity[stage]*rm);
  const strategic=Math.round(rep*f.strategicOpportunityMultiplier[p]*tech*comm*rights*risk*sc);
  const tri=Math.round(rep*f.triangulationWeights.replacementCost+market*f.triangulationWeights.marketComparableProxy+income*f.triangulationWeights.incomeLicensingProxy+strategic*f.triangulationWeights.probabilityAdjustedStrategicValue);
  return{ref:a.ref,slug:a.slug,stage,potential:p,sellerAskEUR:a.ask,negotiationLowEUR:a.low,negotiationHighEUR:a.high,replacementCostEUR:rep,marketComparableProxyEUR:market,incomeLicensingProxyEUR:income,technicalCompletionProbability:tech,commercializationProbability:comm,rightsTransferReserve:rights,timeRiskFactor:risk,probabilityAdjustedStrategicValueEUR:strategic,triangulatedEconomicReferenceEUR:tri,askShareOfTriangulated:a.ask/tri};
}
function reconcile(assets,p){
  const s=assets.reduce((o,a)=>{
    o.ask+=a.ask;o.low+=a.low;o.high+=a.high;o.rep+=a.replacementCost;
    o.market+=a.econ.marketComparableProxyEUR;o.income+=a.econ.incomeLicensingProxyEUR;
    o.strategic+=a.econ.probabilityAdjustedStrategicValueEUR;o.tri+=a.econ.triangulatedEconomicReferenceEUR;
    return o;
  },{ask:0,low:0,high:0,rep:0,market:0,income:0,strategic:0,tri:0});
  const checks={
    assetCount:assets.length===p.assetCount,
    ask:s.ask===p.sellerAskEUR,low:s.low===p.negotiationLowEUR,high:s.high===p.negotiationHighEUR,
    rep:s.rep===p.replacementCostEUR,market:s.market===p.marketComparableProxyEUR,
    income:s.income===p.incomeLicensingProxyEUR,strategic:s.strategic===p.probabilityAdjustedStrategicValueEUR,
    tri:s.tri===p.triangulatedEconomicReferenceEUR
  };
  return{totals:s,checks,ok:Object.values(checks).every(Boolean)};
}
async function load(){
  const[d,rc,desc,structure,supp,valText,methodText,att,development]=await Promise.all([
    fetchJSON('im-data.json'),fetchJSON('recreation-costs.json'),fetchJSON('descriptions.json'),fetchJSON('portfolio-structure.json'),
    fetchJSON('supplemental-assets.json'),fetchText('valuation-register.json'),fetchText('economic-methodology.json'),fetchJSON('public-attestation.json'),
    fetchJSON('development-projects.json')
  ]);
  const values=JSON.parse(valText),method=JSON.parse(methodText);
  const famBySlug={};structure.families.forEach(f=>(f.assets||[]).forEach(s=>famBySlug[s]=f));
  const updates=new Map((values.updates||[]).map(x=>[x.ref,x]));
  const primary=d.a.map((x,i)=>({id:x[0],ref:x[1],slug:x[2],name:x[3],sector:d.s[x[4]],stage:x[5],potential:x[6],route:d.r[x[7]],ask:x[8],low:x[9],high:x[10],replacementCost:rc.assets[i],description:desc.descriptions[x[2]]||''}));
  const extra=supp.assets.map(x=>({id:x.id,ref:x.ref,slug:x.slug,name:x.name,sector:x.sector,stage:x.stage,potential:x.potential,route:x.route,ask:Number(x.ask),low:Number(x.low),high:Number(x.high),replacementCost:Number(x.recreationCost),description:x.description||''}));
  const assets=[...primary,...extra].map(a=>{
    const u=updates.get(a.ref);
    if(u)a={...a,name:u.name||a.name,stage:u.stage||a.stage,potential:u.potential||a.potential,ask:u.sellerAskEUR??a.ask,low:u.negotiationLowEUR??a.low,high:u.negotiationHighEUR??a.high,replacementCost:u.replacementCostEUR??a.replacementCost,description:u.description||a.description};
    const family=famBySlug[a.slug];if(!family)throw Error(`Missing family for ${a.slug}`);
    return{...a,family,econ:econ(a,method,u)};
  });
  if(assets.length!==EXPECTED_ASSETS||new Set(assets.map(x=>x.ref)).size!==EXPECTED_ASSETS)throw Error('Portfolio register mismatch');
  const integrity={
    valuation:(await sha256(valText))===att.files['valuation-register.json'].sha256,
    methodology:(await sha256(methodText))===att.files['economic-methodology.json'].sha256
  };
  integrity.ok=integrity.valuation&&integrity.methodology;
  const rec=reconcile(assets,values.portfolio);
  const projects=[
    ...assets.map(a=>({...a,kind:'asset',commercialReference:true,stageLabel:STAGES[a.stage],familyName:a.family.name})),
    ...(development.projects||[]).map(p=>({...p,kind:'development',commercialReference:false}))
  ];
  if(projects.length!==95||new Set(projects.map(x=>x.slug)).size!==95)throw Error('Development project register mismatch');
  return{d,structure,values,method,assets,projects,development,att,integrity,reconciliation:rec};
}
function path(){const base=new URL(ROOT).pathname.replace(/\/$/,'');return location.pathname.startsWith(base)?location.pathname.slice(base.length).replace(/^\/+|\/+$/g,''):''}
function nav(active){
  const items=[['','Overview'],['portfolio.html','Collection'],['development.html','Development'],['proof.html','Proof'],['valuation.html','Valuation'],['evidence.html','Diligence'],['transaction.html','Transaction']];
  return`<header class="site-head"><div class="shell nav"><a class="brand" href="${ROOT}"><span class="monogram">TA</span><span class="brand-copy"><strong>THEARCHITECT_MAX</strong><span>Private Technology · Public Catalogue</span></span></a><nav class="nav-links" aria-label="Primary navigation">${items.map(([u,l])=>`<a${active===u?' aria-current="page"':''} href="${ROOT}${u}">${l}</a>`).join('')}</nav></div></header>`;
}
function footer(n){
  return`<footer class="footer"><div class="shell footer-grid"><div><span class="kicker">THEARCHITECT_MAX</span><h2>Private IP, disclosed with restraint.</h2><p>${n} individually priced assets. Public screening data only; source code and controlled diligence material remain private.</p></div><div class="footer-links"><a href="${ROOT}portfolio.html">Collection</a><a href="${ROOT}development.html">Development</a><a href="${ROOT}proof.html">Proof of existence</a><a href="${ROOT}valuation.html">Valuation</a><a href="${ROOT}evidence.html">Diligence perimeter</a><a href="${ROOT}transaction.html">Commercial enquiry</a><a href="${ROOT}notice.html">Notice</a></div></div><div class="shell art-credit"><span>Visual references:</span> <a target="_blank" rel="noopener" href="${ART.caravaggio.page}">${ESC(ART.caravaggio.credit)}</a> · <a target="_blank" rel="noopener" href="${ART.rembrandt.page}">${ESC(ART.rembrandt.credit)}</a><br>© 2026 THEARCHITECT_MAX. Portfolio text, design and first-party commercial material. All rights reserved.</div></footer>`;
}
function wrap(main,active='',n=EXPECTED_ASSETS){return`<a class="skip" href="#main">Skip to content</a>${nav(active)}<main id="main">${main}</main>${footer(n)}`}
function title(t,desc){document.title=`${t} — THEARCHITECT_MAX`;const m=document.querySelector('meta[name="description"]');if(m)m.content=desc||'Proprietary technology and IP assets available for acquisition, licensing or strategic integration.'}
function verificationMark(d,compact=false){
  const ok=d.integrity.ok&&d.reconciliation.ok;
  return`<span class="verify-mark ${ok?'ok':'warn'}${compact?' compact':''}"><span class="dot"></span>${ok?'Public register reconciled':'Verification attention required'}</span>`;
}
function home(d){
  const p=d.values.portfolio,n=p.assetCount,st=p.stageCounts;
  const selected=[...d.assets].sort((a,b)=>b.ask-a.ask).slice(0,6);
  return wrap(`
  <section class="hero-tenebrist"><div class="shell hero-grid">
    <div class="hero-copy"><p class="eyebrow">Independent proprietary technology portfolio</p><h1>Private technology.<br><em>Public proof.</em></h1><p class="lede">A controlled commercial catalogue of ${n} individually priced proprietary assets, supported by a ${d.projects.length}-project development register. Public information establishes identity, evidenced maturity and commercial context without exposing source code or confidential implementation detail.</p><div class="actions"><a class="btn primary" href="${ROOT}portfolio.html">Enter the collection</a><a class="btn ghost" href="${ROOT}development.html">Development register</a><a class="btn ghost" href="${ROOT}proof.html">Verify the public record</a></div><div class="hero-proof">${verificationMark(d)}<span>Basis ${ESC(d.values.valuationBasisDate)}</span></div></div>
    <figure class="art-frame hero-art"><img src="${ART.caravaggio.src}" alt="The Calling of Saint Matthew by Caravaggio, used as a public-domain tenebrist visual reference" referrerpolicy="no-referrer"><figcaption>Light as evidence. ${ESC(ART.caravaggio.credit)}</figcaption></figure>
  </div></section>
  <section class="ledger-strip"><div class="shell ledger-grid"><div><span>Standalone assets</span><strong>${n}</strong></div><div><span>Aggregate acquisition ask</span><strong>${EURM(p.sellerAskEUR)}</strong><small>≈ ${USDM(p.sellerAskEUR)}</small></div><div><span>Engineering recreation cost</span><strong>${EURM(p.replacementCostEUR)}</strong><small>≈ ${USDM(p.replacementCostEUR)}</small></div><div><span>Ask / recreation cost</span><strong>${PCT(p.sellerAskAsShareOfReplacementCost)}</strong></div></div></section>
  <section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">Public proof layer</p><h2>Verify the record, not the marketing.</h2></div><p>The site checks file integrity and recomputes portfolio economics from the public inputs in your browser. This demonstrates internal consistency of the published record; it is not a substitute for legal, technical or financial diligence.</p></div><div class="proof-grid">
  <article class="proof-card"><span>01</span><h3>Existence</h3><p>A dated public catalogue records each TA-IP identity and its current commercial profile.</p><a href="${ROOT}proof.html">Inspect proof →</a></article>
  <article class="proof-card"><span>02</span><h3>Integrity</h3><p>SHA-256 fingerprints bind the current valuation register and methodology to the public attestation.</p><a href="${ROOT}proof.html">Verify files →</a></article>
  <article class="proof-card"><span>03</span><h3>Valuation</h3><p>Aggregate figures are recalculated asset-by-asset from the disclosed factors and compared with the published totals.</p><a href="${ROOT}valuation.html">Recompute value →</a></article>
  <article class="proof-card"><span>04</span><h3>Disclosure boundary</h3><p>Source code, private evidence, security-sensitive implementation details and transaction-confidential records stay outside the showroom.</p><a href="${ROOT}evidence.html">Review perimeter →</a></article>
  </div></div></section>
  <section class="section ink-section"><div class="shell"><div class="section-head"><div><p class="eyebrow">Selected holdings</p><h2>Material assets, individually transferable.</h2></div><p>Selection shown by current seller ask, not as an investment ranking. Every asset remains separately scoped and priced.</p></div><div class="showcase-grid">${selected.map(a=>assetCard(a)).join('')}</div><div class="actions"><a class="btn pale" href="${ROOT}portfolio.html">View all ${n} assets</a></div></div></section>
  <section class="section"><div class="shell art-dialogue"><figure class="art-frame"><img loading="lazy" src="${ART.rembrandt.src}" alt="Philosopher in Meditation by Rembrandt, used as a public-domain chiaroscuro visual reference" referrerpolicy="no-referrer"><figcaption>${ESC(ART.rembrandt.credit)}</figcaption></figure><div><p class="eyebrow">Evidence before assertion</p><h2>What is developed is stated. What remains unproven stays bounded.</h2><p>Research-stage and scientific claims are separated from software maturity. Transfer readiness, production suitability, regulatory status, third-party rights and buyer-specific deployment remain diligence questions unless explicitly evidenced.</p><div class="stage-key"><span><b>${st.developedSoftware}</b> developed software</span><span><b>${st.developedPrototype}</b> developed prototypes</span><span><b>${st.researchStage}</b> research-stage</span></div></div></div></section>
  <section class="section families"><div class="shell"><div class="section-head"><div><p class="eyebrow">Capability families</p><h2>Twelve bodies of work.</h2></div><p>Classification aids discovery; it does not merge separate IP assets or imply a bundle transaction.</p></div><div class="family-grid">${d.structure.families.map(f=>`<article><span class="family-no">${f.assets.length}</span><h3>${ESC(f.name)}</h3><p>${ESC(f.description)}</p><a href="${ROOT}portfolio.html?family=${encodeURIComponent(f.id)}">Browse family →</a></article>`).join('')}</div></div></section>`,
  '',n);
}
function assetCard(a){return`<article class="asset-card"><div class="card-top"><span>${a.ref}</span><span>${STAGES[a.stage]}</span></div><h3><a href="${ROOT}projects/${a.slug}/">${ESC(a.name)}</a></h3><p>${ESC(a.description)}</p><div class="asset-econ"><div><span>Ask</span><strong>${EUR(a.ask)}</strong></div><div><span>Recreation</span><strong>${EUR(a.replacementCost)}</strong></div></div><a class="arrow-link" href="${ROOT}projects/${a.slug}/">Commercial profile →</a></article>`}
function portfolio(d){
  const n=d.values.portfolio.assetCount;
  return wrap(`<section class="page-hero"><div class="shell"><p class="eyebrow">The collection</p><h1>${n} proprietary assets.<br><em>One controlled register.</em></h1><p class="lede">Search by identity, capability, sector or maturity. Each asset keeps its own acquisition reference and build-versus-buy basis.</p></div></section><section class="section"><div class="shell">
  <div class="tools tools-four"><label><span>Search</span><input id="search" type="search" placeholder="Asset, purpose, family or sector…"></label><label><span>Family</span><select id="family"><option value="all">All families</option>${d.structure.families.map(f=>`<option value="${ESC(f.id)}">${ESC(f.name)}</option>`).join('')}</select></label><label><span>Sector</span><select id="sector"><option value="all">All sectors</option>${[...new Set(d.assets.map(a=>a.sector))].sort().map(s=>`<option>${ESC(s)}</option>`).join('')}</select></label><label><span>Sort</span><select id="sort"><option value="potential">Potential</option><option value="name">Name A–Z</option><option value="ask-desc">Ask high–low</option><option value="ask-asc">Ask low–high</option><option value="rep-desc">Recreation high–low</option></select></label></div>
  <div class="filters" id="filters"><button class="active" data-stage="all">All</button><button data-stage="V">Developed software</button><button data-stage="P">Developed prototype</button><button data-stage="R">Research-stage</button></div><div class="collection-meta"><p id="result-count"></p>${verificationMark(d,true)}</div><div class="collection-list" id="portfolio-list"></div><p class="fine">${FXNOTE()}</p></div></section>`,'portfolio.html',n);
}
function bindPortfolio(d){
  const box=document.getElementById('portfolio-list'),q=document.getElementById('search'),fam=document.getElementById('family'),sec=document.getElementById('sector'),sort=document.getElementById('sort'),filters=document.getElementById('filters'),count=document.getElementById('result-count');let stage='all';
  const requested=new URLSearchParams(location.search).get('family');if(requested&&d.structure.families.some(f=>f.id===requested))fam.value=requested;
  filters.addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(!b)return;stage=b.dataset.stage;filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));draw()});
  [q,fam,sec,sort].forEach(e=>e.addEventListener(e===q?'input':'change',draw));
  function draw(){
    const s=q.value.trim().toLowerCase();
    let rows=d.assets.filter(a=>(stage==='all'||a.stage===stage)&&(fam.value==='all'||a.family.id===fam.value)&&(sec.value==='all'||a.sector===sec.value)&&(!s||`${a.ref} ${a.name} ${a.description} ${a.family.name} ${a.sector} ${a.route}`.toLowerCase().includes(s)));
    if(sort.value==='name')rows.sort((a,b)=>a.name.localeCompare(b.name));else if(sort.value==='ask-desc')rows.sort((a,b)=>b.ask-a.ask);else if(sort.value==='ask-asc')rows.sort((a,b)=>a.ask-b.ask);else if(sort.value==='rep-desc')rows.sort((a,b)=>b.replacementCost-a.replacementCost);else rows.sort((a,b)=>PS[b.potential]-PS[a.potential]||b.ask-a.ask);
    count.textContent=`${rows.length} of ${d.assets.length} standalone assets`;
    box.innerHTML=rows.map(a=>`<article class="collection-row"><div class="row-ref"><span>${a.ref}</span><b>${POT[a.potential]}</b></div><div class="row-main"><span class="stage">${STAGES[a.stage]}</span><h2><a href="${ROOT}projects/${a.slug}/">${ESC(a.name)}</a></h2><p>${ESC(a.description)}</p><small>${ESC(a.family.name)} · ${ESC(a.sector)}</small></div><div class="row-money"><div><span>IP acquisition ask</span><strong>${EUR(a.ask)}</strong><small>≈ ${USD(a.ask)}</small></div><div><span>Recreation cost</span><strong>${EUR(a.replacementCost)}</strong><small>Ask / rebuild ${PCT(a.ask/a.replacementCost)}</small></div></div></article>`).join('');
  }draw();
}
function proofPage(d){
  const p=d.values.portfolio,a=d.att,rec=d.reconciliation;
  return wrap(`<section class="page-hero proof-hero"><div class="shell"><p class="eyebrow">Public existence & integrity record</p><h1>Proof without disclosure.</h1><p class="lede">The public record is deliberately narrow: it proves the integrity and internal consistency of the published commercial catalogue while leaving source code, private evidence and security-sensitive implementation outside the public perimeter.</p></div></section>
  <section class="section"><div class="shell"><div class="proof-status ${d.integrity.ok&&rec.ok?'pass':'fail'}"><div>${verificationMark(d)}<h2>${d.integrity.ok&&rec.ok?'Current public record verifies.':'Verification requires attention.'}</h2><p>Publication basis ${ESC(a.publicationDate)} · ${p.assetCount} assets · model ${ESC(d.method.v)}</p></div><div class="seal"><span>TA</span><small>PUBLIC<br>ATTESTATION</small></div></div>
  <div class="hash-grid"><article><span>Valuation register · SHA-256</span><code id="valuation-digest">${ESC(a.files['valuation-register.json'].sha256)}</code><small id="valuation-file-state">${d.integrity.valuation?'MATCH':'MISMATCH'}</small></article><article><span>Economic methodology · SHA-256</span><code id="methodology-digest">${ESC(a.files['economic-methodology.json'].sha256)}</code><small id="methodology-file-state">${d.integrity.methodology?'MATCH':'MISMATCH'}</small></article></div>
  <div class="section-head subhead"><div><p class="eyebrow">Arithmetic reconciliation</p><h2>Published totals are recomputed asset by asset.</h2></div><p>The browser applies the disclosed methodology to the current public inputs and compares the result with the published totals.</p></div>
  <div class="reconcile-grid">${metric('Asset count',d.assets.length,p.assetCount,rec.checks.assetCount,false)}${metric('Seller ask',rec.totals.ask,p.sellerAskEUR,rec.checks.ask)}${metric('Recreation cost',rec.totals.rep,p.replacementCostEUR,rec.checks.rep)}${metric('Market proxy',rec.totals.market,p.marketComparableProxyEUR,rec.checks.market)}${metric('Income proxy',rec.totals.income,p.incomeLicensingProxyEUR,rec.checks.income)}${metric('Strategic reference',rec.totals.strategic,p.probabilityAdjustedStrategicValueEUR,rec.checks.strategic)}${metric('Triangulated reference',rec.totals.tri,p.triangulatedEconomicReferenceEUR,rec.checks.tri)}</div>
  <div class="proof-actions"><a class="btn primary" href="${AS}public-attestation.json" download>Download attestation JSON</a><a class="btn" href="${AS}economic-methodology.json" download>Download methodology JSON</a><a class="btn" href="${AS}valuation-register.json" download>Download valuation register</a></div>
  <div class="boundary-note"><strong>What this proves.</strong><p>The dated GitHub Pages publication and matching SHA-256 digests establish that these exact public register and methodology bytes existed in this publication state. The reconciliation establishes deterministic arithmetic consistency.</p><strong>What this does not prove.</strong><p>It is not an independent authorship or title opinion, patent-priority record, source-code disclosure, security audit, scientific validation, certified appraisal or guarantee of buyer outcomes. Those matters belong in controlled diligence.</p></div></div></section>`,'proof.html',p.assetCount);
}
function metric(label,actual,expected,ok,money=true){const fmt=v=>money?EUR(v):String(v);return`<article class="metric-check"><span>${ESC(label)}</span><strong>${fmt(actual)}</strong><small>${ok?'MATCH':'MISMATCH'} · published ${fmt(expected)}</small></article>`}
function valuation(d){
  const p=d.values.portfolio,w=d.method.factors.triangulationWeights,n=p.assetCount;
  return wrap(`<section class="page-hero"><div class="shell"><p class="eyebrow">Reproducible seller-side economics</p><h1>Valuation with visible assumptions.</h1><p class="lede">Recreation cost anchors the seller asking position. Secondary market, income and strategic lenses are deterministic model outputs—not claims of certified market value.</p>${verificationMark(d)}</div></section>
  <section class="section"><div class="shell"><div class="valuation-hero"><div><span>Aggregate IP acquisition ask</span><strong>${EURM(p.sellerAskEUR)}</strong><small>≈ ${USDM(p.sellerAskEUR)} USD</small></div><div><span>Engineering recreation cost</span><strong>${EURM(p.replacementCostEUR)}</strong><small>≈ ${USDM(p.replacementCostEUR)} USD</small></div><div><span>Ask / recreation cost</span><strong>${PCT(p.sellerAskAsShareOfReplacementCost)}</strong><small>Indicative rebuild spread ${EURM(p.replacementCostEUR-p.sellerAskEUR)}</small></div></div><p class="fine">${FXNOTE()}</p>
  <div class="section-head subhead"><div><p class="eyebrow">Secondary analytical lenses</p><h2>Buyer-side context, separated from price.</h2></div><p>These figures are useful for screening and scenario comparison. They are explicitly not independent transaction comparables or forecast cash flows.</p></div>
  <div class="value-grid"><article><span>Market / comparable proxy</span><strong>${EURM(p.marketComparableProxyEUR)}</strong><p>Maturity × market potential × sector context.</p></article><article><span>Income / licensing proxy</span><strong>${EURM(p.incomeLicensingProxyEUR)}</strong><p>Maturity × income potential × route monetisation.</p></article><article><span>Probability-adjusted strategic value</span><strong>${EURM(p.probabilityAdjustedStrategicValueEUR)}</strong><p>Opportunity × technical completion × commercialisation × rights × time risk.</p></article><article><span>Triangulated analytical reference</span><strong>${EURM(p.triangulatedEconomicReferenceEUR)}</strong><p>${w.replacementCost*100}% recreation + ${w.marketComparableProxy*100}% market + ${w.incomeLicensingProxy*100}% income + ${w.probabilityAdjustedStrategicValue*100}% strategic.</p></article></div>
  <div class="model-box"><div><p class="eyebrow">Calibration</p><h2>Engineering-equivalent rebuild basis.</h2><p>Senior engineer month: ${EUR(d.method.rebuildCostCalibration.seniorEngineerMonthEUR)} · lead/specialist month: ${EUR(d.method.rebuildCostCalibration.leadOrSpecialistMonthEUR)} · validation/provenance month: ${EUR(d.method.rebuildCostCalibration.validationProvenanceMonthEUR)} · coordination/tooling allowance: ${PCT(d.method.rebuildCostCalibration.coordinationToolingAllowance)}.</p></div><a class="btn" href="${ROOT}proof.html">Verify the arithmetic</a></div>
  <div class="boundary-note"><strong>Valuation boundary.</strong><p>Reproducibility means another reader can obtain the same model result from the same public inputs. It does not make the inputs independently audited, nor does it establish fair market value. Buyer-specific rights, exclusivity, remaining work, synergies, third-party dependencies and evidence can materially alter negotiated value.</p></div></div></section>`,'valuation.html',n);
}
function developmentIssue(p){
  const id=p.ref?`${p.ref} — ${p.name}`:p.name;
  return `https://github.com/TheArchitect-max/MyProjects/issues/new?title=${encodeURIComponent(`Development inquiry — ${id}`)}&body=${encodeURIComponent(`Public contact initiation only. Do not include confidential information.\n\nProject: ${id}\nInterest: development sponsorship / co-development / licensing with development commitment / separately structured private financing\n\nA project-specific milestone scope, evidence perimeter, budget and definitive terms must be agreed separately.`)}`;
}
function developmentPage(d){
  const n=d.projects.length,priced=d.assets.length,unpriced=n-priced;
  const rows=[...d.projects].sort((a,b)=>a.name.localeCompare(b.name)).map(p=>{
    const ref=p.ref||'DEVELOPMENT';
    const family=p.familyName||(p.family&&p.family.name)||'Independent project';
    const commercial=p.commercialReference?EUR(p.ask):'Not established';
    return `<article class="collection-row" data-development-row data-search="${ESC(`${p.name} ${p.description} ${family} ${p.sector||''} ${p.stageLabel||''} ${p.ref||''}`.toLowerCase())}"><div class="row-ref"><span>${ESC(ref)}</span><b>${p.commercialReference?'Commercial + development':'Development only'}</b></div><div class="row-main"><span class="stage">${ESC(p.stageLabel||'Repository-evidenced project')}</span><h2><a href="${ROOT}projects/${p.slug}/">${ESC(p.name)}</a></h2><p>${ESC(p.description)}</p><small>${ESC(family)}${p.sector?` · ${ESC(p.sector)}`:''}</small></div><div class="row-money"><div><span>Commercial reference</span><strong>${commercial}</strong><small>${p.commercialReference?'Existing seller-side acquisition reference':'No validated public seller-side price established'}</small></div><div><span>Development capital</span><strong>Milestone-defined</strong><small>No amount stated before scope and budget validation</small></div></div></article>`;
  }).join('');
  return wrap(`<section class="page-hero"><div class="shell"><p class="eyebrow">Development capital</p><h1>Fund defined progress.<br><em>Not undefined promises.</em></h1><p class="lede">${n} repository-backed projects are represented individually. ${priced} currently have established seller-side commercial references; ${unpriced} additional projects are presented without a public valuation. Development capital is scoped against defined technical or commercial milestones rather than an undifferentiated funding request.</p><div class="actions"><a class="btn primary" href="#development-register">Browse development register</a><a class="btn" href="${ROOT}transaction.html">Transaction routes</a></div></div></section>
  <section class="section"><div class="shell"><div class="proof-grid"><article class="proof-card"><span>01</span><h3>Development sponsorship</h3><p>Support a defined engineering, validation or productisation milestone without implying transfer of the underlying IP.</p></article><article class="proof-card"><span>02</span><h3>Strategic co-development</h3><p>Combine capital, technical capability, infrastructure or market access under a separately documented project scope.</p></article><article class="proof-card"><span>03</span><h3>Licence + development</h3><p>Pair defined commercial rights with agreed further-development, validation or deployment commitments.</p></article><article class="proof-card"><span>04</span><h3>External funding route</h3><p>Private financing or an external crowdfunding platform may be used only when separately structured. This website does not process funding or payments.</p></article></div><div class="boundary-note"><strong>Capital discipline.</strong><p>No development amount is presented as validated until the applicable project has a defined milestone, evidence baseline, use-of-funds budget and delivery perimeter. Nothing on this page is an offer of securities, a guarantee of performance or a commitment to enter into a transaction.</p></div></div></section>
  <section class="section" id="development-register"><div class="shell"><div class="section-head"><div><p class="eyebrow">Project register</p><h2>${n} distinct development records.</h2></div><p>Commercial valuation and development funding are separate. A project may be technically active without having a published seller-side price or funding target.</p></div><div class="tools"><label><span>Search development register</span><input id="development-search" type="search" placeholder="Project, capability, family, maturity…"></label></div><div class="collection-meta"><p id="development-count">${n} projects</p>${verificationMark(d,true)}</div><div class="collection-list" id="development-list">${rows}</div></div></section>`,'development.html',priced);
}
function bindDevelopment(d){
  const q=document.getElementById('development-search'),count=document.getElementById('development-count');
  if(!q||!count)return;
  const rows=[...document.querySelectorAll('[data-development-row]')];
  const draw=()=>{const s=q.value.trim().toLowerCase();let visible=0;rows.forEach(r=>{const show=!s||(r.dataset.search||'').includes(s);r.hidden=!show;if(show)visible++});count.textContent=`${visible} of ${d.projects.length} projects`;};
  q.addEventListener('input',draw);draw();
}
function developmentOpportunity(a){
  const issue=developmentIssue(a);
  return `<section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">Development route</p><h2>Milestone-based advancement.</h2></div><p>Acquisition value and development capital are separate concepts. No project-specific funding figure is stated here until a technical or commercial milestone scope and use-of-funds budget have been validated.</p></div><div class="proof-grid"><article class="proof-card"><h3>Development sponsorship</h3><p>Defined engineering, validation or productisation work without automatic transfer of IP ownership.</p></article><article class="proof-card"><h3>Strategic co-development</h3><p>Capital, infrastructure, expertise or market access can be combined under separately agreed rights and deliverables.</p></article><article class="proof-card"><h3>Licence + development</h3><p>Commercial rights can be paired with a separately scoped development commitment where appropriate.</p></article><article class="proof-card"><h3>Private financing</h3><p>Possible only through an appropriate separately documented structure; this public site does not accept or process investment.</p></article></div><div class="actions"><a class="btn primary" target="_blank" rel="noopener" href="${issue}">Development enquiry</a><a class="btn" href="${ROOT}development.html">Development register</a></div></div></section>`;
}
function developmentProject(p,d){
  const issue=developmentIssue(p);
  const family=p.familyName||'Independent project';
  return wrap(`<section class="asset-hero"><div class="shell"><div class="asset-ref">Development project · Repository-evidenced public status</div><h1>${ESC(p.name)}</h1><p class="lede">${ESC(p.description)}</p><div class="actions"><a class="btn primary" target="_blank" rel="noopener" href="${issue}">Development enquiry</a><a class="btn ghost" href="${ROOT}development.html">Development register</a></div></div></section>
  <section class="section"><div class="shell detail-grid"><article class="profile-panel"><p class="eyebrow">Public development profile</p><dl><div><dt>Classification</dt><dd>${ESC(family)}</dd></div><div><dt>Sector</dt><dd>${ESC(p.sector||'Technology development')}</dd></div><div><dt>Demonstrated maturity</dt><dd>${ESC(p.stageLabel)}</dd></div><div><dt>Development capital</dt><dd>Defined per validated milestone</dd></div><div><dt>Commercial reference</dt><dd>No validated public seller-side price established</dd></div></dl></article><aside class="price-panel"><span>Development funding status</span><strong>Scope first</strong><small>No funding amount is published before a project-specific milestone and budget are validated.</small><hr><span>Public transaction status</span><b>By enquiry</b><small>Any sponsorship, licence, co-development or financing terms require separate definitive documentation.</small></aside></div></section>
  <section class="section ink-section"><div class="shell"><div class="section-head"><div><p class="eyebrow">Evidence boundary</p><h2>Only demonstrated status is published.</h2></div><p>Repository evidence supports the public maturity description. Private implementation detail, controlled validation material and security-sensitive information are not exposed by this development profile.</p></div></div></section>
  <section class="section"><div class="shell"><div class="proof-grid"><article class="proof-card"><h3>Defined milestone</h3><p>State the technical or commercial output that development capital is intended to produce.</p></article><article class="proof-card"><h3>Use of funds</h3><p>Establish a project-specific budget before any funding amount is represented as validated.</p></article><article class="proof-card"><h3>Acceptance evidence</h3><p>Define reproducible completion and validation criteria for the funded milestone.</p></article><article class="proof-card"><h3>Separate terms</h3><p>Funding does not itself transfer source code, ownership, licences or other IP rights.</p></article></div><div class="boundary-note"><strong>Public boundary.</strong><p>This profile is informational. It is not an offer of securities, a guarantee of technical or commercial performance, or a substitute for legal, technical and financial diligence.</p></div></div></section>`,'development.html',d.values.portfolio.assetCount);
}
async function publicFingerprint(a,basis){const obj={ref:a.ref,slug:a.slug,name:a.name,stage:a.stage,potential:a.potential,sector:a.sector,route:a.route,ask:a.ask,low:a.low,high:a.high,recreationCost:a.replacementCost,basisDate:basis};return sha256(JSON.stringify(obj))}
function project(a,d){
  const e=a.econ,buy=BUYERS[a.family.id]||'strategic technology buyers';
  const issue=`https://github.com/TheArchitect-max/MyProjects/issues/new?title=${encodeURIComponent(`Commercial inquiry — ${a.ref}`)}&body=${encodeURIComponent(`Public contact initiation only. Do not include confidential information.\n\nAsset: ${a.ref} — ${a.name}\nInterest: acquisition / licensing / strategic integration`)}`;
  return wrap(`<section class="asset-hero"><div class="shell"><div class="asset-ref">${a.ref} · Standalone proprietary IP asset</div><h1>${ESC(a.name)}</h1><p class="lede">${ESC(a.description)}</p><div class="actions"><a class="btn primary" target="_blank" rel="noopener" href="${issue}">Commercial enquiry</a><a class="btn ghost" href="${ROOT}portfolio.html?family=${a.family.id}">Related assets</a></div></div></section>
  <section class="section"><div class="shell detail-grid"><article class="profile-panel"><p class="eyebrow">Commercial profile</p><dl><div><dt>Classification</dt><dd>${ESC(a.family.name)}</dd></div><div><dt>Sector</dt><dd>${ESC(a.sector)}</dd></div><div><dt>Seller-assessed stage</dt><dd>${STAGES[a.stage]}</dd></div><div><dt>Commercial potential</dt><dd>${POT[a.potential]}</dd></div><div><dt>Primary route</dt><dd>${ESC(a.route)}</dd></div></dl><div class="fingerprint"><span>Public record fingerprint · SHA-256</span><code id="asset-fingerprint">Calculating…</code><small>Deterministic fingerprint of this public commercial record; not a source-code hash.</small></div></article>
  <aside class="price-panel"><span>Indicative IP acquisition ask</span><strong>${EUR(a.ask)}</strong><small>≈ ${USD(a.ask)} USD</small><hr><span>Negotiation range</span><b>${EUR(a.low)} – ${EUR(a.high)}</b><hr><span>Engineering recreation cost</span><b>${EUR(e.replacementCostEUR)}</b><hr><span>Ask / recreation cost</span><b>${PCT(a.ask/e.replacementCostEUR)}</b></aside></div><p class="shell fine">${FXNOTE()}</p></section>
  <section class="section ink-section"><div class="shell"><div class="section-head"><div><p class="eyebrow">Secondary analytical context</p><h2>Value lenses after implementation.</h2></div><p>Model outputs are secondary to the recreation-cost price basis and do not guarantee market adoption, income or strategic outcomes.</p></div><div class="value-grid"><article><span>Market proxy</span><strong>${EUR(e.marketComparableProxyEUR)}</strong></article><article><span>Income proxy</span><strong>${EUR(e.incomeLicensingProxyEUR)}</strong></article><article><span>Strategic reference</span><strong>${EUR(e.probabilityAdjustedStrategicValueEUR)}</strong></article><article><span>Triangulated reference</span><strong>${EUR(e.triangulatedEconomicReferenceEUR)}</strong></article></div></div></section>
  ${developmentOpportunity(a)}
  <section class="section"><div class="shell"><div class="proof-grid two"><article class="proof-card"><span>Buyer fit</span><h3>Illustrative counterparties</h3><p>${ESC(buy)}. Actual utility requires buyer-specific technical and commercial diligence.</p></article><article class="proof-card"><span>Disclosure</span><h3>Controlled diligence only</h3><p>Detailed source, architecture, rights, validation and transaction material is not published in this showroom.</p></article></div><div class="boundary-note"><strong>Diligence perimeter.</strong><p>Production readiness, scientific validity, regulatory status, third-party rights, security posture and deployment suitability are qualified separately for the intended transaction and use case.</p></div></div></section>`,'portfolio.html',d.values.portfolio.assetCount);
}
function info(page,d){
  const P={
'opportunity.html':['Commercial Opportunity','Acquire, license or integrate a defined asset.','The portfolio is structured around independently scoped technology assets rather than a services engagement.',[['Selective acquisition','Acquire a specific asset and its agreed first-party transfer perimeter.'],['Licensing','Structure exclusive or non-exclusive rights for a defined field, territory or use.'],['Strategic integration','Use an asset as a starting point for buyer-led productisation, internal R&D or platform integration.']]],
'commercialization.html':['Applications & Buyer Fit','Commercial pathways are asset-specific.','Each family has different buyer economics, integration requirements and remaining development risk.',d.structure.families.slice(0,6).map(f=>[f.name,f.description])],
'transaction.html':['Transaction Process','Public screening first. Controlled diligence second.','A serious transaction begins with a TA-IP reference and intended use. Confidential material is never requested through the public catalogue.',[['1 · Identify','Select the asset and intended acquisition, licensing or integration route.'],['2 · Qualify','Define rights, dependencies, evidence requirements and intended use.'],['3 · Diligence','Review private technical, legal and commercial evidence through an appropriate controlled channel.'],['4 · Agree','Document price, transfer perimeter, representations, acceptance and closing conditions.']]],
'transfer.html':['Buyer Transfer Guide','Transfer scope is defined asset by asset.','A transaction can include agreed first-party IP, documentation and handover material while third-party rights remain governed separately.',[['Rights perimeter','Specify ownership representations, licence scope, exclusivity, territory and field of use.'],['Dependencies','Identify third-party software, data, models, standards or services and their separate terms.'],['Acceptance','Agree reproducible delivery and buyer-specific acceptance criteria.'],['Operations','Hosting, compliance, support and commercial operation transfer only when explicitly included.']]],
'assurance.html':['Disclosure & Assurance','The showroom is intentionally incomplete.','Public information supports buyer screening while detailed technical and transaction material remains controlled.',[['Published','Asset identity, public purpose, stage, seller ask, recreation-cost reference, methodology and file-integrity fingerprints.'],['Controlled diligence','Source code, detailed architecture, internal validation artifacts, rights records, security-sensitive material and transaction-confidential evidence.'],['Not implied','A development label does not imply production certification, scientific validation, regulatory approval or guaranteed commercial performance.']]],
'notice.html':['Important Notice','Seller-side references for professional discussion.','All figures and classifications are preliminary, asset-specific and subject to diligence and definitive agreement.',[['Valuation','Asking prices and recreation-cost references are seller-side estimates, not certified independent valuations.'],['Technical status','Software maturity does not establish fitness for a buyer’s intended deployment.'],['Third-party rights','External libraries, models, datasets, services, standards, media and APIs retain their own rights and terms.'],['Confidentiality','Do not submit confidential or transaction-sensitive material through public GitHub issues.']]],
'evidence.html':['Evidence & Diligence','Public proof is deliberately narrower than private diligence.','The catalogue shows enough to screen an acquisition opportunity without publishing the proprietary implementation.',[['Public existence record','Dated asset identities, public commercial descriptions and deterministic record fingerprints.'],['Public valuation evidence','Reproducible model factors, SHA-256 file integrity and browser-side aggregate reconciliation.'],['Controlled technical evidence','Source, internal architecture, detailed validation evidence and sensitive security material remain private.'],['Controlled rights evidence','Ownership representations, third-party dependency analysis, provenance and transfer limitations are qualified asset by asset.'],['Buyer acceptance','Deployment, integration, compliance and acceptance criteria are defined against the buyer’s intended use.'],['Scientific boundary','Research maturity and software maturity are not conflated; unverified scientific claims stay explicitly bounded.']]]};
  const x=P[page]||['Technology & IP Portfolio','Public commercial information','Select a portfolio section.',[]],n=d.values.portfolio.assetCount;
  return wrap(`<section class="page-hero"><div class="shell"><p class="eyebrow">Technology & IP Portfolio</p><h1>${ESC(x[0])}</h1><p class="lede">${ESC(x[1])}</p><p>${ESC(x[2])}</p></div></section><section class="section"><div class="shell"><div class="proof-grid info-grid">${x[3].map(([h,p])=>`<article class="proof-card"><h3>${ESC(h)}</h3><p>${ESC(p)}</p></article>`).join('')}</div><div class="actions"><a class="btn primary" href="${ROOT}portfolio.html">Browse ${n} assets</a><a class="btn" href="${ROOT}proof.html">Verify public record</a></div></div></section>`,page,n);
}
function notFound(n=EXPECTED_ASSETS){return wrap(`<section class="page-hero"><div class="shell"><p class="eyebrow">Portfolio</p><h1>Profile not found.</h1><p class="lede">The requested public portfolio page is unavailable.</p><a class="btn primary" href="${ROOT}portfolio.html">Browse assets</a></div></section>`,'',n)}
async function bindProjectFingerprint(a,d){const el=document.getElementById('asset-fingerprint');if(el)el.textContent=await publicFingerprint(a,d.values.valuationBasisDate)}
async function render(){
  const d=await load(),rel=path(),app=document.getElementById('app'),n=d.values.portfolio.assetCount;let html,a=null;
  if(!rel||rel==='index.html'){title('Private Technology & IP Portfolio',`${n} proprietary technology and IP assets with public proof and reproducible seller-side valuation.`);html=home(d)}
  else if(rel==='portfolio.html'){title('Collection',`Search ${n} individually priced proprietary technology assets.`);html=portfolio(d)}
  else if(rel==='development.html'){title('Development','Repository-backed development opportunities with milestone-defined capital scopes.');html=developmentPage(d)}
  else if(rel==='proof.html'){title('Proof of Existence & Integrity','Public existence attestation, SHA-256 integrity verification and valuation reconciliation.');html=proofPage(d)}
  else if(rel==='valuation.html'){title('Verifiable Valuation',`Recreation-cost-anchored, reproducible seller-side valuation framework for ${n} proprietary assets.`);html=valuation(d)}
  else if(rel==='updates.html'){title('Portfolio Status');html=proofPage(d)}
  else if(rel.startsWith('projects/')){const slug=rel.split('/')[1];const p=d.projects.find(x=>x.slug===slug);if(p){title(p.name,p.description);if(p.kind==='asset'){a=p;html=project(a,d)}else html=developmentProject(p,d)}else html=notFound(n)
  else if(['opportunity.html','commercialization.html','evidence.html','transaction.html','transfer.html','assurance.html','notice.html'].includes(rel)){title(rel.replace('.html','').replace(/(^.|-.)/g,s=>s.replace('-',' ').toUpperCase()));html=info(rel,d)}
  else html=notFound(n);
  app.innerHTML=html;
  if(rel==='portfolio.html')bindPortfolio(d);
  if(rel==='development.html')bindDevelopment(d);
  if(a)await bindProjectFingerprint(a,d);
}
render().catch(e=>{console.error(e);document.getElementById('app').innerHTML=`<main id="main"><section class="page-hero"><div class="shell"><h1>Portfolio temporarily unavailable.</h1><p>Public commercial data could not be verified and loaded.</p></div></section></main>`});
})();