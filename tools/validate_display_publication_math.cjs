#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const authoritative = fs.readFileSync(path.join(base, 'assets/pricing-math.js'));
const display = fs.readFileSync(path.join(base, 'displays/assets/pricing-math.js'));
assert(authoritative.equals(display), 'The displays calculator is behind the 123-asset canonical calculator');
const record = JSON.parse(fs.readFileSync(path.join(base, 'assets/pricing-catalogue.json')));
const publication = JSON.parse(fs.readFileSync(path.join(base, 'displays/assets/pricing-catalogue.json')));
assert.deepStrictEqual(publication, record, 'Published price data differs');
const reported = JSON.parse(fs.readFileSync(path.join(base, 'displays/assets/calculation-validation.json')));
assert.equal(reported.publicFiles.calculationModule.sha256,
  crypto.createHash('sha256').update(display).digest('hex'));
const verify = require(path.join(base, 'displays/assets/pricing-math.js')).verifyCatalogue(publication);
assert.equal(verify.status, 'PASS');
assert.equal(verify.summary.projects, 123);
assert.equal(verify.summary.modelOutputs, 492);
assert.equal(verify.summary.usdConversions, 984);
assert.equal(publication.portfolio.sellerAskEUR, 25153000);
console.log(JSON.stringify({result:'PASS',displayCalculator:'same-as-authoritative',
  pricedAssets:123,modelOutputs:492,usdChecks:984,datedAskingReferencesEUR:25153000},null,2));
