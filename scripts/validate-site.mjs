import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {selectProjects} from '../assets/portfolio.js';
const read=p=>fs.readFileSync(p,'utf8');
const d=JSON.parse(read('assets/reevaluation.json'));
const urls=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,93);assert.equal(new Set(urls).size,93);
const base='https://thearchitect-max.github.io/MyProjects/';
for(const url of urls){const route=url.slice(base.length),p=route.endsWith('/')?route+'index.html':route||'index.html',html=read(p);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${p}: one h1`);assert.equal((html.match(/<main[ >]/g)||[]).length,1,`${p}: one main`);assert.ok(html.includes(`rel="canonical" href="${url}"`));assert.ok(html.includes('href="#main"'));assert.ok(html.includes('aria-label="Primary navigation"'));assert.ok(html.includes('reevaluation.html'));assert.ok(!/assets\/(?:im\.js|economic\.js)|archive\/im24/.test(html),'No historical runtime or data');for(const m of html.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)){let target=m[1].replaceAll('&amp;','&');if(/^(?:https?:|mailto:|data:)/.test(target))continue;assert.ok(fs.existsSync(path.resolve(path.dirname(p),target)),`${p}: missing ${target}`);}if(p.startsWith('projects/')){assert.ok(html.includes('Current monetary conclusion: not established.'));assert.ok(html.includes('Project-specific qualification'));assert.ok(html.includes('Proprietary implementation material is outside this public profile.'));}}
assert.equal((read('portfolio.html').match(/class="panel project-record"/g)||[]).length,81,'81 static profiles discoverable');
assert.equal(selectProjects(d.assets,{query:'TA-INTAKE-001'}).length,1);assert.equal(selectProjects(d.assets,{query:'  cardiosignal  '})[0].ref,'TA-IP-080');assert.equal(selectProjects(d.assets,{query:'no-match-zzzzz'}).length,0);assert.equal(selectProjects(d.assets,{stage:'R'}).length,41);assert.equal(selectProjects(d.assets,{stage:'U'})[0].ref,'TA-IP-006');
const families=JSON.parse(read('assets/portfolio-structure.json')).families;
for(const f of families){const r=selectProjects(d.assets,{family:f.id});assert.equal(r.length,f.assets.length);for(const stage of ['S','F','R','D','U'])assert.deepEqual(selectProjects(d.assets,{family:f.id,stage}).map(x=>x.ref).sort(),d.assets.filter(x=>x.family===f.id&&x.developmentClass===stage).map(x=>x.ref).sort());}
assert.equal(new Set(families.flatMap(f=>f.assets)).size,81);
const sorted=selectProjects(d.assets,{sort:'updated'});assert.ok(sorted.every((a,i)=>i===0||sorted[i-1].lastRepositoryActivity>=a.lastRepositoryActivity));assert.equal(d.assets.length,81,'Filtering does not mutate source data');
console.log('Validated 93 pages, local links, metadata, all static records, search, sorting and every family/class filter combination.');
// Exercise actual event wiring and hidden-state updates against the static record contract.
const {initPortfolio}=await import('../assets/portfolio.js');
const nodes=new Map();
const field=(value)=>({value,handlers:{},options:[],addEventListener(type,fn){this.handlers[type]=fn;},focus(){this.focused=true;}});
for(const [id,value]of[['search',''],['family','all'],['stage','all'],['sort','name'],['reset-filters','']])nodes.set(id,field(value));
nodes.get('family').options=[{value:'all'},...families.map(f=>({value:f.id}))];
const records=d.assets.map(a=>({dataset:{project:JSON.stringify(a)},hidden:false}));
const ordered=records.slice();
nodes.set('project-list',{querySelectorAll:()=>records,appendChild(e){ordered.splice(ordered.indexOf(e),1);ordered.push(e);}});
nodes.set('result-count',{textContent:''});nodes.set('no-results',{hidden:true});
initPortfolio({getElementById:id=>nodes.get(id)},{search:'?family=aerospace-mobility'});
assert.equal(records.filter(r=>!r.hidden).length,7,'Initial family URL covers new project');
nodes.get('reset-filters').handlers.click();assert.equal(records.filter(r=>!r.hidden).length,81);
nodes.get('search').value='TA-INTAKE-002';nodes.get('search').handlers.input();assert.equal(records.filter(r=>!r.hidden).length,1);assert.equal(nodes.get('result-count').textContent,'1 of 81 project assessments');
nodes.get('search').value='missing-zzzz';nodes.get('search').handlers.input();assert.equal(nodes.get('no-results').hidden,false);
nodes.get('reset-filters').handlers.click();assert.equal(nodes.get('no-results').hidden,true);assert.equal(nodes.get('search').focused,true);
for(const p of fs.readdirSync('assets').filter(p=>p.endsWith('.css'))){for(const m of read('assets/'+p).matchAll(/url\(["']?([^)'"\s]+)/g)){if(!/^(data:|https?:)/.test(m[1]))assert.ok(fs.existsSync(path.resolve('assets',m[1].split('?')[0])),'CSS dependency '+m[1]);}}
console.log('Validated catalogue event wiring, URL filters, reset/empty states and local CSS dependencies.');
