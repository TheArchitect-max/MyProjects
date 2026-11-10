#!/usr/bin/env node
'use strict';
// Current individual source/price coverage. Historical sessions are immutable snapshots.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),math=require('../assets/pricing-math.js');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(read(f));
const ledger=json('assets/portfolio-identity-ledger.json'),review=json('assets/portfolio-reassessment-20261107.json'),buyers=json('assets/buyer-catalogue.json'),pricing=json('assets/pricing-catalogue.json'),financial=json('assets/pricing-review-20261108.json'),mapping=json('displays/project-map.json');
const expected=Array.from({length:123},(_,i)=>'TA-IP-'+String(i+1).padStart(3,'0'));
for(const [rows,key] of [[ledger.assets,'id'],[review.assessments,'id'],[buyers.projects,'ref'],[pricing.projects,'ref'],[financial.projects,'id'],[mapping.projects,'ref']])assert.deepEqual(rows.map(x=>x[key]).sort(),expected);
assert.equal(new Set(ledger.assets.map(x=>x.alias.toLowerCase())).size,123);assert.equal(new Set(ledger.assets.map(x=>x.slug)).size,123);
assert.equal(ledger.inventory.totalGitHubRepositories,126);assert.equal(ledger.inventory.privateRepositories,124);assert.equal(ledger.inventory.distinctPrivateIPAssets,123);assert.equal(ledger.inventory.publishedIndividualAskingReferences,123);assert.equal(ledger.inventory.newUnpricedAssets,0);
const decisions={};for(const a of buyers.projects){
 const r=review.assessments.find(x=>x.id===a.ref),p=pricing.projects.find(x=>x.ref===a.ref),f=financial.projects.find(x=>x.id===a.ref),l=ledger.assets.find(x=>x.id===a.ref),m=mapping.projects.find(x=>x.ref===a.ref);
 assert.equal(l.title,a.title);assert.equal(l.alias,a.referenceName);assert.equal(m.url,a.displayUrl);assert.equal(m.factsheetUrl,a.factsheetUrl);assert.equal(m.priceReferenceStatus,'DATED_SELLER_REFERENCE');
 for(const k of ['sourceDocumentSha','sourceMainSha','sourceTreeSha'])assert(/^[a-f0-9]{40}$/.test(r[k]),a.ref+' missing immutable source '+k);
 assert.equal(r.checkedOn,'2026-11-10');assert(Number.isInteger(r.sourceFileCount)&&r.sourceFileCount>0);assert(Number.isInteger(r.openCandidateCount)&&r.openCandidateCount>=0);assert.equal(r.functionalReexecution,'NOT_RUN');assert.equal(r.fullAcquisitionReadiness,'NOT_DEMONSTRATED');assert(r.technicalReevaluationStatus.startsWith('SOURCE_DESK_'));
 assert(r.developmentEvidence.length>20&&r.currentLimitations.length>20);assert.equal(r.sourceIdentity,Number(a.ref.slice(-3))<=121?'PASS':'PORTFOLIO_PROVISIONAL');
 assert.equal(a.askingReferenceEUR,p.values.sellerAskEUR);assert.equal(f.askingReferenceEUR,a.askingReferenceEUR);assert.equal(r.currentAskingReferenceEUR,a.askingReferenceEUR);assert.equal(r.askingReferenceChangeEUR,a.askingReferenceEUR-r.previousAskingReferenceEUR);
 if(r.priceDecision==='RETAINED_NO_AUTOMATIC_UPLIFT')assert.equal(r.askingReferenceChangeEUR,0);
 else {const b=p.costBudgets.at(-1);assert.equal(b.economicAssessmentAt,'2026-11-10');assert.equal(r.askingReferenceChangeEUR,Math.floor(b.adoptedRecreationIncrementEUR*.30/500)*500);assert(b.workPackages.length>0);}
 decisions[r.priceDecision]=(decisions[r.priceDecision]||0)+1;
 for(const name of ['index.html','factsheet.pdf','product-brief.md'])assert(fs.existsSync(path.join(root,'displays/products',a.slug,name)),a.ref+' missing '+name);
 const display=read('displays/products/'+a.slug+'/index.html');assert(display.includes('data-source-requalification-20261107="documentary-review"'));assert(display.includes('EUR 1 = USD 1.1214; ECB 2026-11-10'));assert(!display.includes('EUR 1 = USD 1.1216'));
}
assert.deepEqual(decisions,{RETAINED_NO_AUTOMATIC_UPLIFT:107,SCOPED_INCREMENT:12,INITIAL_SCOPED_REFERENCE:4});
assert.equal(new Set(review.assessments.map(x=>x.sourceMainSha)).size,123); // distinct repository baselines
assert.equal(review.summary.projectSpecificSourceDeskReviews,123);assert.equal(review.summary.freshFunctionalSourceReexecutions,0);assert.equal(review.summary.fullCommercialRequalifications,0);assert.equal(ledger.assets.filter(x=>x.identityVerified).length,121);
assert.equal(math.verifyCatalogue(pricing).status,'PASS');assert.equal(pricing.displayCurrency.rate,1.1214);assert.equal(pricing.displayCurrency.date,'2026-11-10');assert.deepEqual(financial.coverage,pricing.methodology.reassessment.budgetCoverage);
for(const [page,pattern] of [['displays/index.html',/class="asset-card"/g],['portfolio-register.html',/<tr data-search=/g],['portfolio-evaluation.html',/<tr data-filter=/g],['portfolio-pricing-review.html',/<tr data-search=/g]])assert.equal((read(page).match(pattern)||[]).length,123);
for(const file of ['buyer-catalogue.json','buyer-dossiers.json','pricing-catalogue.json','evaluation-sources.json','calculation-validation.json'])assert.equal(read('assets/'+file),read('displays/assets/'+file));
assert(read('index.html').includes('showroom35-projects-20261110'));new Function(read('assets/im.js'));new Function(read('displays/assets/exhibition.js'));
// Older source/price sessions must reconcile to the preceding amounts, not overwrite the new assessment.
for(const phase of ['S02','S03','S04'])for(const h of json('assets/source-price-session-20261108-'+phase+'.json').projects){const r=review.assessments.find(x=>x.id===h.assetId);assert.equal(h.datedSellerAskEUR,r.previousAskingReferenceEUR);}
console.log(JSON.stringify({status:'PASS',assets:123,decisions,individualSourcePins:123,privateSourceReexecutions:0,marketValueEstablished:false},null,2));
