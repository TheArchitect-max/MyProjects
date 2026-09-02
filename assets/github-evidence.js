(()=>{
'use strict';
const RELEASE='20260902-11';
const IS_PROJECT=/\/projects\/[^/]+\/?$/.test(location.pathname);
const BASE=IS_PROJECT?'../../':'./';
const EVIDENCE_URL=`${BASE}evidence/github-existence.json?v=${RELEASE}`;
const AUDIT_UPDATES={
 'unified-execution-engine':{
   label:'Validated SaaS v0.4',
   summary:'A validated multi-tenant SaaS control plane and bounded execution platform with durable provisioning, tenant-scoped audit, an embedded operator console and software-in-the-loop acceptance.',
   note:'Repository audit · 02 Sep 2026: SaaS control plane v0.4 is repository-validated. AWS/EKS deployment and real physical-equipment validation remain external gates.'
 },
 'distributed-ai-resource-fabric':{
   label:'v0.9 GPU-admitted inference',
   summary:'A distributed AI resource and inference fabric with authenticated workers, real Tesla-T4 hardware validation, per-device GPU admission and measured inference benchmarking.',
   note:'Repository audit · 02 Sep 2026: the exact v0.8 Colab baseline passed 115/115 tests plus CUDA allocation and FP16 matmul; v0.9 adds GPU-admission semantics with a 23/23 focused gate. The updated full v0.9 engine/hardware gate remains open.'
 },
 'truelane-engineering-excellence':{
   label:'v0.41 research chain',
   summary:'A structured engineering knowledge and mastery platform with evidence-governed specialist research, assessment and architecture reasoning.',
   note:'Repository audit · 02 Sep 2026: D10 is complete at research_in_progress, while executable integration validation and independent canonical promotion remain open gates.'
 }
};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const slugFromHref=href=>{const m=String(href||'').match(/projects\/([^/]+)\/?/);return m?m[1]:''};
function addStyle(){
 if(document.getElementById('github-evidence-style'))return;
 const s=document.createElement('style');s.id='github-evidence-style';s.textContent=`
.github-evidence-panel{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#0a0a09}
.github-evidence-grid{display:grid;grid-template-columns:.72fr 1.28fr;gap:8vw;align-items:start}
.github-evidence-grid h2{font-family:var(--serif);font-size:clamp(2.35rem,4vw,4.2rem);font-weight:400;line-height:1;margin:0}
.github-evidence-status{display:inline-flex;align-items:center;gap:8px;font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;color:#d8c39e;border:1px solid rgba(213,175,114,.25);padding:7px 9px;margin-bottom:18px}
.github-evidence-status:before{content:'✓';font-size:.72rem}
.github-evidence-copy{font-family:var(--serif);font-size:1.05rem;color:#aaa399;line-height:1.75;margin:0}
.github-evidence-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:24px}
.github-evidence-meta>div{border:1px solid var(--line);padding:18px}
.github-evidence-meta small{display:block;font-size:.54rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted2);margin-bottom:8px}
.github-evidence-meta strong{font-family:var(--serif);font-weight:400;color:#d8c39e}
.github-evidence-note{font-size:.62rem;color:var(--muted2);line-height:1.65;margin-top:18px}
.github-evidence-chip{color:#cbb78f!important;border-color:rgba(213,175,114,.25)!important}
.audit-update{margin-top:20px;border:1px solid var(--line);padding:18px;background:rgba(255,255,255,.012)}
.audit-update strong{display:block;color:#d8c39e;margin-bottom:6px}
.audit-update p{margin:0!important;font-size:.68rem!important;color:var(--muted)!important;line-height:1.65!important}
@media(max-width:760px){.github-evidence-grid,.github-evidence-meta{grid-template-columns:1fr}}`;
 document.head.appendChild(s);
}
function formatDate(v){
 const d=new Date(v); if(Number.isNaN(d.getTime()))return v;
 return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
}
function addNavLink(href,label,beforeLabel){
 const nav=document.querySelector('header .links'); if(!nav||[...nav.querySelectorAll('a')].some(a=>a.textContent.trim()===label))return;
 const a=document.createElement('a');a.href=href;a.textContent=label;
 const before=[...nav.querySelectorAll('a')].find(x=>x.textContent.trim()===beforeLabel);
 nav.insertBefore(a,before||null);
}
function patchOwnership(){
 document.querySelectorAll('.summary-main span,.showroom-bar strong,.storefront-copy h2,.footer-inner div').forEach(el=>{
   el.textContent=el.textContent.replace('owner-held software/IP assets','first-party proprietary software/IP assets')
     .replace('Owner-held portfolio','First-party proprietary IP')
     .replace('An owner-held software/IP asset with a defined path forward.','A first-party proprietary software/IP asset with a defined path forward.')
     .replace('Owner-held software/IP asset','First-party proprietary software/IP asset');
 });
 const signals=document.querySelector('.hero-signals');
 if(signals&&!signals.querySelector('[data-private-proof]')){const span=document.createElement('span');span.dataset.privateProof='true';span.textContent='50/50 private core repositories verified';signals.appendChild(span)}
}
function patchCards(records){
 const map=new Map(records.map(r=>[r.slug,r]));
 const run=()=>document.querySelectorAll('#project-grid a.card').forEach(card=>{
   const slug=slugFromHref(card.getAttribute('href')),r=map.get(slug); if(!r)return;
   const update=AUDIT_UPDATES[slug],p=card.querySelector('h3 + p');
   if(update&&p)p.textContent=update.summary;
   const chips=card.querySelector('.chips');
   if(chips&&!card.dataset.githubEvidence){const chip=document.createElement('span');chip.className='chip github-evidence-chip';chip.textContent='✓ Private GitHub repo verified';chips.appendChild(chip);card.dataset.githubEvidence='true'}
   if(update&&chips&&!card.dataset.auditUpdate){const chip=document.createElement('span');chip.className='chip';chip.textContent=update.label;chips.appendChild(chip);card.dataset.auditUpdate='true'}
 });
 run(); const grid=document.getElementById('project-grid');if(grid)new MutationObserver(run).observe(grid,{childList:true,subtree:true});
}
function renderHome(data){
 if(document.getElementById('github-proof'))return;
 const anchor=document.getElementById('data-foundations')||document.getElementById('portfolio');if(!anchor)return;
 const allPrivate=data.records.length===50&&data.records.every(r=>r.repository_exists&&r.repository_private);
 const section=document.createElement('section');section.id='github-proof';section.className='github-evidence-panel';
 section.innerHTML=`<div class="shell section github-evidence-grid"><div><p class="eyebrow">GitHub Proof of Existence</p><h2>${allPrivate?'50 private repositories verified.':'Repository inventory review required.'}</h2></div><div><span class="github-evidence-status">${allPrivate?'Connected-account verified':'Review required'}</span><p class="github-evidence-copy">Each listed software/IP asset is backed by a repository verified through the authorized GitHub account. The public proof confirms existence and private visibility without exposing private repository identity, source code, branches, commits or file structure.</p><div class="github-evidence-meta"><div><small>Verified assets</small><strong>${data.records.filter(r=>r.repository_exists).length} / 50</strong></div><div><small>Private repositories</small><strong>${data.records.filter(r=>r.repository_private).length} / 50</strong></div><div><small>Verified</small><strong>${esc(formatDate(data.verified_at))}</strong></div></div><p class="github-evidence-note">This is repository-existence and visibility evidence, not independent technical certification. Detailed repository identifiers remain private and are available only during authorized diligence.</p></div></div>`;
 anchor.insertAdjacentElement('beforebegin',section);addNavLink('#github-proof','GitHub Proof','Data Foundation');
}
function renderProject(data){
 const root=document.getElementById('project');if(!root)return;
 const slug=document.documentElement.dataset.asset||location.pathname.replace(/\/$/,'').split('/').pop();
 const r=data.records.find(x=>x.slug===slug);if(!r)return;
 const insert=()=>{
   const facts=root.querySelector('.facts');if(!facts)return false;
   const update=AUDIT_UPDATES[slug];
   if(update){
     const lede=root.querySelector('.project-lede');if(lede)lede.textContent=update.summary;
     const copy=root.querySelector('.storefront-copy div:last-child p:first-child');if(copy)copy.textContent=update.summary;
     if(!root.querySelector('[data-repo-audit-update]')){const box=document.createElement('div');box.className='audit-update';box.dataset.repoAuditUpdate='true';box.innerHTML=`<strong>${esc(update.label)}</strong><p>${esc(update.note)}</p>`;facts.querySelector('.shell')?.appendChild(box)}
   }
   if(document.getElementById('github-existence-evidence'))return true;
   const anchor=document.getElementById('project-data-foundation')||facts;
   const section=document.createElement('section');section.id='github-existence-evidence';section.className='github-evidence-panel';
   section.innerHTML=`<div class="shell section github-evidence-grid"><div><p class="eyebrow">GitHub Proof of Existence</p><h2>Private repository verified.</h2></div><div><span class="github-evidence-status">Connected-account verified</span><p class="github-evidence-copy">This software/IP asset is backed by a private GitHub repository verified through authorized account access. Its source repository remains non-public.</p><div class="github-evidence-meta"><div><small>Evidence record</small><strong>${esc(r.evidence_ref)}</strong></div><div><small>Asset reference</small><strong>${esc(r.asset_ref)}</strong></div><div><small>Visibility</small><strong>${r.repository_private?'Private':'Review'}</strong></div></div><p class="github-evidence-note">Verified ${esc(formatDate(data.verified_at))}. Repository name, ID, branch names, commit identifiers, file tree and source paths are intentionally withheld from the public showroom.</p></div></div>`;
   anchor.insertAdjacentElement('afterend',section);addNavLink('#github-existence-evidence','GitHub Proof','Data Foundation');return true;
 };
 if(!insert()){const o=new MutationObserver(()=>{if(insert())o.disconnect()});o.observe(root,{childList:true,subtree:true})}
}
async function run(){
 addStyle();
 const res=await fetch(EVIDENCE_URL,{cache:'no-store'});if(!res.ok)throw new Error('GitHub evidence register unavailable');
 const data=await res.json();
 if(data.schema!=='ta-github-existence-v2'||data.release!==RELEASE||!Array.isArray(data.records)||data.records.length!==50)throw new Error('GitHub evidence register mismatch');
 if(!data.records.every(r=>r.repository_exists===true&&r.repository_private===true))throw new Error('Private repository proof incomplete');
 patchOwnership();patchCards(data.records);renderHome(data);renderProject(data);
 document.documentElement.dataset.githubEvidenceRelease=RELEASE;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>run().catch(console.error),{once:true});else run().catch(console.error);
})();