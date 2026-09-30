(()=>{'use strict';
if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window))return;
const synth=window.speechSynthesis;
const originalSpeak=synth.speak.bind(synth);
const male=/\b(male|david|mark|guy|ryan|christopher|chris|eric|roger|davis|tony|jason|andrew|brian|thomas|alfie|elliot|ethan|noah|oliver|william|daniel|alex|arthur|fred|ralph|george|james|aaron|bruce|lee|stefan|stefan|henrik|mads|martin|peter|paul|michael|john|richard|robert|samuel|nathan|adam|jack|liam|owen|benjamin|charles|henry)\b/i;
const female=/\b(female|zira|samantha|victoria|karen|moira|serena|tessa|ava|allison|susan|hazel|aria|jenny|michelle|emma|olivia|sara|sarah|sophie|sonia|natasha|libby|joanna|amy|linda|heather|fiona|veena|catherine|katherine|anna|amelie|amélie)\b/i;
function score(v,lang){const n=`${v.name||''} ${v.voiceURI||''}`,l=(v.lang||'').toLowerCase();let s=0;if(l===lang)s+=40;else if(l.startsWith(lang.split('-')[0]))s+=30;if(/natural|neural|enhanced|premium/i.test(n))s+=18;if(/microsoft|google|apple/i.test(n))s+=5;if(male.test(n))s+=100;if(female.test(n))s-=120;if(/en-gb|english.*(uk|united kingdom)/i.test(`${n} ${l}`))s+=4;return s}
function choose(lang){const voices=synth.getVoices();if(!voices.length)return null;const wanted=(lang||document.documentElement.lang||'en').toLowerCase();const ranked=[...voices].map(v=>({v,s:score(v,wanted)})).sort((a,b)=>b.s-a.s);const explicit=ranked.find(x=>male.test(`${x.v.name||''} ${x.v.voiceURI||''}`)&&!female.test(`${x.v.name||''} ${x.v.voiceURI||''}`));return(explicit||ranked[0]||{}).v||null}
try{synth.speak=function(utterance){try{const v=choose(utterance.lang);if(v)utterance.voice=v}catch{}return originalSpeak(utterance)}}catch{}
window.__TA_MALE_VOICE_POLICY__={choose};
})();
