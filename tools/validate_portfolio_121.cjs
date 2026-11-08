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
assert.equal(ledger.inventory.totalGitHubRepositories,126);
assert.equal(ledger.inventory.privateRepositories,124);
assert.equal(ledger.inventory.distinctPrivateIPAssets,123);
assert.equal(ledger.inventory.publishedIndividualAskingReferences,119);
assert.equal(assets.length,123);
assert.equal(mapping.projectCount,123);
assert.equal(mapping.projects.length,123);
assert.equal(buyers.projects.length,119);
assert.equal(pricing.projects.length,119);
assert.equal(reassessment.assessments.length,123);
const sourceReviewed=reassessment.assessments.filter(x=>x.technicalReevaluationStatus?.startsWith('SOURCE_DESK_'));
const technicalReviewPending=reassessment.assessments.filter(x=>x.technicalReevaluationStatus==='PENDING_PROJECT_SPECIFIC_SOURCE_REVIEW');
assert.equal(sourceReviewed.length,reassessment.summary.projectSpecificSourceDeskReviews);
assert.equal(technicalReviewPending.length,reassessment.summary.projectsAwaitingProjectSpecificTechnicalDeskReview);
assert.equal(sourceReviewed.length+technicalReviewPending.length,123);
assert.equal(sourceReviewed.length,123); // document-only review progress, NOT runtime acceptance
assert.equal(technicalReviewPending.length,0);
assert.equal(reassessment.summary.freshFunctionalSourceReexecutions,0);assert.equal(reassessment.summary.identityPass,121);assert.equal(reassessment.summary.identityProvisional,2);
assert.equal(reassessment.summary.fullCommercialRequalifications,0);
assert(sourceReviewed.every(x=>/^[0-9a-f]{40}$/.test(x.sourceDocumentSha)), 'Reviewed sources must pin a 40-character README blob hash');
assert(sourceReviewed.every(x=>typeof x.developmentEvidence==='string'&&x.developmentEvidence.length>20&&typeof x.currentLimitations==='string'&&x.currentLimitations.length>20),'Reviewed source records must carry evidence and remaining limits');
const reviewedDisplaySlugs=sourceReviewed.map(x=>{
 const a=assets.find(a=>a.id===x.id);
 assert(a,'Reviewed asset missing from identity ledger: '+x.id);
 const segments=new URL(a.displayUrl).pathname.split('/').filter(Boolean);
 assert(segments.at(-3)==='displays'&&segments.at(-2)==='products','Reviewed asset has an invalid display URL: '+x.id);
 return segments.at(-1);
});
assert.equal(new Set(reviewedDisplaySlugs).size,123);
for(const slug of reviewedDisplaySlugs){
 const p='displays/products/'+slug+'/index.html';
 assert(exists(p),'Reviewed display not found: '+slug);
 assert(read(p).includes('data-source-requalification-20261107="documentary-review"'),
        'Missing source qualification disclaimer on display '+slug);
}


assert.equal(new Set(assets.map(x=>x.id)).size,123);
assert.equal(new Set(assets.map(x=>x.alias.toLocaleLowerCase())).size,123);
assert.equal(new Set(assets.map(x=>x.slug)).size,123);
const mById=new Map(mapping.projects.map(x=>[x.ref,x]));
const bById=new Map(buyers.projects.map(x=>[x.ref,x]));
const eById=new Map(reassessment.assessments.map(x=>[x.id,x]));
assert.equal(mById.size,123);
assert.equal(eById.size,123);
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
 assert.equal(e.sourceIdentity,i<121?'PASS':'PORTFOLIO_PROVISIONAL');
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
assert.equal(csv.length,124); // one header, 123 rows
for(const a of assets)assert(csv.some(line=>line.startsWith(a.id+',')),a.id+' absent from identity CSV');
const display=read('displays/index.html'),register=read('portfolio-register.html'),matrix=read('portfolio-evaluation.html'),hub=read('assets/im.js');
assert.equal((display.match(/class="asset-card"/g)||[]).length,123);
assert.equal((register.match(/<tr data-search=/g)||[]).length,123);
assert.equal((matrix.match(/<tr data-filter=/g)||[]).length,123);
assert(matrix.includes('123 reviewed')&&matrix.includes('0 desk reviews pending'),'Matrix must disclose all 123 desk reviews and continued independent acceptance gaps');
assert(!matrix.includes('<span class="tag">Review required</span>'),'All 123 source-document review statuses must be individual');
assert(hub.includes('portfolio-register.html')&&hub.includes('portfolio-evaluation.html'));
assert(hub.includes('portfolio-reassessment-20261107.json')&&hub.includes('validateReassessment(rows[6])')&&hub.includes('projectRequalification(a,d)'),'Dynamic dossiers must show the current review register');
assert(read('index.html').includes('showroom32-financial-20261108'));
new Function(hub);new Function(read('displays/assets/exhibition.js')); // parse only
assert.equal(reassessment.summary.prototypeLabels+reassessment.summary.developedSoftwareLabel+reassessment.summary.researchSoftwareLabels,123);
assert.equal(ledger.assets.filter(x=>x.identityVerified===true).length,121);
assert.equal(ledger.assets.filter(x=>x.identityVerified===false).length,2);
assert(read('assets/im.js').includes('portfolio-pricing-review.html'));
const financial=json('assets/pricing-review-20261108.json');
assert.equal(financial.projects.length,123);
assert.equal(financial.coverage.FULL_SCOPED_BUDGET,22);
assert.equal(financial.coverage.PARTIAL_SCOPED_BUDGET,39);
assert.equal(financial.coverage.LEGACY_ESTIMATE_WITHOUT_WORK_BREAKDOWN,58);
assert.equal(financial.coverage.NOT_QUOTED,4);
assert.equal(pricing.displayCurrency.rate,1.1165);
assert.equal(pricing.displayCurrency.date,'2026-11-06');
assert.equal((read('portfolio-pricing-review.html').match(/<tr data-search=/g)||[]).length,123);
for(const a of pricing.projects){for(const [key,eur] of Object.entries(a.values)){assert.equal(a.valuesUSD[key.replace(/EUR$/,'USD')],Math.floor((eur*11165+5000)/10000));}}
const publicLedger=JSON.stringify(ledger);
assert(!publicLedger.includes('Rayford-Aquirre-Literary-Archive'));
assert(!publicLedger.includes('Strategic-Software-IP-Acquisition-Portfolio'));
console.log(JSON.stringify({status:'PASS',scope:'static identity/path/source-code syntax only',assets:123,existingFinancialRecords:119,newUnpriced:4,privacy:'PASS',liveBrowser:'NOT_RUN',githubActions:'NOT_RUN'},null,2));
