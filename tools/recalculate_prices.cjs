#!/usr/bin/env node
'use strict';
// Recompute derived scenarios and display currency; never invent asking inputs.
const fs=require('node:fs'),path=require('node:path'),math=require('../assets/pricing-math.js');
const root=path.resolve(__dirname,'..'),file=path.join(root,'assets/pricing-catalogue.json');
const p=JSON.parse(fs.readFileSync(file,'utf8'));
for(const a of p.projects){
 Object.assign(a.values,math.calculate(a,p.methodology.factors).values);
 a.valuesUSD=Object.fromEntries(math.FIELDS.map(k=>[k.replace(/EUR$/,'USD'),math.quoteEUR(a.values[k],p.displayCurrency)]));
 const f=a.futureReference;
 if(Number.isSafeInteger(f.milestoneConditionedEconomicReferenceEUR)){
  f.milestoneConditionedEconomicReferenceEUR=math.calculate(a,p.methodology.factors,f.targetStage).values.triangulatedEconomicReferenceEUR;
  f.sensitivityDeltaEUR=f.milestoneConditionedEconomicReferenceEUR-a.values.triangulatedEconomicReferenceEUR;
  f.milestoneConditionedEconomicReferenceUSD=math.quoteEUR(f.milestoneConditionedEconomicReferenceEUR,p.displayCurrency);
  f.sensitivityDeltaUSD=math.quoteEUR(f.sensitivityDeltaEUR,p.displayCurrency);
 }
}
p.portfolio=Object.fromEntries(math.FIELDS.map(k=>[k,p.projects.reduce((n,a)=>n+a.values[k],0)]));
p.portfolioUSD=Object.fromEntries(math.FIELDS.map(k=>[k.replace(/EUR$/,'USD'),math.quoteEUR(p.portfolio[k],p.displayCurrency)]));
const report=math.verifyCatalogue(p);
if(report.status!=='PASS')throw Error('Recalculation failed: '+JSON.stringify(report.projects.filter(a=>a.status!=='PASS')));
fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({result:report.status,projects:p.projects.length,fullPortfolioOffer:report.fullPortfolioOffer},null,2));
