#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),json=file=>JSON.parse(read(file));
const math=require('../assets/pricing-math.js'),pricing=json('assets/pricing-catalogue.json');
const current=math.fullPortfolioOffer(pricing);
assert.deepEqual(current,{projectCount:123,discountPercent:10,payablePercent:90,individualAskingTotalEUR:25153000,savingEUR:2515300,packageAskingEUR:22637700});
assert.equal(math.quoteEUR(current.packageAskingEUR,pricing.displayCurrency),25385917);
assert.deepEqual(json('assets/calculation-validation.json').fullPortfolioOffer,current);
assert.deepEqual(json('displays/assets/calculation-validation.json').fullPortfolioOffer,current);

// A subsequent individual asking-price change must flow through without editing an offer amount.
const updated=structuredClone(pricing);updated.projects[0].values.sellerAskEUR+=1000;updated.portfolio.sellerAskEUR+=1000;
const next=math.fullPortfolioOffer(updated);
assert.equal(next.discountPercent,10);assert.equal(next.packageAskingEUR,current.packageAskingEUR+900);assert.equal(next.savingEUR,current.savingEUR+100);
const small=amounts=>({...pricing,projects:amounts.map((sellerAskEUR,i)=>({ref:'TEST-'+i,values:{sellerAskEUR}})),portfolio:{sellerAskEUR:amounts.reduce((a,b)=>a+b,0)}});
assert.equal(math.fullPortfolioOffer(small([5,5])).packageAskingEUR,9,'Round the aggregate once, not each project');
assert.equal(math.fullPortfolioOffer(small([1001,1004])).packageAskingEUR,1805,'Round half euros up');
for(const amount of [0,1,4,5,6,9,10,1001,Number.MAX_SAFE_INTEGER]){
 const result=math.fullPortfolioOffer(small([amount]));
 assert.equal(result.packageAskingEUR+result.savingEUR,amount);
 assert.equal(result.packageAskingEUR,Number((BigInt(amount)*9n+5n)/10n));
}
for(const mutate of [
 p=>delete p.methodology.fullPortfolioOffer,
 p=>p.methodology.fullPortfolioOffer.discountPercent=100,
 p=>p.methodology.fullPortfolioOffer.discountPercent=-10,
 p=>p.methodology.fullPortfolioOffer.discountPercent=10.5,
 p=>p.methodology.fullPortfolioOffer.scope='SELECTED_GROUP',
 p=>p.projects.push(p.projects[0]),
 p=>p.projects=[],
 p=>p.projects[0].values.sellerAskEUR=-1,
 p=>p.projects[0].values.sellerAskEUR=0.5,
 p=>p.projects[0].values.sellerAskEUR=Number.MAX_SAFE_INTEGER,
 p=>p.portfolio.sellerAskEUR+=1
]){const broken=structuredClone(pricing);mutate(broken);assert.throws(()=>math.fullPortfolioOffer(broken));}

