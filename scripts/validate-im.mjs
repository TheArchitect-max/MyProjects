import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const d=JSON.parse(read('assets/reevaluation.json'));
const a=d.assets;
assert.equal(a.length,81);assert.equal(new Set(a.map(x=>x.ref)).size,81);assert.equal(new Set(a.map(x=>x.slug)).size,81);
assert.equal(d.coverage.documentationReviewed,80);assert.equal(a.filter(x=>x.evidenceBasis==='Repository metadata only').length,1);
assert.equal(a.filter(x=>x.previous).length,79);assert.equal(a.filter(x=>!x.previous).length,2);
assert.equal(a.reduce((s,x)=>s+(x.previous?.sellerAskEUR||0),0),14075000);
assert.equal(a.reduce((s,x)=>s+(x.previous?.replacementCostEUR||0),0),60150000);
assert.equal(a.reduce((s,x)=>s+(x.previous?.economicReferenceEUR||0),0),71598124);
for(const x of a){assert.equal(x.currentValueEUR,null);assert.equal(x.recommendedAskEUR,null);assert.ok(x.qualificationGate.length>50);assert.ok(x.commercialUse.length>20);assert.equal(x.reviewedOn,d.reviewedOn);assert.ok(x.lastRepositoryActivity<=x.reviewedOn);assert.ok(['S','F','R','D','U'].includes(x.developmentClass));}
assert.equal(new Set(a.map(x=>x.qualificationGate)).size,81,'Individual qualification decisions');
const actualCounts={};for(const x of a)actualCounts[x.developmentLabel]=(actualCounts[x.developmentLabel]||0)+1;
assert.deepEqual(actualCounts,d.coverage.developmentCounts);
assert.equal(a.filter(x=>x.previous?.stage==='V'&&x.developmentClass==='R').length,15);
const f=JSON.parse(read('archive/im24/economic-methodology.json')).factors;
const lines=read('archive/im24/asset-economic-valuations.csv').trim().split(/\r?\n/);const columns=lines.shift().split(',');
for(const line of lines){const row=Object.fromEntries(line.split(',').map((v,i)=>[columns[i],v]));const x=a.find(x=>x.ref===row.ref),r=Number(row.replacementCostEUR),s=row.stage,p=row.potential,sector=f.sectorContext[x.sector];const market=r*f.marketPotential[p]*f.marketMaturity[s]*sector;const income=r*f.incomePotential[p]*f.incomeMaturity[s]*f.routeMonetization[x.route];const strategic=r*f.strategicOpportunityMultiplier[p]*f.technicalCompletionProbability[s]*f.commercializationProbability[p]*f.rightsTransferDiligenceReserve*f.timeRisk[s]*sector;
for(const [n,v]of[['marketComparableProxyEUR',market],['incomeLicensingProxyEUR',income],['probabilityAdjustedStrategicValueEUR',strategic]])assert.ok(Math.abs(Math.round(v)-Number(row[n]))<=1,`${row.ref} ${n} reconstructs from cost`);
const weights=f.triangulationWeights;const combined=r*weights.replacementCost+Number(row.marketComparableProxyEUR)*weights.marketComparableProxy+Number(row.incomeLicensingProxyEUR)*weights.incomeLicensingProxy+Number(row.probabilityAdjustedStrategicValueEUR)*weights.probabilityAdjustedStrategicValue;assert.ok(Math.abs(Math.round(combined)-Number(row.triangulatedEconomicReferenceEUR))<=1,`${row.ref} historical weighted model`);
}
assert.equal(d.methodReview.reconstructedRows,79);assert.equal(d.methodReview.sharedCostAnchor,true);assert.equal(d.coverage.monetaryValuesEstablished,0);
console.log('Validated 81 individual decisions, unknown-not-zero monetary values, historical totals, and reconstruction of all 79 previous model rows.');
