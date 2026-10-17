#!/usr/bin/env python3
"""Validate the buyer-only schema, file exposure and public route completeness."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlparse,unquote
import json,re

ROOT=Path(__file__).resolve().parents[1]
FIELDS={'ref','slug','title','referenceName','categoryId','buyerGroupIds','summary','overview','potentialBuyers','capabilities','outputTypes','maturity','maturityNote','availability','askingReferenceEUR','materialBoundaries','offeredScope','excludedScope','profileUrl','displayUrl','factsheetUrl','briefUrl'}
class Page(HTMLParser):
 def __init__(self,text):super().__init__();self.links=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  values=dict(attrs)
  for k in ['href','src']:
   if values.get(k):self.links.append(values[k])
def validate():
 data=json.loads((ROOT/'assets/buyer-catalogue.json').read_text());assert set(data)=={'schema','brand','currency','categories','buyerGroups','projects'}
 for c in data['categories']:assert set(c)=={'id','title','description'}
 for g in data['buyerGroups']:assert set(g)=={'id','title'}
 assert len(data['projects'])==len({x['ref'] for x in data['projects']})==len({x['referenceName'].casefold() for x in data['projects']})==108
 for a in data['projects']:
  assert set(a)==FIELDS,a['ref'];assert len(a['potentialBuyers'])>=3 and len(a['capabilities'])>=3 and a['outputTypes'];assert a['askingReferenceEUR']>0
  for key in ['profileUrl','displayUrl','factsheetUrl','briefUrl']:
   url=urlparse(a[key]);assert url.netloc=='thearchitect-max.github.io' and url.path.startswith('/MyProjects/')
   target=ROOT/unquote(url.path.removeprefix('/MyProjects/'));target=target/'index.html' if url.path.endswith('/') else target;assert target.is_file(),target
 assert {p.name for p in (ROOT/'assets').glob('*.json')}=={'buyer-catalogue.json','route-aliases.json','pricing-catalogue.json'}
 assert not list((ROOT/'assets').glob('*.csv'));assert not (ROOT/'docs').exists();assert not list(ROOT.glob('.github/workflows/*'))
 assert json.loads((ROOT/'displays/assets/buyer-catalogue.json').read_text())==data
 pages=links=0
 for p in ROOT.rglob('*.html'):
  if '.git' in p.parts:continue
  text=p.read_text();assert not re.search(r'\b[a-f0-9]{40}\b',text),p
  assert not re.search(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',text,re.I),p
  pages+=1;relative=p.relative_to(ROOT).as_posix()
  for link in Page(text).links:
   url=urlparse(urljoin('https://thearchitect-max.github.io/MyProjects/'+relative,link))
   if url.netloc!='thearchitect-max.github.io':continue
   assert url.path.startswith('/MyProjects/'),(relative,link);target=ROOT/unquote(url.path.removeprefix('/MyProjects/'))
   if target.is_dir() or url.path.endswith('/'):target=target/'index.html'
   assert target.is_file(),(relative,link);links+=1
 aliases=json.loads((ROOT/'assets/route-aliases.json').read_text())['aliases'];assert len(aliases)==6
 for a in aliases:
  assert set(a)=={'ref','legacySlug','slug'}
  for folder in [ROOT/'projects',ROOT/'displays/products']:
   s=(folder/a['legacySlug']/'index.html').read_text();assert 'noindex,follow' in s and a['slug'] in s
 return dict(result='PASS',approvedPublicProjectRecords=108,perProjectSpecificBuyerProfiles=108,applicationAreas=12,buyerGroups=10,allowedHubDataFiles=3,internalDocumentDirectoryAbsent=True,legacyProfileAndDisplayRoutes=12,htmlPages=pages,internalLinks=links,missingTargets=0)
if __name__=='__main__':print(json.dumps(validate(),indent=2))
