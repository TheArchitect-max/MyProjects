(()=>{'use strict';
const script=document.currentScript;
const root=new URL('../',script.src);
const cfgUrl=new URL('assets/display-names.json?v=classical1',root).href;
const projectSlug=()=>{const base=new URL(root).pathname.replace(/\/$/,'');const rel=location.pathname.startsWith(base)?location.pathname.slice(base.length):location.pathname;const m=rel.match(/(?:^|\/)projects\/([^/]+)(?:\/|$)/);return m?decodeURIComponent(m[1]):''};
const slugFromHref=href=>{try{const m=new URL(href,location.href).pathname.match(/\/projects\/([^/]+)(?:\/|$)/);return m?decodeURIComponent(m[1]):''}catch{return''}};
fetch(cfgUrl,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('display names unavailable');return r.json()}).then(cfg=>{
  const names=cfg&&cfg.names||{};
  const entries=Object.entries(names).filter(([,v])=>v&&typeof v.displayName==='string'&&v.displayName.trim());
  const unique=new Set(entries.map(([,v])=>v.displayName.trim().toLowerCase()));
  if(entries.length!==86||unique.size!==entries.length){console.warn('Classical presentation-name register failed validation');return}
  const techBySlug=new Map();
  const style=document.createElement('style');
  style.textContent=`
  .ta-classical-name{letter-spacing:.035em;text-transform:uppercase}
  .ta-technical-name{display:block;margin-top:.38rem;color:rgba(234,217,181,.62);font:600 .43em/1.35 system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase}
  .collection-row .ta-technical-name{font-size:.48em;margin-top:.3rem}
  .asset-card .ta-technical-name{font-size:.46em;margin-top:.28rem}
  .asset-hero h1 .ta-technical-name{font-size:.24em;margin-top:.65rem;max-width:52rem;letter-spacing:.1em;color:rgba(234,217,181,.7)}
  .ta-naming-note{margin:-1.2rem auto 2.2rem;padding:.8rem 1rem;border-left:2px solid rgba(217,182,111,.55);color:rgba(234,217,181,.72);font:500 12px/1.55 system-ui,sans-serif;letter-spacing:.025em}
  @media(max-width:700px){.ta-technical-name{font-size:.5em}.asset-hero h1 .ta-technical-name{font-size:.28em}.ta-naming-note{margin-top:-.6rem}}
  `;
  document.head.appendChild(style);

  const recordTechnical=(slug,name)=>{if(slug&&name&&!techBySlug.has(slug))techBySlug.set(slug,name)};
  const bindLinkedHeadings=()=>{
    document.querySelectorAll('h2 a[href*="/projects/"],h3 a[href*="/projects/"]').forEach(a=>{
      if(a.dataset.classicalBound==='1')return;
      const slug=slugFromHref(a.href),rec=names[slug];if(!rec)return;
      const heading=a.closest('h2,h3');if(!heading)return;
      const technical=(a.textContent||'').trim();if(!technical)return;
      recordTechnical(slug,technical);
      a.dataset.classicalBound='1';a.dataset.technicalName=technical;a.classList.add('ta-classical-name');
      a.textContent=rec.displayName;a.setAttribute('aria-label',`${rec.displayName} — ${technical}`);
      if(!heading.querySelector(':scope > .ta-technical-name')){const sub=document.createElement('span');sub.className='ta-technical-name';sub.textContent=technical;heading.appendChild(sub)}
    });
  };

  const bindProjectHero=()=>{
    const slug=projectSlug(),rec=names[slug];if(!rec)return;
    const h1=document.querySelector('.asset-hero h1');if(!h1||h1.dataset.classicalBound==='1')return;
    const technical=(h1.textContent||'').trim();if(!technical)return;
    recordTechnical(slug,technical);h1.dataset.classicalBound='1';h1.dataset.technicalName=technical;
    h1.textContent='';const pub=document.createElement('span');pub.className='ta-classical-name';pub.textContent=rec.displayName;const sub=document.createElement('span');sub.className='ta-technical-name';sub.textContent=technical;h1.append(pub,sub);
    document.title=`${rec.displayName} — ${technical} — THEARCHITECT_MAX`;
  };

  const addNamingNote=()=>{
    if(!/\/portfolio\.html$/.test(location.pathname)||document.querySelector('.ta-naming-note'))return;
    const section=document.querySelector('.page-hero + .section .shell');if(!section)return;
    const note=document.createElement('p');note.className='ta-naming-note';note.dataset.noNarration='';note.innerHTML='<strong>Presentation names.</strong> Classical names are showroom aliases only. Technical product identities and TA-IP references remain authoritative.';
    section.prepend(note);
  };

  const sortAliasRows=()=>{
    const sel=document.getElementById('sort'),box=document.getElementById('portfolio-list');if(!sel||!box||sel.value!=='name')return;
    const rows=[...box.children];if(rows.length<2)return;
    const ordered=[...rows].sort((x,y)=>{const ax=(x.querySelector('.ta-classical-name')?.textContent||'').trim();const ay=(y.querySelector('.ta-classical-name')?.textContent||'').trim();return ax.localeCompare(ay,undefined,{sensitivity:'base'})});
    if(rows.every((row,i)=>row===ordered[i]))return;
    ordered.forEach(r=>box.appendChild(r));
  };

  const apply=()=>{bindLinkedHeadings();bindProjectHero();addNamingNote();sortAliasRows()};
  let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})};
  new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{subtree:true,childList:true});
  apply();

  document.addEventListener('input',e=>{
    const q=e.target;if(!(q instanceof HTMLInputElement)||q.id!=='search')return;
    const typed=q.value.trim().toLowerCase();if(typed.length<3)return;
    const hits=entries.filter(([,v])=>v.displayName.toLowerCase()===typed||v.displayName.toLowerCase().startsWith(typed));
    if(hits.length!==1)return;
    const [slug]=hits[0],technical=techBySlug.get(slug);if(!technical)return;
    const original=q.value;q.value=technical;queueMicrotask(()=>{q.value=original;schedule()});
  },true);
  document.addEventListener('change',e=>{if(e.target&&e.target.id==='sort')queueMicrotask(schedule)},true);
}).catch(()=>{});
})();
