#!/usr/bin/env python3
"""Cross-check current project publications and preserve the approved non-project UI."""
from pathlib import Path
import json,re,subprocess
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];BASE='16828b202e80f4a48867418702115fd990d803dc'
def load(f):return json.loads((R/f).read_text())
def original(f):return subprocess.check_output(['git','show',BASE+':'+f],cwd=R)
c=load('assets/buyer-catalogue.json');p={x['ref']:x for x in load('assets/pricing-catalogue.json')['projects']};d={x['ref']:x for x in load('assets/buyer-dossiers.json')['projects']};q=load('assets/portfolio-reassessment-20261107.json')
# Preserve all established stylesheet bytes, artwork/audio and contribution interaction code.
files=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=R,text=True).splitlines();protected=[f for f in files if f.endswith(('.css','.mp3','.jpg','.jpeg','.png','.webp','.svg')) or f in ['assets/audio-player.js','displays/assets/exhibition.js']]
for f in protected:assert (R/f).read_bytes()==original(f),('Unrelated presentation change',f)
a=(R/'assets/im.js').read_text();b=original('assets/im.js').decode()
def fn(s,name):
 m=re.search(r'^function '+re.escape(name)+r'\(',s,re.M);assert m,name
 end=re.search(r'^(?:async )?function |^const [A-Z_]+=',s[m.end():],re.M)
 return s[m.start():m.end()+end.start()] if end else s[m.start():]
for name in ['nav','policy','notice','contributionPage','bindContribution','transferPage','transactionPage']:assert fn(a,name)==fn(b,name),name
assert 'Updated private asset inventory' not in a # no added banner or navigation layout
pdfs=0
for x in c['projects']:
 path=R/'displays/products'/x['slug'];pdf=PdfReader(path/'factsheet.pdf');assert len(pdf.pages)==4,x['ref'];pages=[p.extract_text() for p in pdf.pages];text='\n'.join(pages)
 assert all(len(page)>200 for page in pages),x['ref'];assert x['ref']+' / '+x['referenceName'] in pages[0];assert d[x['ref']]['version'] in text;assert '2026-11-10' in text and '1.1214' in text
 for value in p[x['ref']]['values'].values():assert f'{value:,}' in text,(x['ref'],value)
 assert d[x['ref']]['sellerConditions'][0] in re.sub(r'\s+',' ',text),(x['ref'],'PDF condition')
 display=(path/'index.html').read_text();assert not re.search(r'data-source-price-session=|id="source-price-session-',display);assert 'data-asset-enquiry' in display
 pdfs+=1
assets_by_ref={asset['ref']:asset for asset in c['projects']}
for connection in load('assets/application-combinations.json')['connections']:
 for member in connection['members']:
  asset=assets_by_ref[member['ref']]
  display=(R/'displays/products'/asset['slug']/'index.html').read_text()
  assert 'connections.html#'+connection['slug'] in display,member['ref']
collection=(R/'displays/index.html').read_text();assert len(re.findall(r'class="asset-select"',collection))==123;assert len(re.findall(r'class="card-cost"',collection))==123
for x in load('assets/route-aliases.json')['aliases']:
 for f in ['factsheet.pdf','product-brief.md']:
  dst=R/'displays/products'/x['legacySlug']/f
  if dst.exists():assert dst.read_bytes()==(R/'displays/products'/x['slug']/f).read_bytes()
assert sum(x['askingReferenceChangeEUR'] for x in q['assessments'])==95000
assert sum(x['askingReferenceEUR'] for x in c['projects'])==25153000
print(json.dumps({'result':'PASS','currentFactsheets':pdfs,'pdfPagesChecked':4*pdfs,'protectedPresentationFiles':len(protected),'preservedNavigationAndNonProjectFunctions':7,'enquirySelectionControls':123,'askingReferenceIncreaseEUR':95000,'underlyingPrivateProductsRerun':False},indent=2))
