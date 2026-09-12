import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const approved=new Set(['im.css','im4.css','review.css','portfolio.js','commercial-context.json','reevaluation.json','portfolio-structure.json']);
for(const name of fs.readdirSync('assets'))assert.ok(approved.has(name),'Unreviewed active payload '+name);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='.git').flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const all=walk('.');
for(const p of all){assert.ok(!/\.(?:ipynb|pt|pth|onnx|safetensors|ckpt|pkl|npz|npy|pem|key|zip|tar|gz)$/i.test(p),'Unreviewed binary or restricted material '+p);const s=fs.readFileSync(p,'utf8');assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}/.test(s),'Credential-shaped content '+p);if(p.endsWith('.html')&&!p.startsWith('archive/'))assert.ok(!/href="https:\/\/github.com\/TheArchitect-max\/(?!MyProjects(?:\/|"))/.test(s),'Underlying project link '+p);}
const d=JSON.parse(fs.readFileSync('assets/reevaluation.json','utf8'));const allowed=['commercialUse','confidence','currentValueEUR','description','development','developmentClass','developmentLabel','evidenceBasis','family','lastRepositoryActivity','name','previous','qualificationGate','recommendedAskEUR','ref','reviewedOn','route','sector','slug','valuationPath','valuationStatus'].sort();
for(const a of d.assets)assert.deepEqual(Object.keys(a).sort(),allowed,'Approved public assessment fields');
assert.ok(!/\b[a-f0-9]{40,64}\b|\.py\b|\.ipynb\b|BEGIN PRIVATE/.test(JSON.stringify(d)),'No source identities or implementation paths in public assessment');
assert.ok(!fs.existsSync('.github/workflows'),'No custom Actions workflows');assert.ok(fs.readFileSync('_config.yml','utf8').includes('  - archive'),'Historical authoring files excluded from Pages build');
console.log('Public-scope checks passed: approved fields, no raw source paths or hashes in current assessment, no new restricted payloads or custom workflows.');
