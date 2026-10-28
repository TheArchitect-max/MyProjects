#!/usr/bin/env python3
"""Join asset identities across the catalogue, displays, CSV, PDF and optional source audit."""
from pathlib import Path
from html.parser import HTMLParser
import argparse,csv,json,re
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
class IdentityPage(HTMLParser):
 def __init__(self,text):super().__init__();self.meta={};self.canonical=None;self.body={};self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta' and a.get('name'):self.meta[a['name']]=a.get('content')
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  if tag=='body':self.body=a

def validate(snapshot=None):
 catalogue=json.loads((ROOT/'assets/buyer-catalogue.json').read_text());assets=catalogue['projects'];by_ref={a['ref']:a for a in assets}
 assert len(assets)==len(by_ref)==len({a['referenceName'].casefold() for a in assets})==111
 assert all(re.fullmatch(r'TA-IP-\d{3}',a['ref']) for a in assets)
 assert set(by_ref)=={'TA-IP-'+str(i).zfill(3) for i in range(1,112)},'Asset IDs must be consecutive TA-IP-001 through TA-IP-111'
 mapping=json.loads((ROOT/'displays/project-map.json').read_text())['projects'];maps={a['ref']:a for a in mapping};assert set(maps)==set(by_ref)
 with (ROOT/'displays/identity-register.csv').open(encoding='utf-8-sig',newline='') as f:csv_rows=list(csv.DictReader(f))
 rows={r['Asset_ID']:r for r in csv_rows};assert len(csv_rows)==len(rows)==111 and set(rows)==set(by_ref)
 for a in assets:
  m=maps[a['ref']];r=rows[a['ref']]
  assert (m['title'],m['referenceName'],m['url'],m['profileUrl'])==(a['title'],a['referenceName'],a['displayUrl'],a['profileUrl'])
  assert (r['Canonical_project_title'],r['Feminine_name'],r['Project_display'],r['Asset_dossier'],r['Factsheet_PDF'],r['Product_brief'])==(a['title'],a['referenceName'],a['displayUrl'],a['profileUrl'],a['factsheetUrl'],a['briefUrl'])
  folder=ROOT/'displays/products'/a['slug'];page=IdentityPage((folder/'index.html').read_text())
  assert page.body['data-project-ref']==a['ref'] and page.body['data-project-slug']==a['slug']
  assert page.meta['asset-reference']==a['ref'] and page.meta['asset-alias']==a['referenceName'] and page.meta['asset-dossier']==a['profileUrl']
  assert page.canonical==a['displayUrl'],a['ref']
  brief=(folder/'product-brief.md').read_text();assert a['ref']+' | Reference name: '+a['referenceName'] in brief
  first=PdfReader(folder/'factsheet.pdf').pages[0].extract_text();assert a['ref']+' / '+a['referenceName'] in first,a['ref']
 homepage=(ROOT/'assets/im.js').read_text();assert 'Project displays' in homepage and 'identities.html' in homepage
 assert not re.search(r'bitcoin:|Bitcoin|voluntary contribution',homepage,re.I)
 assert all('location.replace' in (ROOT/name).read_text() and 'acquisition.html' in (ROOT/name).read_text() for name in ['development.html','opportunity.html'])
 sources=json.loads((ROOT/'assets/evaluation-sources.json').read_text());assert len(sources['externalSources'])==13 and len(sources['assessmentRecords'])==7
 source_count=0;unavailable_count=0
 if snapshot:
  audit=json.loads(snapshot.read_text());records=audit['assets'];repo_ids={a['repositoryId'] for a in records}
  assert len(records)==len(repo_ids)==111 and {r['ref'] for r in records}==set(by_ref)
  unavailable=[r for r in records if r.get('currentSourceStatus')=='UNAVAILABLE']
  assert {r['ref'] for r in unavailable}=={'TA-IP-095'},'Only the explicitly retained availability-hold entry may lack current source access'
  unavailable_count=len(unavailable)
  assert len(audit['publicationRepositories'])==3 and audit['repositoryCount']==len(records)-unavailable_count+len(audit['publicationRepositories'])+len(audit.get('uninitializedRepositories',[]))
  assert not audit.get('uninitializedRepositories'), 'Unclassified or uninitialized repositories require review'
  assert len({p['repositoryId'] for p in audit['publicationRepositories']})==3
  assert not repo_ids.intersection(p['repositoryId'] for p in audit['publicationRepositories'])
  editions={p['ref']:p for p in json.loads((ROOT/'assets/buyer-dossiers.json').read_text())['projects']}
  for r in records:
   a=by_ref[r['ref']];i=r['identity']
   assert (i['portfolioReference'],i['canonicalProjectName'],i['feminineReferenceName'])==(a['ref'],a['title'],a['referenceName'])
   assert i['repository']['id']==r['repositoryId'] and i['repository']['fullName']==r['fullName']
   assert i['publicPresentation']=={'profileUrl':a['profileUrl'],'displayUrl':a['displayUrl']}
   assert r['readmeCurrentReferences']==[a['ref']] and r['readmeFeminineName']==a['referenceName']
   assert all(re.fullmatch(r'[0-9a-f]{40}',r[k]) for k in ['headSha','treeSha','identityFileSha','readmeSha'])
   if r.get('packageVersion'):
    assert r['packageVersion'].lower().lstrip('v') in editions[a['ref']]['version'].lower(), (a['ref'],'website edition differs from reviewed source metadata')
   if r.get('currentSourceStatus')=='UNAVAILABLE':
    assert 'unconfirmed' in a['availability'].lower() and r.get('currentSourceCheckedOn')==audit['basisDate']
    assert 'unconfirmed' in ' '.join(a['materialBoundaries']).lower()
    assert any(c['axis']=='transferReadiness' and c['grade']=='T1' for c in editions[a['ref']]['assessmentCriteria'])
   else:source_count+=1
  for p in audit['publicationRepositories']:
   i=p['identity']
   assert i['schema']=='thearchitect-publication-identity-1' and i['repository']['id']==p['repositoryId'] and i['repository']['fullName']==p['fullName']
   assert i['isOfferedIPAsset'] is False and i['portfolioReference'] is None and i['feminineReferenceName'] is None
   assert i['role'] in {'seller-offered-asset-catalogue','project-display-library','confidential-strategic-ip-acquisition-dossier'}
   if p['name'] in ['MyProjects','Projects-Displays']:
    local=ROOT if p['name']=='MyProjects' else ROOT.parent/'Projects-Displays'
    assert json.loads((local/'PUBLICATION_IDENTITY.json').read_text())==i
 return dict(result='PASS',assetIdentities=111,uniqueFeminineNames=111,displayAndDossierLinks=222,pdfIdentitiesChecked=111,briefIdentitiesChecked=111,identityCsvRows=111,sourceRepositoryIdentitiesChecked=source_count,unavailableSourceEntries=unavailable_count,publicationRepositoriesExcludedFromAssetCount=3,consecutiveNumbering=True,identifierGaps=[],legacyContributionRoutesRedirect=True)

if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--repository-snapshot',type=Path);a=p.parse_args();print(json.dumps(validate(a.repository_snapshot),indent=2))
