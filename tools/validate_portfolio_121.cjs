#!/usr/bin/env node
'use strict';
/** Pure local static acceptance; no network, no GitHub Actions runtime. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const json=p=>JSON.parse(read(p));
const exists=p=>fs.existsSync(path.join(ROOT,p));
const ledger=json('assets/portfolio-identity-ledger.json');
const reassessment=json('assets/portfolio-reassessment-20261107.json');
const mapping=json('displays/project-map.json');
const buyers=json('assets/buyer-catalogue.json');
const pricing=json('assets/pricing-catalogue.json');
const assets=ledger.assets;
assert.equal(ledger.inventory.totalGitHubRepositories,125);
assert.equal(ledger.inventory.privateRepositories,123);
assert.equal(ledger.inventory.distinctPrivateIPAssets,121);
assert.equal(ledger.inventory.publishedIndividualAskingReferences,119);
assert.equal(assets.length,121);
assert.equal(mapping.projectCount,121);
assert.equal(mapping.projects.length,121);
assert.equal(buyers.projects.length,119);
assert.equal(pricing.projects.length,119);
assert.equal(reassessment.assessments.length,121);
const sourceReviewed=reassessment.assessments.filter(x=>x.technicalReevaluationStatus?.startsWith('SOURCE_DESK_'));
const technicalReviewPending=reassessment.assessments.filter(x=>x.technicalReevaluationStatus==='PENDING_PROJECT_SPECIFIC_SOURCE_REVIEW');
assert.equal(sourceReviewed.length,reassessment.summary.projectSpecificSourceDeskReviews);
assert.equal(technicalReviewPending.length,reassessment.summary.projectsAwaitingProjectSpecificTechnicalDeskReview);
assert.equal(sourceReviewed.length+technicalReviewPending.length,121);
assert.equal(sourceReviewed.length,24); // documentary review progress, NOT runtime qualification
assert.equal(technicalReviewPending.length,97);
assert.equal(reassessment.summary.freshFunctionalSourceReexecutions,0);
assert.equal(reassessment.summary.fullCommercialRequalifications,0);
const reviewedHistoricalDisplaySlugs=[
 'adaptive-network-resilience-intelligence-platform',
 'stabilitymesh',
 'dmt-laser-phenomenology-engine',
 'quantum-cryptanalysis-engineering-platform',
 'adaptive-audio-midi-transcription-studio',
 'chess-strategic-intelligence-platform',
 'fundamental-reality-research-platform',
 'cosmological-structure-and-expansion-research-platform',
 'universal-independent-reasoning-framework',
 'foundational-existence-research-framework',
 'modular-aerospace-research-platform',
 'evidence-intelligence-operations-platform',
 'custody-integrity-assurance-platform',
 'generative-media-production-platform',
 'maastricht-digital-twin', // TA-IP-087 legacy compatibility URL; canonical renamed title
 'launch-cislunar-transportation-engineering-platform',
 'universal-video-intelligence-platform',
 'manuscript-integrity-publishing-platform',
 'visual-effects-spatial-computing-platform',
 'the-stone-universe-research-framework'
];
for (const slug of reviewedHistoricalDisplaySlugs)
 assert(read('displays/products/'+slug+'/index.html').includes('data-source-requalification-20261107'),
        'Missing reviewed source limitation on display '+slug);


assert.equal(new Set(assets.map(x=>x.id)).size,121);
assert.equal(new Set(assets.map(x=>x.alias.toLocaleLowerCase())).size,121);
assert.equal(new Set(assets.map(x=>x.slug)).size,121);
const mById=new Map(mapping.projects.map(x=>[x.ref,x]));
const bById=new Map(buyers.projects.map(x=>[x.ref,x]));
const eById=new Map(reassessment.assessments.map(x=>[x.id,x]));
assert.equal(mById.size,121);
assert.equal(eById.size,121);
for(let i=0;i<assets.length;i++){
 const a=assets[i];
 assert.equal(a.id,'TA-IP-'+String(i+1).padStart(3,'0'));
 const m=mById.get(a.id);const e=eById.get(a.id);
 assert(m&&e,a.id+' missing mapping or assessment');
 assert.equal(m.title,a.title);assert.equal(m.referenceName,a.alias);
 assert.equal(m.slug,a.slug);
 assert.equal(m.url,a.displayUrl);
 assert.equal(m.profileUrl,a.profileUrl);
 assert.equal(e.alias,a.alias);
 assert.equal(e.sourceIdentity,'PASS');
 assert.equal(e.functionalReexecution,'NOT_RUN');
 assert.equal(e.fullAcquisitionReadiness,'NOT_DEMONSTRATED');
 assert(exists('projects/'+a.slug+'/index.html'),a.id+' profile absent');
 assert(exists('displays/products/'+a.slug+'/index.html'),a.id+' display absent');
 assert(exists('displays/products/'+a.slug+'/product-brief.md'),a.id+' brief absent');
 if(i<119){
  const b=bById.get(a.id);assert(b&&b.referenceName===a.alias);
  assert(exists('displays/products/'+a.slug+'/factsheet.pdf'));
  assert.equal(e.commercialPricing,'DATED_SELLER_REFERENCE_ONLY');
 } else {
  assert.equal(m.factsheetUrl,null);
  assert.equal(m.priceReferenceStatus,'NOT_QUOTED');
  assert.equal(e.commercialPricing,'NOT_QUOTED');
  assert(!bById.has(a.id));
 }
}
const csv=read('displays/identity-register.csv').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
assert.equal(csv.length,122); // one header, 121 rows
for(const a of assets)assert(csv.some(line=>line.startsWith(a.id+',')),a.id+' absent from identity CSV');
const display=read('displays/index.html'),register=read('portfolio-register.html'),matrix=read('portfolio-evaluation.html'),hub=read('assets/im.js');
assert.equal((display.match(/class="asset-card"/g)||[]).length,121);
assert.equal((register.match(/<tr data-search=/g)||[]).length,121);
assert.equal((matrix.match(/<tr data-filter=/g)||[]).length,121);
assert(hub.includes('portfolio-register.html')&&hub.includes('portfolio-evaluation.html'));
assert(read('index.html').includes('showroom30-portfolio-20261107'));
new Function(hub);new Function(read('displays/assets/exhibition.js')); // parse only
assert.equal(reassessment.summary.prototypeLabels+reassessment.summary.developedSoftwareLabel+reassessment.summary.researchSoftwareLabels,121);
const publicLedger=JSON.stringify(ledger);
assert(!publicLedger.includes('Rayford-Aquirre-Literary-Archive'));
assert(!publicLedger.includes('Strategic-Software-IP-Acquisition-Portfolio'));
console.log(JSON.stringify({status:'PASS',scope:'static identity/path/source-code syntax only',assets:121,existingFinancialRecords:119,newUnpriced:2,privacy:'PASS',liveBrowser:'NOT_RUN',githubActions:'NOT_RUN'},null,2));
