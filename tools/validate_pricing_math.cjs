#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),math=require('../assets/pricing-math.js');
const root=path.resolve(__dirname,'..'),p=JSON.parse(fs.readFileSync(path.join(root,'assets/pricing-catalogue.json'),'utf8'));
const result=math.verifyCatalogue(p);assert.equal(result.status,'PASS');assert.equal(result.summary.modelOutputs,432);assert.equal(result.summary.usdConversions,864);assert.equal(result.summary.costBudgets,46);
assert.equal(math.quoteEUR(5000,p.displayCurrency),5627);assert.equal(math.quoteEUR(0,p.displayCurrency),0);assert.equal(math.quoteEUR(1,{base:'EUR',quote:'USD',rate:1}),1);assert.throws(()=>math.quoteEUR(-1,p.displayCurrency));
let broken=structuredClone(p);broken.projects[0].valuesUSD.sellerAskUSD+=1;assert.equal(math.verifyCatalogue(broken).status,'FAIL');
broken=structuredClone(p);broken.projects[0].values.marketComparableProxyEUR+=1;assert.equal(math.verifyCatalogue(broken).status,'FAIL');
broken=structuredClone(p);broken.portfolio.replacementCostEUR+=1;assert.equal(math.verifyCatalogue(broken).status,'FAIL');
broken=structuredClone(p);broken.projects.find(a=>a.costBudgets.some(b=>b.kind==='Scoped implementation reproduction budget')).costBudgets.find(b=>b.kind==='Scoped implementation reproduction budget').workPackages[0].lowEffortHours+=1;assert.equal(math.verifyCatalogue(broken).status,'FAIL');
broken=structuredClone(p);broken.projects.find(a=>a.costBudgets.some(b=>b.kind==='Scoped implementation reproduction budget')).costBudgets.find(b=>b.kind==='Scoped implementation reproduction budget').adoptedRecreationIncrementEUR+=500;assert.equal(math.verifyCatalogue(broken).status,'FAIL');
broken=structuredClone(p);broken.projects[0].calculationInputs.potential='UNKNOWN';assert.throws(()=>math.verifyCatalogue(broken));
const defaults=p.projects.filter(a=>math.calculate(a,p.methodology.factors).factorsUsed.sectorDefaulted);assert.deepEqual(defaults.map(a=>a.ref).sort(),['TA-IP-106','TA-IP-108']);
console.log(JSON.stringify({result:'PASS',actualChecks:result.summary,halfDollarRounding:true,mutatedUsdRejected:true,mutatedModelOutputRejected:true,mutatedTotalRejected:true,unknownFactorRejected:true,neutralSectorDefaultsExplicit:2},null,2));