const script=read('assets/im.js'),source=script.slice(0,script.lastIndexOf('render().catch'))+'globalThis.offerUI={load,home,valuation,acquisition,fullPortfolioOfferSection,acquisitionEnquiryText,bindEnquiry};})();';
const sandbox={PricingMath:math,URL,URLSearchParams,Intl,JSON,Math,Number,String,Boolean,Map,Set,console,document:{currentScript:{src:'https://thearchitect-max.github.io/MyProjects/assets/im.js'}},location:{pathname:'/MyProjects/',search:'',hash:''},fetch:async url=>({ok:true,json:async()=>json(new URL(url).pathname.replace('/MyProjects/',''))})};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
(async()=>{
 const ui=sandbox.offerUI,data=await ui.load(),euro=n=>new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
 for(const name of ['home','valuation','acquisition']){
  const html=ui[name](data),section=html.match(/<section[^>]*id="full-portfolio-offer"[\s\S]*?<\/section>/)?.[0];assert(section,name);
  assert.equal((html.match(/id="full-portfolio-offer"/g)||[]).length,1,name);
  for(const field of ['individualAskingTotalEUR','savingEUR','packageAskingEUR'])assert(section.includes(euro(current[field])),name+' '+field);
  assert(section.includes('?scope=full-portfolio#enquiry'));assert(section.includes('Selected groups are quoted separately.'));
 }
 const futureData={...data,pricing:updated};
 assert(ui.fullPortfolioOfferSection(futureData).includes(euro(next.packageAskingEUR)));
 assert(ui.acquisitionEnquiryText(futureData,'full-portfolio','','').includes(euro(next.packageAskingEUR)));
 const staticPage=read('portfolio-pricing-review.html'),staticOffer=staticPage.match(/<section[^>]*id="full-portfolio-offer"[\s\S]*?<\/section>/)[0];
 for(const field of ['individualAskingTotalEUR','savingEUR','packageAskingEUR'])assert(staticOffer.includes('EUR '+current[field].toLocaleString('en-US')));
 assert(staticOffer.includes('10%'));assert(staticOffer.includes('USD 25,385,917'));assert(staticPage.includes('id="subscription-scenario"'));assert(staticPage.includes('€122,877'));assert(staticPage.includes('€1,474,524'));
 assert(read('displays/index.html').includes('valuation.html#full-portfolio-offer'));
 const full=ui.acquisitionEnquiryText(data,'full-portfolio','Example buyer','Review all current editions.');
 assert(full.includes('all 123 listed projects'));assert(full.includes('Full-portfolio discount (10%): €2,515,300'));assert(full.includes('€22,637,700'));assert(full.includes('Example buyer'));assert(full.includes('Review all current editions.'));
 const asset=data.projects[0],individual=ui.acquisitionEnquiryText(data,asset.ref,'','');assert(individual.includes(asset.ref));assert(individual.includes(euro(asset.askingReferenceEUR)));assert(!individual.includes('Full-portfolio discount'));
 for(const selection of ['', 'unknown']){const draft=ui.acquisitionEnquiryText(data,selection,'','');assert(draft.includes('General portfolio or selected-group enquiry'));assert(!draft.includes('Full-portfolio discount'));}

 // Exercise the real query selection, submit and copy handlers without sending an enquiry.
 const elements={};for(const id of ['enquiry-asset','enquiry-organisation','enquiry-purpose','enquiry-draft','enquiry-status','enquiry-form','copy-enquiry','save-enquiry'])elements[id]={value:'',handlers:{},addEventListener(event,handler){this.handlers[event]=handler;}};
 sandbox.document.getElementById=id=>elements[id];let copied='';sandbox.navigator={clipboard:{writeText:async text=>{copied=text;}}};
 sandbox.location.search='?scope=full-portfolio&asset='+asset.ref+'&workstream='+data.strategic.workstreams[0].id;
 ui.bindEnquiry(data);assert.equal(elements['enquiry-asset'].value,'full-portfolio');assert.equal(elements['enquiry-purpose'].value,'');
 elements['enquiry-form'].handlers.submit({preventDefault(){}});assert(elements['enquiry-draft'].value.includes('€22,637,700'));
 elements['enquiry-asset'].value=asset.ref;await elements['copy-enquiry'].handlers.click();assert(copied.includes(asset.ref));assert(!copied.includes('Full-portfolio discount'),'Copy must reflect the current selection');
 sandbox.location.search='?asset='+asset.ref;ui.bindEnquiry(data);assert.equal(elements['enquiry-asset'].value,asset.ref);

 // A cached shell with the old module must load the version that implements the offer.
 let loaded=0;const oldMath={...math};delete oldMath.fullPortfolioOffer;
 const cached={...sandbox,PricingMath:oldMath,document:{currentScript:sandbox.document.currentScript,createElement:()=>({}),head:{appendChild(script){loaded++;assert(script.src.endsWith('?v=calc13'));cached.PricingMath=math;script.onload();}}}};
 vm.createContext(cached);vm.runInContext(source,cached);await cached.offerUI.load();assert.equal(loaded,1);
 console.log(JSON.stringify({result:'PASS',fixedDiscountPercent:10,packageAskingEUR:current.packageAskingEUR,savingEUR:current.savingEUR,futureUpdatesAndAggregateRounding:true,invalidInputsRejected:11,consistentOfferPages:4,fullAndIndividualEnquiryPaths:true,cachedCalculatorUpgrade:true},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
