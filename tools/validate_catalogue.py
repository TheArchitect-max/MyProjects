#!/usr/bin/env python3
"""Check canonical project identity, route continuity and register integrity."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, unquote
import argparse, hashlib, json

ROOT=Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.links=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        for key in ['href','src']:
            if attrs.get(key):self.links.append(attrs[key])

def load(name):return json.loads((ROOT/'assets'/name).read_text())

def validate():
    identities=load('project-identities.json')['projects']
    by_ref={x['ref']:x for x in identities}
    assert len(by_ref)==len(identities)==105
    assert len({x['repository'] for x in identities})==105
    assert len({x['repositoryId'] for x in identities})==105
    assert len({x['slug'] for x in identities})==105
    for name in ['project-presentations.json','project-evaluations.json','seller-readiness-register.json','ip-ownership-register.json','software-supply-chain-summary.json','rights-transfer-register.json','future-economic-references.json']:
        data=load(name)['projects'];assert len(data)==105,name
        for x in data:
            assert x['ref'] in by_ref and x['slug']==by_ref[x['ref']]['slug'],(name,x['ref'])
            if 'title' in x:assert x['title']==by_ref[x['ref']]['title'],(name,x['ref'],'title')
    presents={x['ref']:x for x in load('project-presentations.json')['projects']}
    for p in load('repository-inventory.json')['projects']:
        identity=by_ref[p['ref']]
        assert p['repository']==identity['repository']
        assert p['repositoryId']==identity['repositoryId']
        assert p['sourceHead']==presents[p['ref']]['defaultBranchBaselineCommit']
        assert p['readmeBlobSha']==presents[p['ref']]['catalogueSourceReview']['readmeBlobSha']
        assert p['freshLocalTestsPerformed'] is False
    attest=load('public-attestation.json')
    for name,record in attest['files'].items():
        content=(ROOT/'assets'/name).read_bytes()
        assert hashlib.sha256(content).hexdigest()==record['sha256'],name
        assert len(content)==record['bytes'],name
    aliases=load('project-route-aliases.json')['aliases']
    assert len(aliases)==5
    for a in aliases:
        assert by_ref[a['ref']]['slug']==a['slug']
        for parent in [ROOT/'projects',ROOT/'displays/products']:
            text=(parent/a['legacySlug']/'index.html').read_text()
            assert 'data-legacy-project-ref="'+a['ref']+'"' in text
            assert 'noindex,follow' in text and '/'+a['slug']+'/' in text
            assert 'location.search+location.hash' in text
    links=0;pages=0
    for path in ROOT.rglob('*.html'):
        if '.git' in path.parts:continue
        pages+=1
        rel=path.relative_to(ROOT).as_posix()
        for link in Page(path.read_text()).links:
            url=urlparse(urljoin('https://thearchitect-max.github.io/MyProjects/'+rel,link))
            if url.netloc!='thearchitect-max.github.io':continue
            assert url.path.startswith('/MyProjects/'),(rel,link)
            target=ROOT/unquote(url.path.removeprefix('/MyProjects/'))
            if target.is_dir() or url.path.endswith('/'):target=target/'index.html'
            assert target.is_file(),(rel,link,'missing target')
            links+=1
    assert not list(ROOT.glob('.github/workflows/*'))
    assert by_ref['TA-IP-083']['repository']=='Adaptive-Systems-Intelligence-Platform'
    assert by_ref['TA-IP-096']['repository']=='Plantelogia-Intelligence-Platform'
    return {'projectIdentities':105,'crossRegisters':8,'publicFingerprints':len(attest['files']),'legacyProjectRoutes':5,'legacyDisplayRoutes':5,'htmlPages':pages,'internalLinks':links,'missingTargets':0,'newWorkflows':0,'result':'PASS'}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path);args=parser.parse_args()
    result=validate();text=json.dumps(result,indent=2)+'\n'
    if args.output:args.output.write_text(text)
    print(text,end='')
