(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PricingMath=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const FIELDS=['sellerAskEUR','negotiationLowEUR','negotiationHighEUR','replacementCostEUR','marketComparableProxyEUR','incomeLicensingProxyEUR','probabilityAdjustedStrategicValueEUR','triangulatedEconomicReferenceEUR'];
const DERIVED=FIELDS.slice(4),USD_KEY=k=>k.replace(/EUR$/,'USD');
function quoteEUR(amount,fx){
 if(!Number.isSafeInteger(amount)||amount<0||fx.base!=='EUR'||fx.quote!=='USD'||!/^\d+(?:\.\d{1,6})?$/.test(String(fx.rate))||fx.rate<=0)throw Error('Invalid currency input');
 const parts=String(fx.rate).split('.'),scale=10**(parts[1]?.length||0),rate=Number(parts.join('')),product=amount*rate;
 if(!Number.isSafeInteger(product)||!Number.isSafeInteger(2*product+scale))throw Error('Currency precision exceeded');
 return Math.floor((2*product+scale)/(2*scale));
}
function calculate(asset,factors,targetStage){
 const i=asset.calculationInputs,stage=targetStage||i.stage,p=i.potential,cost=asset.values.replacementCostEUR;
 const lookup=(group,key)=>{const n=factors[group]?.[key];if(typeof n!=='number'||!Number.isFinite(n)||n<0)throw Error('Invalid model factor');return n;};
 const sectorDefaulted=!Object.hasOwn(factors.sectorContext,i.sector),routeDefaulted=!Object.hasOwn(factors.routeMonetization,i.route);
 const marketPotential=lookup('marketPotential',p),marketMaturity=lookup('marketMaturity',stage),incomePotential=lookup('incomePotential',p),incomeMaturity=lookup('incomeMaturity',stage),sector=sectorDefaulted?1:lookup('sectorContext',i.sector),route=routeDefaulted?1:lookup('routeMonetization',i.route),opportunity=lookup('strategicOpportunityMultiplier',p),technical=lookup('technicalCompletionProbability',stage),commercial=lookup('commercializationProbability',p),risk=lookup('timeRisk',stage),rights=factors.rightsTransferDiligenceReserve;
 const market=Math.round(cost*marketPotential*marketMaturity*sector),income=Math.round(cost*incomePotential*incomeMaturity*route),strategic=Math.round(cost*opportunity*technical*commercial*rights*risk*sector),w=factors.triangulationWeights;
 const blend=Math.round(cost*w.replacementCost+market*w.marketComparableProxy+income*w.incomeLicensingProxy+strategic*w.probabilityAdjustedStrategicValue);
 return {values:{marketComparableProxyEUR:market,incomeLicensingProxyEUR:income,probabilityAdjustedStrategicValueEUR:strategic,triangulatedEconomicReferenceEUR:blend},factorsUsed:{marketPotential,marketMaturity,incomePotential,incomeMaturity,sector,route,opportunity,technical,commercial,rights,risk,sectorDefaulted,routeDefaulted},formulas:{marketComparableProxyEUR:`round(${cost} × ${marketPotential} × ${marketMaturity} × ${sector}) = ${market}`,incomeLicensingProxyEUR:`round(${cost} × ${incomePotential} × ${incomeMaturity} × ${route}) = ${income}`,probabilityAdjustedStrategicValueEUR:`round(${cost} × ${opportunity} × ${technical} × ${commercial} × ${rights} × ${risk} × ${sector}) = ${strategic}`,triangulatedEconomicReferenceEUR:`round(${cost} × ${w.replacementCost} + ${market} × ${w.marketComparableProxy} + ${income} × ${w.incomeLicensingProxy} + ${strategic} × ${w.probabilityAdjustedStrategicValue}) = ${blend}`}};
}
function checkProject(a,p){
 if(Object.keys(a.values).length!==FIELDS.length||FIELDS.some(k=>!Number.isSafeInteger(a.values[k])||a.values[k]<0))throw Error('Invalid monetary fields');
 const model=calculate(a,p.methodology.factors),modelChecks=DERIVED.map(k=>({key:k,publishedEUR:a.values[k],recomputedEUR:model.values[k],formula:model.formulas[k],match:a.values[k]===model.values[k]}));
 const usdChecks=FIELDS.map(k=>({key:k,eur:a.values[k],publishedUSD:a.valuesUSD[USD_KEY(k)],convertedUSD:quoteEUR(a.values[k],p.displayCurrency),match:a.valuesUSD[USD_KEY(k)]===quoteEUR(a.values[k],p.displayCurrency)}));
 const rangeMatches=a.values.negotiationLowEUR<=a.values.sellerAskEUR&&a.values.sellerAskEUR<=a.values.negotiationHighEUR;
 const budgetChecks=[];
 a.costBudgets.forEach((b,index)=>{
  if(b.rawEngineeringCostEUR==null)return;let direct,method;
  if(b.hourlyRateEUR!=null){direct=b.assumedHours*b.hourlyRateEUR;method=`${b.assumedHours} hours × EUR ${b.hourlyRateEUR}/hour`;}
  else {const keys=['seniorEngineerMonths','leadOrSpecialistMonths','validationProvenanceMonths'];if(!keys.every(k=>typeof b[k]==='number'))return;direct=keys.reduce((n,k,j)=>n+b[k]*p.methodology.roles[j].monthEUR,0);method=keys.map((k,j)=>`${b[k]} months × EUR ${p.methodology.roles[j].monthEUR}`).join(' + ');}
  const allowance=b.coordinationToolingAllowance??p.methodology.coordinationToolingAllowance,withAllowance=direct*(1+allowance),directMatch=Math.abs(direct-b.rawEngineeringCostEUR)<0.000001,allowanceMatch=b.withAllowanceEUR==null||Math.abs(withAllowance-b.withAllowanceEUR)<0.000001;
  const scoped=b.kind==='Scoped implementation reproduction budget',workPackagesMatch=!scoped||Array.isArray(b.workPackages)&&b.workPackages.every(w=>Number.isSafeInteger(w.lowEffortHours)&&w.lowEffortHours>=0)&&b.workPackages.reduce((n,w)=>n+w.lowEffortHours,0)===b.assumedHours;
  const adoptedIncrementMatch=!scoped||b.rounding==='DOWN_TO_EUR_500'&&b.adoptedRecreationIncrementEUR===Math.floor((Math.round(withAllowance*100)/100)/500)*500;
  const nextIncrement=a.costBudgets.slice(index+1).find(x=>x.kind==='Scoped implementation reproduction budget');
  const resultingAnchorMatch=!scoped||b.previousRecreationCostEUR+b.adoptedRecreationIncrementEUR===b.currentRecreationCostEUR&&b.currentRecreationCostEUR===(nextIncrement?nextIncrement.previousRecreationCostEUR:a.values.replacementCostEUR);
  budgetChecks.push({budgetIndex:index,method,recomputedDirectEUR:direct,publishedDirectEUR:b.rawEngineeringCostEUR,allowance,recomputedWithAllowanceEUR:Math.round(withAllowance*100)/100,publishedWithAllowanceEUR:b.withAllowanceEUR??null,directMatch,allowanceMatch,workPackagesMatch,adoptedIncrementMatch,resultingAnchorMatch,match:directMatch&&allowanceMatch&&workPackagesMatch&&adoptedIncrementMatch&&resultingAnchorMatch});
 });
 const f=a.futureReference,n=f.milestoneConditionedEconomicReferenceEUR;let futureCheck={applicable:false};
 if(Number.isSafeInteger(n)){const value=calculate(a,p.methodology.factors,f.targetStage).values.triangulatedEconomicReferenceEUR;futureCheck={applicable:true,publishedEUR:n,recomputedEUR:value,deltaEUR:n-a.values.triangulatedEconomicReferenceEUR,match:value===n&&n-a.values.triangulatedEconomicReferenceEUR===f.sensitivityDeltaEUR&&quoteEUR(n,p.displayCurrency)===f.milestoneConditionedEconomicReferenceUSD&&quoteEUR(f.sensitivityDeltaEUR,p.displayCurrency)===f.sensitivityDeltaUSD};}
 const status=modelChecks.every(x=>x.match)&&usdChecks.every(x=>x.match)&&rangeMatches&&budgetChecks.every(x=>x.match)&&(!futureCheck.applicable||futureCheck.match)?'PASS':'FAIL';
 return {ref:a.ref,status,rangeMatches,modelChecks,usdChecks,budgetChecks,futureCheck};
}
function verifyCatalogue(p){
 if(p.schema!=='public-pricing-1'||p.projects.length!==110||new Set(p.projects.map(a=>a.ref)).size!==110)throw Error('Invalid pricing coverage');
 const projects=p.projects.map(a=>checkProject(a,p)),totals=FIELDS.map(k=>{const eur=p.projects.reduce((n,a)=>n+a.values[k],0),usd=quoteEUR(eur,p.displayCurrency),roundedSum=p.projects.reduce((n,a)=>n+a.valuesUSD[USD_KEY(k)],0);return {key:k,sumEUR:eur,publishedEUR:p.portfolio[k],convertedUSD:usd,publishedUSD:p.portfolioUSD[USD_KEY(k)],sumRoundedProjectUSD:roundedSum,usdRoundingDifference:usd-roundedSum,match:eur===p.portfolio[k]&&usd===p.portfolioUSD[USD_KEY(k)]};});
 const status=projects.every(a=>a.status==='PASS')&&totals.every(a=>a.match)?'PASS':'FAIL';
 return {schema:'pricing-calculation-check-1',basisDate:p.basisDate,status,scope:'Arithmetic consistency of disclosed seller inputs, model outputs, cost budgets, currency conversion and totals. This is not independent validation of assumed effort, market value, product performance, ownership or transfer readiness.',displayCurrency:p.displayCurrency,summary:{projects:projects.length,modelOutputs:projects.reduce((n,a)=>n+a.modelChecks.length,0),usdConversions:projects.reduce((n,a)=>n+a.usdChecks.length,0),costBudgets:projects.reduce((n,a)=>n+a.budgetChecks.length,0),conditionalReferences:projects.filter(a=>a.futureCheck.applicable).length,portfolioTotals:totals.length},totals,projects};
}
return Object.freeze({FIELDS,DERIVED,quoteEUR,calculate,checkProject,verifyCatalogue});
});
