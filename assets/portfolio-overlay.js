(()=>{'use strict';
const RELEASE='20260903-18';
const SWAPS=[
 [/€21\.66M/g,'€10.31M'],[/€21\.660\.000/g,'€10.310.000'],[/\$25\.08M/g,'$11.94M'],[/\$25,077,948/g,'$11,936,918'],[/55\.9%/g,'26.6%'],
 [/€20\.78M/g,'€10.31M'],[/€20\.780\.000/g,'€10.310.000'],[/\$24\.06M/g,'$11.94M'],[/\$24,059,084/g,'$11,936,918'],
 [/54 \/ 54/g,'57 / 57'],[/54 private core repositories verified/g,'57 canonical private repositories verified'],[/54 proprietary first-party boundaries reviewed/g,'57 canonical proprietary first-party boundaries reviewed'],[/54 private software\/IP assets/g,'57 private software/IP assets'],[/54 private software and IP assets/g,'57 private software and IP assets'],[/54 assets/g,'57 assets'],[/32 \/ 19 \/ 3/g,'33 / 21 / 3']
];
function swapText(root=document.body){if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){let value=node.nodeValue;for(const [from,to] of SWAPS)value=value.replace(from,to);if(value!==node.nodeValue)node.nodeValue=value}}
function apply(){document.documentElement.dataset.release=RELEASE;swapText();document.querySelectorAll('.footer-inner div').forEach(x=>{if(x.textContent.includes('Release 20260903-17'))x.textContent=x.textContent.replace('Release 20260903-17',`Release ${RELEASE}`);if(x.textContent.includes('Release 20260903-16'))x.textContent=x.textContent.replace('Release 20260903-16',`Release ${RELEASE}`)})}
let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;apply()})};
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
