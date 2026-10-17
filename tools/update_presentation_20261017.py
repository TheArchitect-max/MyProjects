#!/usr/bin/env python3
"""Synchronize the complete static exhibition and current hub presentation."""
from pathlib import Path
from html import escape
import csv, importlib.util, json, re, shutil

ROOT=Path(__file__).resolve().parents[1];DISPLAY=ROOT.parent/'Projects-Displays';AS=ROOT/'assets'
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/update_portfolio_20261017.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
AT=review.AT;DATE=review.DATE;DOC=review.DOC;OLD=review.OLD_SLUG;NEW=review.NEW_SLUG
HUB='https://thearchitect-max.github.io/MyProjects/'
def j(p):return json.loads(p.read_text())
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def sections(t):
 a=re.split(r'^## (.+)$',t,flags=re.M);return {a[i].strip():a[i+1].strip() for i in range(1,len(a),2)}
def ul(xs):return '<ul>'+''.join('<li>'+escape(x)+'</li>' for x in xs)+'</ul>'

def main():
 identities=j(AS/'project-identities.json')['projects'];pres={p['ref']:p for p in j(AS/'project-presentations.json')['projects']};values={p['ref']:p for p in j(AS/'valuation-register.json')['updates']};sources={p['ref']:p for p in j(AS/'valuation-sources.json')['projects']};ready={p['ref']:p for p in j(AS/'seller-readiness-register.json')['projects']};families=j(AS/'portfolio-structure.json')['families'];fam={slug:f for f in families for slug in f['assets']}
 # Profile shells and continuity redirects.
 template=(ROOT/'projects/manuscript-integrity-publishing-platform/index.html').read_text()
 for i in identities:
  if i['ref'] not in review.CONFIG:continue
  folder=ROOT/'projects'/i['slug'];folder.mkdir(exist_ok=True)
  shell=re.sub(r'<title>.*?</title>', '<title>'+escape(i['title'])+' · '+i['ref']+' — THEARCHITECT_MAX</title>',template)
  (folder/'index.html').write_text(shell)
 alias_template=(ROOT/'projects/ossn-uap/index.html').read_text().replace('TA-IP-001','TA-IP-025').replace('modular-aerospace-research-platform',NEW).replace('Modular Aerospace Research Platform',review.NEW_TITLE)
 (ROOT/'projects'/OLD/'index.html').write_text(alias_template)
 old_folder=DISPLAY/'products'/OLD;new_folder=DISPLAY/'products'/NEW
 if not new_folder.exists():shutil.copytree(old_folder,new_folder)
 display_alias=(DISPLAY/'products/ossn-uap/index.html').read_text().replace('TA-IP-001','TA-IP-025').replace('modular-aerospace-research-platform',NEW).replace('Modular Aerospace Research Platform',review.NEW_TITLE)
 (old_folder/'index.html').write_text(display_alias)
 # Rebuild current display content from the editable, product-specific briefs.
 oldmap=j(DISPLAY/'project-map.json');oldby={p['ref']:p for p in oldmap['projects']};mapping=[];catalogue=[];source_rows=[];cards=[]
 page_template=(DISPLAY/'products/stabilitymesh/index.html').read_text();header=re.search(r'<header.*?</header>',page_template,re.S)[0];footer=re.search(r'<footer.*?</footer>',page_template,re.S)[0];dialog=re.search(r'<dialog.*?</dialog>',page_template,re.S)[0]
 for i in sorted(identities,key=lambda x:x['title'].lower()):
  ref=i['ref'];slug=i['slug'];p=pres[ref];v=values[ref];s=sources[ref];r=ready[ref];f=fam[slug];c=review.CONFIG.get(ref);isnew=c and 'id' in c
  folder=DISPLAY/'products'/slug;folder.mkdir(parents=True,exist_ok=True);path=folder/'product-brief.md'
  if isnew:
   sec={'Product overview':c['finding'],'Documented functions':'\n'.join('- '+x for x in c['functions']),'Potential buyers':'\n'.join('- '+x for x in c['buyers']),'Documented output types':'\n'.join('- '+x for x in c['outputs'])}
  else:sec=sections(path.read_text())
  code_note=p.get('localVerification',{});checks=c['evidence'] if c else 'The main source is unchanged from the preceding directory review. Existing product qualification retains its source and execution date; tests were not rerun for this project.'
  status='Current main baseline: '+(p.get('currentVersion') or 'No semantic release version established')+'.\n\n'
  if p.get('developmentVersion'):status+='Separate development: '+p['developmentVersion']+'.\n\n'
  status+=p['statusNote']+'\n\n'
  if c:status+='Material limitations: '+c['limitation']+'\n\nNext qualification step: '+c['next']+'\n\n'
  status+='Documentation checked: 17 October 2026. '+checks
  sec['Status and limitations']=status
  financial='Financial-reference review: 17 October 2026. '+s['decisionNote']+' Original financial-reference date: '+str(s['financialReference']['originalReferenceReviewedAt'])[:10]+'.'
  sec['Individual financial-reference review']=financial+'\n\nComparable-sale valuation, project-income valuation and independent appraisal are NOT_ESTABLISHED. WIPO and contractor-rate publishers provide method/rate context; source-specific effort and seller asking choices are assumptions.'
  if c:
   b=p['lowCostReview']['budget'];sec['Individual financial-reference review']+='\n\nLowest scoped working scenario: '+str(b['assumedHours'])+' assumed hours × EUR 94/hour, plus 15%, rounded down to EUR 500. This is not logged time, expenditure or an absolute cost floor. '+('Previous base is retained once; this budget covers only the implemented increment.' if not isnew else 'This budget covers only the present first-party prototype.')
  sec['Commercial reference']=f"Seller asking reference: EUR {v['sellerAskEUR']:,}.\n\nSeller-estimated recreation cost: EUR {v['replacementCostEUR']:,}.\n\nAll 108 project source and financial-reference decisions were reviewed on 17 October 2026. Three new project estimates and two implementation increments are separately disclosed; 103 preceding individual amounts are retained. Market value remains undetermined. Final scope, consideration and taxes require separate agreement."
  sec.setdefault('Transaction scope','AS IS acquisition of specifically agreed first-party software and transferable documentation. The definitive written agreement defines exact source, rights and recipient acceptance. Third-party rights, user/customer content, physical objects, credentials, future work and hosted operations are excluded unless expressly agreed.')
  sec['Source basis']=f"- {ref}-P: source-frozen product documentation, 17 October 2026.\n- {ref}-C: individual cost/reference decision, 17 October 2026.\n- {ref}-A: seller handover review, {r['assessmentDate']}.\n\n{checks}"
  sec.setdefault('Acquisition enquiry','State the project title and reference, intended use and requested delivery perimeter. Review and close the transaction separately under definitive written terms.')
  path.write_text('# '+i['title']+'\n\n'+ref+' | Reference alias: '+i['identityName']+' | '+f['name']+'\n\nBuyer-facing edition: 17 October 2026\n\n'+p['description']+'\n\n'+''.join('## '+k+'\n\n'+value+'\n\n' for k,value in sec.items()))
  def bullets(k):return [x[2:] for x in sec[k].splitlines() if x.startswith('- ')]
  profile=HUB+'projects/'+slug+'/'
  price='EUR '+format(v['sellerAskEUR'],',');cost='EUR '+format(v['replacementCostEUR'],',')
  status_html='<dl class="status-grid"><div><dt>Current main baseline</dt><dd>'+escape(p.get('currentVersion') or 'Unversioned')+'</dd></div><div><dt>Documentation reviewed</dt><dd>17 October 2026</dd></div>'+(('<div><dt>Separate development</dt><dd>'+escape(p['developmentVersion'])+'</dd></div>') if p.get('developmentVersion') else '')+'</dl><p>'+escape(p['statusNote'])+'</p><p class="small">'+escape(checks)+'</p>'
  commercial='<div class="economics-grid"><div><span>Seller asking reference</span><strong>'+price+'</strong><small>Separate seller transaction choice</small></div><div><span>Estimated recreation cost</span><strong>'+cost+'</strong><small>Seller cost-method working reference</small></div></div><p class="small">'+escape(sec['Commercial reference'].split('\n\n')[-1])+'</p><div class="boundary-box" data-valuation-review="'+ref+'"><h3>Individual financial-reference review</h3><p>'+escape(financial)+'</p><p>Market and income value remain undetermined. <a href="'+profile+'#valuation-review">Inspect the source and cost decision.</a></p></div><h3>Offered transaction</h3><p>'+escape(sec['Transaction scope'].split('\n\n')[0])+'</p><div class="hero-actions"><button class="button" data-asset-enquiry data-ref="'+ref+'" data-title="'+escape(i['title'],quote=True)+'" data-price="'+str(v['sellerAskEUR'])+'">Prepare acquisition enquiry ↗</button><a class="text-link" href="../../acquisition.html">Acquisition process</a></div>'
  if isnew:
   body='<section class="product-hero"><div class="hero-copy"><p class="eyebrow">'+ref+' / '+escape(i['identityName'])+' / INDEPENDENT SOFTWARE IP</p><h1>'+escape(i['title'])+'</h1><p class="lede">'+escape(p['description'])+'</p><div class="hero-actions"><a class="button" href="factsheet.pdf" download>Download factsheet ↓</a><a class="button secondary" data-project-profile href="'+profile+'">View project profile ↗</a></div></div></section>'
   for id_,num,title,content in [('product','01','Product overview','<p>'+escape(sec['Product overview'])+'</p>'),('scope','02','Documented functions',ul(bullets('Documented functions'))),('fit','03','Potential buyer fit',ul(bullets('Potential buyers'))+'<h3>Documented output types</h3>'+ul(bullets('Documented output types'))),('status','04','The present position',status_html),('acquire','05','The commercial perimeter',commercial)]:
    body+='<section id="'+id_+'" class="split-section"><div><p class="eyebrow">'+num+' / '+title.upper()+'</p><h2>'+title+'</h2></div><div>'+content+'</div></section>'
   body+='<section class="source-strip"><p><strong>Sources for this page</strong></p><p>'+ref+'-P / '+ref+'-C / '+ref+'-A. See the <a href="../../sources.html">source register</a>.</p><a href="product-brief.md" download>Download editable brief</a></section>'
   html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(i['title'])+' · '+ref+'</title><link rel="stylesheet" href="../../assets/exhibition.css?v=20261017"></head><body data-project-ref="'+ref+'" data-project-slug="'+slug+'" style="--accent:#c5a46d">'+header+'<main>'+body+'</main>'+footer+dialog+'<script src="../../assets/exhibition.js?v=20261017" defer></script></body></html>'
  else:
   html=(folder/'index.html').read_text().replace('Sensor Fusion Digital Twin Engine',review.NEW_TITLE).replace(OLD,NEW)
   html=re.sub(r'(<section id="status"[^>]*>).*?</section>',lambda m:m[1]+'<div><p class="eyebrow">04 / STATUS &amp; BOUNDARIES</p><h2>The present position</h2></div><div>'+status_html+'</div></section>',html,flags=re.S)
   html=re.sub(r'(<section id="acquire"[^>]*>).*?</section>',lambda m:m[1]+'<div><p class="eyebrow">05 / AS IS ACQUISITION</p><h2>The commercial perimeter</h2></div><div>'+commercial+'</div></section>',html,flags=re.S)
  html=html.replace('16 October 2026','17 October 2026').replace('16 OCTOBER 2026','17 OCTOBER 2026')
  (folder/'index.html').write_text(html)
  mapped={**oldby.get(ref,{}),**dict(ref=ref,title=i['title'],slug=slug,displaySlug=slug,productPage='products/'+slug+'/index.html',url=HUB+'displays/products/'+slug+'/',profileUrl=profile,hubUrl=HUB,sellerAskEUR=v['sellerAskEUR'],recreationCostEUR=v['replacementCostEUR'],currentVersion=p.get('currentVersion'),developmentVersion=p.get('developmentVersion'),sourceReviewedAt=AT,financialReferencesReviewedAt=AT,costEvidenceStatus=s['costEvidence']['status'],originalFinancialReferenceReviewedAt=s['financialReference']['originalReferenceReviewedAt'])}
  if c:mapped['pricedVersion']=c['version'];mapped['pricedSourceHead']=p['lowCostReview']['pricedSourceHead']
  mapping.append(mapped)
  catalogue.append({'Asset reference':ref,'Product':i['title'],'Reference alias':i['identityName'],'Application area':f['name'],'Documented scope':p['statusLabel'],'Reported baseline':p.get('currentVersion') or 'No semantic release version established','Seller ask EUR':v['sellerAskEUR'],'Estimated recreation cost EUR':v['replacementCostEUR'],'Seller handover record':'Handover subject to conditions' if r['transactionReadiness']=='READY_WITH_CONDITIONS' else 'Handover evidence incomplete','Handover record date':r['assessmentDate'],'Product page':mapped['productPage'],'Factsheet PDF':'products/'+slug+'/factsheet.pdf','Editable brief':'products/'+slug+'/product-brief.md'})
  source_rows.extend([[ref+'-P',ref,'Current source documentation',DATE,p.get('currentVersion') or 'Unversioned','Current main and separate candidates; described functionality only'],[ref+'-C',ref,'Individual cost/reference decision',DATE,'Cost-method seller estimate',s['decisionNote']],[ref+'-A',ref,'Seller readiness record',r['assessmentDate'],r['transactionReadiness'],'Separate dated rights, evidence and recipient-acceptance conditions']])
  search=' '.join([i['title'],i['identityName'],ref,p['description'],sec['Product overview'],*bullets('Documented functions')]).lower()
  cards.append('<article class="asset-card" data-name="'+escape(i['title'].lower(),quote=True)+'" data-search="'+escape(search,quote=True)+'" data-family="'+f['id']+'" data-stage="'+escape(p['statusLabel'],quote=True)+'" data-price="'+str(v['sellerAskEUR'])+'" style="--accent:#c5a46d"><div class="card-top"><span>'+ref+'</span><span>'+escape(i['identityName'])+'</span></div><p class="card-family">'+escape(f['name'])+'</p><h3>'+escape(i['title'])+'</h3><p class="card-description">'+escape(p['description'])+'</p><div class="card-bottom"><span class="stage">'+escape(p['statusLabel'])+'</span><strong>'+price+'</strong></div><a class="card-link" href="products/'+slug+'/index.html">Explore asset ↗</a><label class="select-asset"><input type="checkbox" class="asset-select" value="'+ref+'" data-title="'+escape(i['title'],quote=True)+'" data-price="'+str(v['sellerAskEUR'])+'"> Include in enquiry</label></article>')
 save(DISPLAY/'project-map.json',dict(version='displays5-full-review-20261017',updatedAt=AT,hubUrl=HUB,displayBaseUrl=HUB+'displays/',projectCount=108,projects=mapping))
 with (DISPLAY/'catalogue.csv').open('w',newline='',encoding='utf-8-sig') as file:
  w=csv.DictWriter(file,fieldnames=list(catalogue[0]),lineterminator='\n');w.writeheader();w.writerows(catalogue)
 with (DISPLAY/'source-register.csv').open('w',newline='',encoding='utf-8-sig') as file:
  w=csv.writer(file,lineterminator='\n');w.writerow(['Source ID','Asset reference','Source role','Review date','Basis','Boundary']);w.writerows(source_rows)
 index=(DISPLAY/'index.html').read_text();index=re.sub(r'(<div[^>]*id="asset-grid"[^>]*>).*?(?=</div><noscript>)',lambda m:m[1]+''.join(cards),index,flags=re.S)
 if 'TA-IP-109' not in index:
  index=re.sub(r'(<div class="asset-grid"[^>]*>).*?(?=</div><noscript>)',lambda m:m[1]+''.join(cards),index,flags=re.S)
 assert index.count('class="asset-card"')==108,'Collection grid replacement failed'
 index=re.sub(r'\b105\b','108',index).replace('16 October 2026','17 October 2026');(DISPLAY/'index.html').write_text(index)
 for file in [DISPLAY/'methodology.html',DISPLAY/'sources.html']:
  text=file.read_text().replace('105','108').replace('16 October 2026','17 October 2026')
  paragraph='<section class="source-strip"><h2>17 October complete reevaluation</h2><p>108 source and cost decisions; three new estimates, two new implementation increments and 103 retained existing amounts. New budgets select the explicit low-effort scenario at EUR 94/hour plus 15%, rounded down. Earlier legacy anchors retain their disclosed limitations. Market value remains undetermined. Four exact-source local suites and one static suite were run; other qualification dates remain separate.</p><a href="'+HUB+'valuation.html">Review all current assumptions</a></section>'
  text=text.replace('</main>',paragraph+'</main>');file.write_text(text)
 # Current sitemaps enumerate each canonical profile/display once.
 for parent,urls in [(ROOT,[HUB+x for x in ['','portfolio.html','valuation.html','proof.html','assurance.html','connections.html','development.html','policy.html']]+[HUB+'projects/'+p['slug']+'/' for p in identities]),(DISPLAY,[HUB+'displays/']+[p['url'] for p in mapping])]:
  (parent/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+escape(u)+'</loc><lastmod>'+DATE+'</lastmod></url>' for u in urls)+'</urlset>\n')
 # PDF generator edition is part of the same reviewed publication.
 pdf=DISPLAY/'tools/build_factsheets.py';text=pdf.read_text().replace('16 OCTOBER 2026','17 OCTOBER 2026').replace('16 October 2026','17 October 2026').replace('Product tests were not rerun.','Local checks are disclosed per project; see the exact source receipt and retained qualification scope.');pdf.write_text(text)
 for repo in [ROOT,DISPLAY]:
  readme=repo/'README.md';text=readme.read_text();prefix='# THEARCHITECT_MAX — '+('Private Technology & IP Portfolio' if repo==ROOT else 'Projects Displays')+'\n\n## Complete portfolio reevaluation — 17 October 2026\n\n110 repositories reconcile to 108 independent software projects and two publication sources. Three new projects receive TA-IP-107 / Vesta, TA-IP-108 / Asteria and TA-IP-109 / Scheherazade. TA-IP-025 retains Artemis through its canonical repository/title/route migration. All 108 project, source, financial and handover records are reconciled; 246 exact source files from five projects were verified. Four local suites and one static suite were executed.\n\nCurrent seller asking references: EUR 24,676,000. Recreation references: EUR 105,130,000. Three new low-effort estimates and two implemented increments are disclosed; 103 existing amounts and all earlier nine increments are retained once. Market value remains undetermined. New low-effort scenarios are assumptions, not absolute cost floors or actual expenditure.\n\n[Read the complete review]('+ (DOC if repo==ROOT else HUB+'docs/PORTFOLIO_REEVALUATION_2026-10-17.md')+').\n\nThe records below are dated historical publication states.\n\n---\n\n'
  readme.write_text(prefix+text)
 print('Synchronized 108 product briefs, displays, collection cards and map records.')

if __name__=='__main__':main()
