(()=>{
'use strict';
const RELEASE='20260902-08';
function patchProject(){
  const root=document.getElementById('project');
  if(!root)return;
  const apply=()=>{
    root.querySelectorAll('h2,strong,p,small,span').forEach(el=>{
      if(el.textContent==='A proprietary software venture with a defined path forward.')el.textContent='An owner-held software venture with a defined path forward.';
      if(el.textContent==='Private IP asset')el.textContent='Owner-held software/IP asset';
    });
    const hero=root.querySelector('.asset-hero .chips');
    if(hero&&!hero.querySelector('[data-owner-held]')){
      const chip=document.createElement('span');
      chip.className='chip';
      chip.dataset.ownerHeld='true';
      chip.textContent='Owner-held software/IP asset';
      hero.appendChild(chip);
    }
  };
  apply();
  new MutationObserver(apply).observe(root,{childList:true,subtree:true});
}
function run(){patchProject();document.documentElement.dataset.portfolioSyncRelease=RELEASE}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
