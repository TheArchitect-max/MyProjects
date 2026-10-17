#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),math=require(path.join(root,'assets/pricing-math.js')),pricePath=path.join(root,'assets/pricing-catalogue.json'),mathPath=path.join(root,'assets/pricing-math.js');
const report=math.verifyCatalogue(JSON.parse(fs.readFileSync(pricePath,'utf8')));
report.publicFiles={pricingCatalogue:{path:'assets/pricing-catalogue.json',sha256:crypto.createHash('sha256').update(fs.readFileSync(pricePath)).digest('hex')},calculationModule:{path:'assets/pricing-math.js',sha256:crypto.createHash('sha256').update(fs.readFileSync(mathPath)).digest('hex')}};
if(report.status!=='PASS')throw Error('Pricing calculation checks failed: '+JSON.stringify(report.projects.filter(p=>p.status!=='PASS')));
fs.writeFileSync(path.join(root,'assets/calculation-validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({result:report.status,...report.summary},null,2));
