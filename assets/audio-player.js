(()=>{'use strict';
const current=document.currentScript;
const base=new URL('./',current.src);
const load=(name,version)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(`${name}?v=${version}`,base).href;s.defer=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
load('audio-core.js','narration1').then(()=>load('classical-names.js','classical1')).catch(()=>{});
})();
