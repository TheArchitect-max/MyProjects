import fs from 'node:fs';
import path from 'node:path';
const assert=(ok,message)=>{if(!ok)throw Error(message)};
const read=p=>fs.readFileSync(p,'utf8');
const assets=fs.readdirSync('assets');
const approved=new Set(['portfolio-structure.json','external-market-evidence.json','im4.css','im-data.json','im.css','descriptions.json','economic.js','replacement-cost-scope.json','im.js','intake-assets.json','asset-economic-valuations.csv','valuation-model.json','recreation-costs.json','economic-methodology.json','commercial-context.json','development-status.json']);
for(const name of assets)assert(approved.has(name),'Unreviewed public asset payload: '+name);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='.git').flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const all=walk('.');
for(const p of all){assert(!/\.(?:ipynb|pt|pth|onnx|safetensors|ckpt|pkl|npz|npy|pem|key|zip|tar|gz)$/i.test(p),'Restricted or unreviewed material in website repository: '+p);const text=read(p);assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}/.test(text),'Credential-shaped content: '+p)}
const contexts=JSON.parse(read('assets/commercial-context.json')).families;
const families=JSON.parse(read('assets/portfolio-structure.json')).families;
assert(Object.keys(contexts).length===12&&families.every(f=>contexts[f.id]),'12 reviewed commercial family contexts');
const profilePaths=all.filter(p=>p.startsWith('projects/')&&p.endsWith('/index.html'));
assert(profilePaths.length===79,'79 profiles');
for(const p of profilePaths){const s=read(p);assert(s.includes('public-buyer-context'),'Buyer context missing: '+p);assert(s.includes('These are not verified customer deployments or guaranteed outcomes.'),'Hypothesis label missing: '+p);assert(!/href="https:\/\/github.com\/TheArchitect-max\/(?!MyProjects\/issues\/)/.test(s),'Underlying asset repository link: '+p);assert(s.includes('assurance.html'),'Disclosure link missing: '+p)}
for(const route of ['commercialization.html','assurance.html','transfer.html'])assert(!/http-equiv="refresh"|content="noindex"/.test(read(route)),'Buyer guide still redirects or is noindex: '+route);
assert(read('assets/valuation-model.json').includes('Superseded historical'),'Old scenario model unlabelled');
assert(!fs.existsSync('.github/workflows'),'No custom Actions workflow');
console.log('Public-scope checks passed: curated public payloads, 79 commercial profiles, no restricted file types or credential patterns. This automated gate supplements editorial review; it is not a legal or security certification.');
