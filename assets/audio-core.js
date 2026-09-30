(()=>{'use strict';
const script=document.currentScript;
const root=new URL('../',script.src);
const source=new URL('assets/classical-cello-background.mp3?v=music1',root).href;
const STORE='ta_portfolio_music_v1',TIME='ta_portfolio_music_time_v1',VOL='ta_portfolio_music_volume_v1',RATE='ta_portfolio_narration_rate_v2';
const NARRATION_PITCH=.78,NARRATION_PAUSE_MS=180,NARRATION_MUSIC_FACTOR=.3125,NARRATION_MUSIC_MIN=.015,NARRATION_MUSIC_MAX=.04375;
let enabled=false,volume=.12,rate=.9,saveTick=0;
try{
  enabled=localStorage.getItem(STORE)==='on';
  const v=Number(localStorage.getItem(VOL));if(Number.isFinite(v)&&v>=0&&v<=.5)volume=v;
  const r=Number(localStorage.getItem(RATE));if(Number.isFinite(r)&&r>=.8&&r<=1.3)rate=r;
}catch{}

const style=document.createElement('style');
style.textContent=`
.ta-audio{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:10000;display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(7,6,4,.9);border:1px solid rgba(202,165,93,.42);border-radius:16px;box-shadow:0 14px 38px rgba(0,0,0,.34);backdrop-filter:blur(14px);color:#ead9b5;font:600 11px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.ta-audio button,.ta-audio select{border:0;background:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit}
.ta-audio button{display:flex;align-items:center;gap:6px;padding:5px 6px;cursor:pointer;border-radius:9px}.ta-audio button:hover{background:rgba(218,180,103,.08)}
.ta-audio button:focus-visible,.ta-audio input:focus-visible,.ta-audio select:focus-visible{outline:2px solid #d9b66f;outline-offset:2px}
.ta-audio-icon{display:grid;place-items:center;width:22px;height:22px;border:1px solid rgba(226,193,126,.45);border-radius:50%;font-size:12px;flex:0 0 auto}
.ta-music-toggle[aria-pressed="true"] .ta-audio-icon,.ta-read-toggle[aria-pressed="true"] .ta-audio-icon{background:rgba(218,180,103,.13);border-color:rgba(226,193,126,.82)}
.ta-audio input[type="range"]{width:68px;accent-color:#d9b66f;cursor:pointer}.ta-audio-sep{width:1px;height:26px;background:rgba(202,165,93,.24)}.ta-read-stop{opacity:.78}
.ta-audio select{padding:5px 3px;cursor:pointer;color:#ead9b5;background:#15110b;border-radius:7px}
.ta-audio-note{position:absolute;right:8px;bottom:calc(100% + 7px);max-width:250px;padding:7px 9px;border:1px solid rgba(202,165,93,.3);border-radius:8px;background:rgba(7,6,4,.95);color:#d9caa9;font:500 10px/1.35 system-ui,sans-serif;letter-spacing:.02em;text-transform:none;opacity:0;pointer-events:none;transition:opacity .18s ease}
.ta-audio[data-blocked="true"] .ta-audio-note{opacity:1}.ta-narrating{outline:1px solid rgba(217,182,111,.55);outline-offset:5px;border-radius:3px;transition:outline-color .2s ease}
@media(max-width:760px){.ta-audio{left:10px;right:10px;bottom:10px;justify-content:center;flex-wrap:wrap;padding:7px 8px}.ta-audio input[type="range"]{width:56px}.ta-audio-label{display:none}.ta-audio-sep{height:22px}}
`;
document.head.appendChild(style);

const audio=document.createElement('audio');
audio.src=source;audio.loop=true;audio.preload='metadata';audio.volume=volume;audio.setAttribute('playsinline','');document.body.appendChild(audio);

const canSpeak='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
const box=document.createElement('div');box.className='ta-audio';box.dataset.blocked='false';
box.innerHTML=`
<button type="button" class="ta-music-toggle" aria-label="Play background music" aria-pressed="false"><span class="ta-audio-icon">♫</span><span class="ta-audio-label ta-music-status">Music off</span></button>
<input class="ta-music-volume" type="range" min="0" max="0.5" step="0.01" value="${volume}" aria-label="Background music volume">
${canSpeak?`<span class="ta-audio-sep" aria-hidden="true"></span>
<button type="button" class="ta-read-toggle" aria-label="Read page aloud" aria-pressed="false"><span class="ta-audio-icon">▶</span><span class="ta-audio-label ta-read-status">Read aloud</span></button>
<button type="button" class="ta-read-stop" aria-label="Stop narration" title="Stop narration"><span aria-hidden="true">■</span></button>
<select class="ta-read-rate" aria-label="Narration speed"><option value="0.8">0.8×</option><option value="0.9">0.9×</option><option value="1">1.0×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option></select>`:''}
<span class="ta-audio-note" role="status">Select Music once to allow audio playback in this browser.</span>`;
document.body.appendChild(box);

const musicToggle=box.querySelector('.ta-music-toggle'),musicStatus=box.querySelector('.ta-music-status'),musicSlider=box.querySelector('.ta-music-volume');
const narration={speaking:false,paused:false,items:[],index:0,active:null,token:0,timer:0};
const musicUI=(playing,blocked=false)=>{box.dataset.blocked=String(blocked);musicToggle.setAttribute('aria-pressed',String(playing));musicToggle.setAttribute('aria-label',playing?'Pause background music':'Play background music');if(musicStatus)musicStatus.textContent=playing?'Music on':'Music off'};
const remember=()=>{try{if(Number.isFinite(audio.currentTime))sessionStorage.setItem(TIME,String(audio.currentTime))}catch{}};
const restore=()=>{try{const t=Number(sessionStorage.getItem(TIME));if(Number.isFinite(t)&&t>0&&audio.duration&&t<audio.duration-1)audio.currentTime=t}catch{}};
const setEnabled=v=>{enabled=v;try{localStorage.setItem(STORE,v?'on':'off')}catch{}};
const baseMusicVolume=()=>Math.min(.5,Math.max(0,volume));
const duck=()=>{if(!audio.paused)audio.volume=Math.min(NARRATION_MUSIC_MAX,Math.max(NARRATION_MUSIC_MIN,baseMusicVolume()*NARRATION_MUSIC_FACTOR))};
const unduck=()=>{audio.volume=baseMusicVolume()};
const playMusic=async(user=false)=>{if(user)setEnabled(true);try{await audio.play();musicUI(true,false)}catch{musicUI(false,true)}};
const pauseMusic=()=>{audio.pause();setEnabled(false);remember();musicUI(false,false)};
musicToggle.addEventListener('click',()=>audio.paused?playMusic(true):pauseMusic());
musicSlider.addEventListener('input',()=>{volume=Math.min(.5,Math.max(0,Number(musicSlider.value)||0));if(!narration.speaking||narration.paused)audio.volume=volume;else duck();try{localStorage.setItem(VOL,String(volume))}catch{}});
audio.addEventListener('loadedmetadata',()=>{restore();if(enabled)playMusic(false)},{once:true});
audio.addEventListener('play',()=>{musicUI(true,false);if(narration.speaking&&!narration.paused)duck()});
audio.addEventListener('error',()=>{musicToggle.disabled=true;musicSlider.disabled=true;musicUI(false,false)});
audio.addEventListener('timeupdate',()=>{const n=Date.now();if(n-saveTick>2500){saveTick=n;remember()}});window.addEventListener('pagehide',remember);

if(canSpeak){
  const synth=window.speechSynthesis;
  const readToggle=box.querySelector('.ta-read-toggle'),readStatus=box.querySelector('.ta-read-status'),readStop=box.querySelector('.ta-read-stop'),readRate=box.querySelector('.ta-read-rate');
  readRate.value=String(rate);
  const visible=el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0&&!el.closest('[aria-hidden="true"],script,style,noscript')};
  const clean=t=>String(t||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
  const splitText=t=>{t=clean(t);if(!t)return[];if('Segmenter'in Intl){try{return[...new Intl.Segmenter(document.documentElement.lang||'en',{granularity:'sentence'}).segment(t)].map(x=>clean(x.segment)).filter(Boolean)}catch{}}return(t.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[t]).map(clean).filter(Boolean)};
  const collect=()=>{const main=document.querySelector('main#main')||document.querySelector('main');if(!main)return[];const els=[...main.querySelectorAll('h1,h2,h3,h4,p,li,dt,dd,figcaption,th,td')].filter(visible).filter(el=>!el.closest('.ta-audio,[data-no-narration]'));const seen=new Set(),out=[];for(const el of els){if(el.matches('li')&&el.querySelector(':scope > ul,:scope > ol'))continue;const text=clean(el.innerText||el.textContent);if(!text||text.length<2)continue;const key=text.toLowerCase();if(seen.has(key))continue;seen.add(key);for(const sentence of splitText(text))out.push({el,text:sentence})}return out};
  const chooseVoice=()=>{const voices=synth.getVoices();if(!voices.length)return null;const lang=(document.documentElement.lang||'en').toLowerCase();const score=v=>{const l=(v.lang||'').toLowerCase(),n=(v.name||'').toLowerCase();let s=0;if(l===lang)s+=8;else if(l.startsWith(lang.split('-')[0]))s+=6;if(/natural|enhanced|premium|neural/.test(n))s+=6;if(/google|microsoft|apple/.test(n))s+=2;if(/en-us|en-gb|english/.test(`${n} ${l}`))s+=1;return s};return[...voices].sort((a,b)=>score(b)-score(a))[0]||null};
  const clearHighlight=()=>{if(narration.active){narration.active.classList.remove('ta-narrating');narration.active=null}};
  const clearNarrationTimer=()=>{if(narration.timer){clearTimeout(narration.timer);narration.timer=0}};
  const readUI=()=>{readToggle.setAttribute('aria-pressed',String(narration.speaking&&!narration.paused));readToggle.setAttribute('aria-label',narration.speaking?(narration.paused?'Resume narration':'Pause narration'):'Read page aloud');readToggle.querySelector('.ta-audio-icon').textContent=narration.speaking&&!narration.paused?'Ⅱ':'▶';readStatus.textContent=narration.speaking?(narration.paused?'Resume':'Pause'):'Read aloud'};
  const finish=()=>{clearNarrationTimer();narration.speaking=false;narration.paused=false;narration.items=[];narration.index=0;clearHighlight();unduck();readUI()};
  const speakNext=token=>{if(token!==narration.token||!narration.speaking)return;if(narration.index>=narration.items.length){finish();return}const item=narration.items[narration.index++];clearHighlight();narration.active=item.el;item.el.classList.add('ta-narrating');const u=new SpeechSynthesisUtterance(item.text);u.lang=document.documentElement.lang||'en';u.rate=rate;u.pitch=NARRATION_PITCH;u.volume=1;const voice=chooseVoice();if(voice)u.voice=voice;u.onstart=()=>{if(token===narration.token){duck();readUI()}};u.onend=()=>{if(token===narration.token&&narration.speaking&&!narration.paused){clearNarrationTimer();narration.timer=setTimeout(()=>{narration.timer=0;speakNext(token)},NARRATION_PAUSE_MS)}};u.onerror=e=>{if(token!==narration.token)return;if(e.error==='canceled'||e.error==='interrupted')return;clearNarrationTimer();narration.timer=setTimeout(()=>{narration.timer=0;speakNext(token)},NARRATION_PAUSE_MS)};synth.speak(u)};
  const start=()=>{clearNarrationTimer();synth.cancel();narration.token++;narration.items=collect();narration.index=0;narration.paused=false;if(!narration.items.length){finish();return}narration.speaking=true;readUI();speakNext(narration.token)};
  const stop=()=>{narration.token++;clearNarrationTimer();synth.cancel();finish()};
  const pause=()=>{if(!narration.speaking||narration.paused)return;clearNarrationTimer();synth.pause();narration.paused=true;unduck();readUI()};
  const resume=()=>{if(!narration.speaking||!narration.paused)return;narration.paused=false;duck();synth.resume();readUI()};
  readToggle.addEventListener('click',()=>{if(!narration.speaking)start();else if(narration.paused)resume();else pause()});readStop.addEventListener('click',stop);
  readRate.addEventListener('change',()=>{rate=Math.min(1.3,Math.max(.8,Number(readRate.value)||.9));try{localStorage.setItem(RATE,String(rate))}catch{}if(narration.speaking)start()});
  window.addEventListener('pagehide',()=>{narration.token++;clearNarrationTimer();synth.cancel();clearHighlight();unduck()});
}
})();
