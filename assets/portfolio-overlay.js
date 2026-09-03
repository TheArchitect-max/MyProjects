(()=>{'use strict';
const RELEASE='20260903-19';
const SWAPS=[
 [/(?:54|57) \/ (?:54|57)/g,'64 / 64'],[/(?:54|57)(?: canonical)? private core repositories verified/g,'64 canonical private repositories verified'],[/(?:54|57)(?: canonical)? proprietary first-party boundaries reviewed/g,'64 canonical proprietary first-party boundaries reviewed'],[/(?:54|57) private software\/IP assets/g,'64 private software/IP assets'],[/(?:54|57) private software and IP assets/g,'64 private software and IP assets'],[/(?:54|57) assets/g,'64 assets'],[/(?:32 \/ 19 \/ 3|33 \/ 21 \/ 3)/g,'36 / 24 / 4']
];
function swapText(root=document.body){if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){let value=node.nodeValue;for(const [from,to] of SWAPS)value=value.replace(from,to);if(value!==node.nodeValue)node.nodeValue=value}}
function apply(){const sourceRelease=document.documentElement.dataset.release||'';if(sourceRelease!==RELEASE)swapText();document.documentElement.dataset.release=RELEASE;document.querySelectorAll('.footer-inner div').forEach(x=>{x.textContent=x.textContent.replace(/Release 20260903-(?:16|17|18)/g,`Release ${RELEASE}`)})}
let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;apply()})};
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
