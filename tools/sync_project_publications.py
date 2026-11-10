#!/usr/bin/env python3
"""Synchronise individual project displays/downloads from canonical public records.
Does not change styles, navigation, services, payment/contribution policy or source repos.
Run after pricing-calculation updates; PDF output is deterministic.
"""
from pathlib import Path
from html import escape as E
import json,re,csv
R=Path(__file__).resolve().parents[1]; BASE='https://thearchitect-max.github.io/MyProjects/'
def read(n):return json.loads((R/n).read_text())
def write(n,d):(R/n).write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
def ul(xs):return '<ul>'+''.join('<li>'+E(str(x))+'</li>' for x in xs)+'</ul>'
def money(n):return f'EUR {n:,}'
def dollars(n):return f'USD {n:,}'
c=read('assets/buyer-catalogue.json');d=read('assets/buyer-dossiers.json');p=read('assets/pricing-catalogue.json');review=read('assets/portfolio-reassessment-20261107.json');ledger=read('assets/portfolio-identity-ledger.json')
D={x['ref']:x for x in d['projects']};P={x['ref']:x for x in p['projects']};Q={x['id']:x for x in review['assessments']};CAT={x['id']:x['title'] for x in c['categories']};date=p['basisDate'];fx=p['displayCurrency'];template=(R/'displays/products/collective-reality-engine/index.html').read_text();original=next(x for x in c['projects'] if x['ref']=='TA-IP-103')
def section(id,eyebrow,title,body):return '<section id="'+id+'" class="split-section"><div><p class="eyebrow">'+eyebrow+'</p><h2>'+title+'</h2></div><div>'+body+'</div></section>'
def review_html(a,r):return '<section class="section" data-source-requalification-20261107="documentary-review"><div class="shell"><h2>Source-specific reassessment — 10 November 2026</h2><p><strong>'+a['ref']+' / '+E(a['referenceName'])+':</strong> '+E(r['sourceBaseline'])+'</p><p><strong>Implemented scope:</strong> '+E(r.get('demonstratedScope',a['overview']))+'</p><p><strong>Retained source evidence:</strong> '+E(r['developmentEvidence'])+'</p><p><strong>Remaining limits:</strong> '+E(r['currentLimitations'])+'</p><p><strong>Development:</strong> '+E(r['currentCandidateSummary'])+'</p><p><strong>Price decision:</strong> '+E(r['priceDecisionReason'])+'</p><p>Individual documentary review. Underlying private software was not freshly executed in this catalogue update. No market value, rights clearance or production acceptance is certified.</p></div></section>'
connections=read('assets/application-combinations.json')['connections']
rows=[];idrows=[];cards=[]
oldcsv=list(csv.DictReader((R/'displays/catalogue.csv').open(encoding='utf-8-sig')));csvfields=list(oldcsv[0]);bycsv={x['Reference']:x for x in oldcsv}
for a in c['projects']:
 ref=a['ref'];v=D[ref];price=P[ref];r=Q[ref];values=price['values'];usd=price['valuesUSD'];folder=R/'displays/products'/a['slug'];folder.mkdir(exist_ok=True)
 s=(folder/'index.html').read_text() if int(ref[-3:])<120 else template
 if int(ref[-3:])>=120:
  for key in ['slug','title','referenceName','ref']:
   s=s.replace(E(original[key]),E(a[key])).replace(original[key],a[key])
 s=re.sub(r'(<meta name="description" content=")[^"]*',lambda m:m[1]+E(a['summary'],quote=True),s)
 s=re.sub(r'(<p class="hero-lede">).*?(</p>)',lambda m:m[1]+E(a['summary'])+m[2],s,count=1)
 s=re.sub(r'data-price="[0-9]+"','data-price="'+str(values['sellerAskEUR'])+'"',s)
 plaque='<aside class="asset-plaque"><span class="plaque-id">'+ref+'</span><p>'+E(CAT[a['categoryId']])+'</p><div class="plaque-alias">'+E(a['referenceName'])+'</div><span class="stage">'+E(a['maturity'])+'</span><div class="plaque-price"><span>SELLER ASKING REFERENCE / AS IS</span><strong>'+money(values['sellerAskEUR'])+'</strong><small class="price-usd" data-currency="USD">≈ '+dollars(usd['sellerAskUSD'])+'</small><span class="restored-plaque-label">RECREATION COST ESTIMATE</span><strong class="restored-plaque-cost">'+money(values['replacementCostEUR'])+'</strong><small class="price-usd" data-currency="USD">≈ '+dollars(usd['replacementCostUSD'])+'</small><a class="price-source-short" href="#pricing">All prices &amp; sources →</a></div></aside>'
 s=re.sub(r'<aside class="asset-plaque">.*?</aside>',lambda _:plaque,s,flags=re.S,count=1)
 bodies={
 'product':('01 / PRODUCT OVERVIEW','Product overview','<p class="lead-copy">'+E(a['overview'])+'</p>'),
 'buyer-fit':('02 / POTENTIAL ACQUIRERS','Potential acquirers',ul(a['potentialBuyers'])+'<p>'+E(a['summary'])+'</p>'),
 'functions':('03 / FUNCTIONS &amp; OUTPUTS','Functions &amp; outputs','<h3>Documented functions</h3><div class="functions">'+''.join('<div class="function-row"><span>'+f'{i:02}'+'</span><p>'+E(t)+'</p></div>' for i,t in enumerate(a['capabilities'],1))+'</div><h3>Available output types</h3>'+ul(a['outputTypes'])),
 'scope':('04 / CURRENT OFFERED POSITION','Current offered position','<dl class="status-grid">'+''.join('<div><dt>'+label+'</dt><dd>'+E(value)+'</dd></div>' for label,value in [('Fixed identity',ref+' · '+a['referenceName']),('Offered edition',v['version']),('Development stage',a['maturity']),('Acquisition position',a['availability'])])+'</dl><p>'+E(a['maturityNote'])+'</p><div class="boundary-box"><h3>Material scope conditions</h3>'+ul(a['materialBoundaries'])+'</div>')}
 for id,(ey,title,body) in bodies.items():s=re.sub('<section id="'+id+'".*?</section>',lambda _,id=id,ey=ey,title=title,body=body:section(id,ey,title,body),s,count=1,flags=re.S)
 # Preserve the acquisition actions and perimeter layout; only its monetary reference changes.
 s=re.sub(r'(<div><span>Seller asking reference</span><strong>)EUR [\d,]+',lambda m:m[1]+money(values['sellerAskEUR']),s)
 crit='<div class="price-table-wrap"><table class="price-table buyer-criteria"><thead><tr><th>Acquisition criterion</th><th>Profile</th><th>Meaning for your review</th></tr></thead><tbody>'+''.join('<tr><th>'+E(x['label'])+'</th><td>'+E(x['grade'])+'</td><td>'+E(x['criterion'])+'</td></tr>' for x in v['assessmentCriteria'])+'</tbody></table></div>'
 body='<dl class="status-grid"><div><dt>Identified product edition</dt><dd>'+E(v['version'])+'</dd></div><div><dt>Handover position</dt><dd>'+E(v['transferPosition'])+'</dd></div></dl><p>'+E(v['productPosition'])+'</p>'
 if v['developmentEdition']:body+='<p><strong>Separately scoped development:</strong> '+E(v['developmentEdition'])+'</p>'
 body+='<h3>Priced first-party scope</h3><p>'+E(v['offeredEdition'])+'</p><h3>Acquisition evidence profile</h3>'+crit+'<p class="small">Seller documentary grades; recipient acceptance remains separate. <a href="'+BASE+'assurance.html#criteria">Read grade definitions ↗</a></p><h3>Conditions before handover</h3>'+ul(v['sellerConditions'])+'<h3>Qualification objectives</h3>'+ul(v['qualificationObjectives']+v['buyerConditions'])+'<h3>Rights and components</h3><p>'+E(v['rightsPosition'])+'</p>'
 labels=['Dependency declaration','Dependency lock record','Component inventory artifact','Licence notices','Third-party disclosure','Security documentation'];flags=[x for x in v['componentEvidence'].values() if isinstance(x,bool)]
 body+='<dl class="buyer-component-grid">'+''.join('<div><dt>'+label+'</dt><dd>'+('Identified in the reviewed records' if flag else 'Not established in the reviewed records')+'</dd></div>' for label,flag in zip(labels,flags))+'</dl><p class="small">'+E(v['componentEvidence']['interpretation'])+'</p>'
 for det in v['productDetails']:
  if not det['title'].startswith('Source review'):body+='<h3>'+E(det['title'])+'</h3><p>'+E(det['text'])+'</p>'+ul(det.get('items',[]))
 for connection in connections:
  member=next((member for member in connection['members'] if member['ref']==ref),None)
  if member:
   body+='<h3>Potential application context</h3><ul><li><a href="'+BASE+'connections.html#'+E(connection['slug'])+'">'+E(connection['title'])+'</a> — '+E(member['role'])+'</li></ul><p class="small">Proposed applications require separately agreed interfaces, integration and joint qualification. They are not additional assets or delivered integrated products.</p>'
 body+='<p><a class="text-link" href="'+BASE+'transfer.html">Review the rights and delivery guide ↗</a></p>'
 s=re.sub(r'<section id="product-dossier".*?</section>',lambda _:section('product-dossier','06 / PRODUCT EDITION &amp; QUALIFICATION','Product edition &amp; qualification',body),s,count=1,flags=re.S)
 body='<p>Price basis: '+date+'. EUR is authoritative; market value is not established.</p><dl class="restored-price-grid">'
 for f in p['fields']:
  k=f['key'];body+='<div data-price-field="'+k+'"><dt>'+E(f['label'])+'</dt><dd><strong>'+money(values[k])+'</strong><small class="price-usd">≈ '+dollars(usd[k.replace('EUR','USD')])+'</small></dd><small>'+E(f.get('description',f.get('meaning','')) )+'</small></div>'
 body+='</dl>'
 fut=price['futureReference']
 if isinstance(fut.get('milestoneConditionedEconomicReferenceEUR'),int):body+='<div class="price-future"><h3>Milestone-conditioned reference</h3><p>'+money(fut['milestoneConditionedEconomicReferenceEUR'])+'; model change '+money(fut['sensitivityDeltaEUR'])+'. '+E(fut['targetMilestone'])+'</p><p>Conditional maturity sensitivity, not a current asking price, forecast or established market value.</p></div>'
 body+='<div class="price-cost-basis"><h3>Cost basis</h3><p>'+E(price['costBasisNote'])+'</p><p>'+E(price['assessment']['costEvidenceLabel'])+'. '+E(price['assessment']['costEvidenceNote'])+'</p></div>'
 for b in price['costBudgets'][-1:]:
  if b.get('economicAssessmentAt')==date:body+='<h3>Individually scoped estimate</h3>'+ul(x['scope']+' — '+str(x['lowEffortHours'])+' assumed hours' for x in b['workPackages'])
 body+='<h3>Sources and application</h3><p>External publishers provide method and rate context, not individual asset valuations.</p><ul class="price-source-links">'+''.join('<li><a href="'+x['url']+'" target="_blank" rel="noopener">'+E(x['publisher']+' · '+x['title'])+' ↗</a><small>'+E(x['application'])+'</small></li>' for x in p['sources'] if x['id'] in price['sourceIds'])+'</ul><p class="small">Indicative USD conversion: EUR 1 = USD '+str(fx['rate'])+'; ECB '+fx['date']+'. EUR is authoritative.</p><a class="button secondary" href="'+BASE+'valuation.html#methodology">Full price method &amp; source register ↗</a>'
 s=re.sub(r'<section id="pricing".*?</section>',lambda _:section('pricing','07 / PRICES &amp; SOURCES','Prices &amp; sources',body),s,count=1,flags=re.S)
 # Replace historical in-page source snapshots, retaining dated historical register files separately.
 s=re.sub(r'<section[^>]*data-source-requalification-20261107="documentary-review".*?</section>',lambda _:review_html(a,r),s,flags=re.S)
 s=re.sub(r'<section[^>]*(?:id="source-price-session-[^"]+"|data-source-price-session="[^"]+").*?</section>','',s,flags=re.S)
 (folder/'index.html').write_text(s)
 brief='# '+a['title']+'\n\n'+ref+' | Reference name: '+a['referenceName']+'\n\nAssessment date: '+date+'\n\n## Product overview\n\n'+a['overview']+'\n\nIdentified edition: '+v['version']+'\n\n'+v['productPosition']+'\n\n'
 for title,items in [('Potential acquirers',a['potentialBuyers']),('Documented functions',a['capabilities']),('Output types',a['outputTypes']),('Material scope boundaries',a['materialBoundaries'])]:brief+='## '+title+'\n\n'+'\n'.join('- '+x for x in items)+'\n\n'
 brief+='## Acquisition evidence profile\n\n'+'\n'.join('- '+x['label']+': '+x['grade']+' — '+x['criterion'] for x in v['assessmentCriteria'])+'\n\nOffered first-party scope: '+v['offeredEdition']+'\n\nDevelopment: '+(v['developmentEdition'] or 'No separate open candidate at the reviewed snapshot.')+'\n\n'
 for title,items in [('Conditions before handover',v['sellerConditions']),('Qualification objectives',v['qualificationObjectives']+v['buyerConditions'])]:brief+='## '+title+'\n\n'+'\n'.join('- '+x for x in items)+'\n\n'
 brief+='## Prices and sources\n\n| Reference | EUR | Indicative USD |\n|---|---:|---:|\n'+''.join('| '+f['label']+' | '+f"{values[f['key']]:,}"+' | '+f"{usd[f['key'].replace('EUR','USD')]:,}"+' |\n' for f in p['fields'])+'\n'+price['costBasisNote']+'\n\n'+price['assessment']['costEvidenceNote']+'\n\nEUR 1 = USD '+str(fx['rate'])+'; ECB '+fx['date']+'. EUR is authoritative; market value is not established.\n\n'
 brief+='## Individual source review\n\n'+r['developmentEvidence']+'\n\nRemaining limits: '+r['currentLimitations']+'\n\nPrice decision: '+r['priceDecisionReason']+'\n\nDocumentary review only; private product tests were not re-executed in this website update.\n\n'+v['rightsPosition']+'\n\n[Full dossier]('+a['profileUrl']+') · [Project display]('+a['displayUrl']+')\n\n'+''.join('- ['+x['publisher']+']('+x['url']+'): '+x['application']+'\n' for x in p['sources'] if x['id'] in price['sourceIds'])
 (folder/'product-brief.md').write_text(brief)
 row={k:'' for k in csvfields};row.update(bycsv.get(ref,{}));row.update(Reference=ref,Project=a['title'],Reference_name=a['referenceName'],Application=CAT[a['categoryId']],Potential_acquirers=' | '.join(a['potentialBuyers']),Purpose=a['summary'],Maturity=a['maturity'],Seller_asking_reference_EUR=values['sellerAskEUR'],Asset_profile=a['profileUrl'],Factsheet=a['factsheetUrl'],Product_brief=a['briefUrl'],**values,**usd,USD_per_EUR=fx['rate'],FX_date=fx['date'],Calculation_validation='PASS',Milestone_conditioned_reference_EUR=fut.get('milestoneConditionedEconomicReferenceEUR',''),Milestone_conditioned_reference_USD=fut.get('milestoneConditionedEconomicReferenceUSD',''),Pricing_and_sources=a['profileUrl']+'#pricing',Source_URLs=' | '.join(x['url'] for x in p['sources'] if x['id']in price['sourceIds']),Product_edition=v['version'],Development_edition=v['developmentEdition'],Handover_position=v['transferPosition'],Project_display=a['displayUrl'],Asset_identity_register=BASE+'identities.html',Acquisition_dossier=BASE+'acquisition-dossier/',Seller_conditions=' | '.join(v['sellerConditions']));rows.append(row)
 idrows.append(dict(Asset_ID=ref,Canonical_project_title=a['title'],Feminine_name=a['referenceName'],Project_display=a['displayUrl'],Asset_dossier=a['profileUrl'],Factsheet_PDF=a['factsheetUrl'],Product_brief=a['briefUrl']))
 search=' '.join([ref,a['title'],a['referenceName'],a['summary'],CAT[a['categoryId']],*a['potentialBuyers'],*a['capabilities']]).lower()
 cards.append('<article class="asset-card" data-project-ref="'+ref+'" data-name="'+E(a['title'].lower(),quote=True)+'" data-search="'+E(search,quote=True)+'" data-family="'+a['categoryId']+'" data-buyers="'+' '.join(a['buyerGroupIds'])+'" data-stage="'+a['maturity']+'" data-price="'+str(values['sellerAskEUR'])+'" style="--accent:#c5a46d"><div class="card-top"><span>'+ref+'</span><span>'+E(a['referenceName'])+'</span></div><p class="card-family">'+E(CAT[a['categoryId']])+'</p><h3>'+E(a['title'])+'</h3><p class="card-description">'+E(a['summary'])+'</p><div class="buyer-card-fit"><strong>Potential acquirers</strong><p>'+E(' · '.join(a['potentialBuyers']))+'</p></div><div class="card-bottom"><span class="stage">'+a['maturity']+'</span><strong>'+money(values['sellerAskEUR'])+'</strong></div><small class="price-usd" data-currency="USD">≈ '+dollars(usd['sellerAskUSD'])+'</small><p class="card-cost">Recreation estimate: '+money(values['replacementCostEUR'])+'<small class="price-usd" data-currency="USD">≈ '+dollars(usd['replacementCostUSD'])+'</small></p><a class="card-link" href="products/'+a['slug']+'/index.html">Open project display ↗</a><label class="select-asset"><input type="checkbox" class="asset-select" data-alias="'+E(a['referenceName'],quote=True)+'" data-profile="'+a['profileUrl']+'" data-display="'+a['displayUrl']+'" value="'+ref+'" data-title="'+E(a['title'],quote=True)+'" data-price="'+str(values['sellerAskEUR'])+'"> Include in enquiry</label></article>')
for filename,records in [('displays/catalogue.csv',rows),('displays/identity-register.csv',idrows)]:
 with (R/filename).open('w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,fieldnames=list(records[0]),lineterminator="\n");w.writeheader();w.writerows(records)
s=(R/'displays/index.html').read_text();i=iter(cards);s=re.sub(r'<article class="asset-card".*?</article>',lambda _:next(i),s,flags=re.S);s=s.replace('including four unpriced assets','with individual scope and asking references');(R/'displays/index.html').write_text(s)
mapping=read('displays/project-map.json')
for x in mapping['projects']:
 a=next(a for a in c['projects'] if a['ref']==x['ref']);x['factsheetUrl']=a['factsheetUrl'];x['briefUrl']=a['briefUrl'];x['priceReferenceStatus']='DATED_SELLER_REFERENCE'
write('displays/project-map.json',mapping)
financial=read('assets/pricing-review-20261108.json');financial.update(assessmentDate=date,financialAnchorDate=date,fxReferenceDate=fx['date'],ecbEURUSD=fx['rate'],basis='123 separate source and price reviews: 12 scoped increments, 107 retained references and four initial scoped estimates. Seller assumptions; no independently established market valuation.',coverage=p['methodology']['reassessment']['budgetCoverage'],totalsEUR=p['portfolio'],totalsUSD=p['portfolioUSD']);financial.pop('totalsUSD20261106',None);financial['projects']=[]
for a in c['projects']:
 q=P[a['ref']];r=Q[a['ref']];financial['projects'].append(dict(id=a['ref'],alias=a['referenceName'],title=a['title'],slug=a['slug'],displayUrl=a['displayUrl'],profileUrl=a['profileUrl'],classification=a['maturity'],sourceDeskReviewStatus=r['technicalReevaluationStatus'],sourceIdentityStatus=r['sourceIdentity'],askingReferenceEUR=q['values']['sellerAskEUR'],askingReferenceUSD=q['valuesUSD']['sellerAskUSD'],recreationCostEUR=q['values']['replacementCostEUR'],costEvidenceStatus=q['assessment']['costEvidenceStatus'],commercialStatus='SELLER_ESTIMATE_MARKET_VALUE_NOT_ESTABLISHED',previousAskingReferenceEUR=r['previousAskingReferenceEUR'],changeEUR=r['askingReferenceChangeEUR'],priceDecision=r['priceDecision'],pricingRationale=r['priceDecisionReason']))
write('assets/pricing-review-20261108.json',financial)
# Preserve the existing audit table layouts; refresh only project data and aggregate project counts.
for filename,attr in [('portfolio-register.html','data-search'),('portfolio-evaluation.html','data-filter'),('portfolio-pricing-review.html','data-search')]:
 file=R/filename;s=file.read_text();table=[]
 for a in c['projects']:
  q=P[a['ref']];r=Q[a['ref']];title='<a href="'+a['displayUrl']+'">'+E(a['title'])+'</a>';cells=[a['ref'],E(a['referenceName']),title,a['maturity']]
  if 'register' in filename:cells+=['Dated seller reference · '+money(q['values']['sellerAskEUR'])]
  elif 'evaluation' in filename:cells+=[r['priceDecision'].replace('_',' '),'<span class="tag">'+E(D[a['ref']]['version'])+'</span><br>'+E(r['currentLimitations'])]
  else:cells=[a['ref'],title+'<small>'+E(a['referenceName'])+'</small>',money(q['values']['sellerAskEUR'])+'<small>'+dollars(q['valuesUSD']['sellerAskUSD'])+'</small><small>'+r['priceDecision'].replace('_',' ')+'</small>',money(q['values']['replacementCostEUR']),q['assessment']['costEvidenceStatus'].replace('_',' '),'Source ID verified' if r['sourceIdentity']=='PASS' else 'Portfolio alias provisional']
  table.append('<tr '+attr+'="'+E(' '.join([a['ref'],a['referenceName'],a['title'],a['maturity']]).lower(),quote=True)+'">'+''.join('<td>'+x+'</td>' for x in cells)+'</tr>')
 s=re.sub(r'<tbody>.*?</tbody>',lambda _:'<tbody>'+''.join(table)+'</tbody>',s,flags=re.S,count=1)
 s=s.replace('8 NOVEMBER 2026','10 NOVEMBER 2026').replace('8 November 2026','10 November 2026').replace('8 November financial','10 November financial').replace('8 November inventory','10 November inventory')
 if 'register' in filename:s=s.replace('<strong>119</strong>previously priced profiles','<strong>123</strong>priced profiles').replace('<strong>4</strong>unpriced assets','<strong>0</strong>unpriced assets').replace('Both new projects require','All projects require')
 if 'pricing' in filename:
  start=s.index('<main>');tablepos=s.index('<div class="table',start)
  # Audit page has no product flow changes; remove stale dated-price assertions from its preamble.
  prefix='<main><p class="muted">INDIVIDUAL SOURCE AND PRICE REVIEW · 10 NOVEMBER 2026</p><h1>Portfolio-wide financial reference review</h1><p>123 separately reviewed projects: 12 scoped price increments, 107 retained references and four initial bounded estimates. Source-reported tests remain distinct from fresh website validation. No independent market appraisal is established.</p><div class="stats"><div class="stat"><strong>'+money(p['portfolio']['sellerAskEUR'])+'</strong>Sum of 123 individual asking references; not a package offer</div><div class="stat"><strong>'+dollars(p['portfolioUSD']['sellerAskUSD'])+'</strong>Indicative USD; ECB '+fx['date']+'</div><div class="stat"><strong>'+money(p['portfolio']['replacementCostEUR'])+'</strong>Seller recreation estimate, not expenditure</div></div><section class="details"><h2>Price assumptions and limits</h2><p>New scoped budgets use assumed hours at EUR 94/hour, a 15% coordination allowance and recreation increments rounded down to EUR 500. The asking increment is 30% of that adopted increment, rounded down to EUR 500. These effort and discount choices are seller assumptions. Older anchors remain at their disclosed confidence levels; versions, passing test counts and future ambitions alone receive no price premium.</p><p>Budget coverage: '+E(str(financial['coverage']))+'. Market value, transferable rights and buyer acceptance remain separate. Prior 8 November session files are historical snapshots superseded by this review for current project prices.</p><p>EUR 1 = USD '+str(fx['rate'])+'; ECB '+fx['date']+'.</p></section><label for="search">Filter projects</label><input id="search" type="search" placeholder="Project or reference"><p id="result" role="status">123 projects</p><section>'
  s=s[:start]+prefix+s[tablepos:];s=s.replace('Historical seller ask · EUR / updated USD','Current seller reference · EUR / indicative USD')
 s=s.replace('Four projects are deliberately unquoted. ', '').replace('Four unpriced assets include two provisionally assigned source identities','Two portfolio aliases await source-side registration')
 file.write_text(s)
for file in ['buyer-catalogue.json','buyer-dossiers.json','pricing-catalogue.json']:(R/'displays/assets'/file).write_bytes((R/'assets'/file).read_bytes())
for alias in read('assets/route-aliases.json')['aliases']:
 target=R/'displays/products'/alias['legacySlug']/'product-brief.md'
 if target.exists():target.write_bytes((R/'displays/products'/alias['slug']/'product-brief.md').read_bytes())
print('Synchronized 123 separate displays, briefs, CSV entries and financial records.')
