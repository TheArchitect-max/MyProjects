#!/usr/bin/env python3
"""Build public buyer-page shells and maintain established asset routes."""
from pathlib import Path
from html import escape
import json

ROOT=Path(__file__).resolve().parents[1]
BASE='https://thearchitect-max.github.io/MyProjects/'
def shell(title,summary,canonical):
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#070604"><meta name="color-scheme" content="dark"><title>'+escape(title)+' — THEARCHITECT_MAX</title><meta name="description" content="'+escape(summary,quote=True)+'"><meta property="og:title" content="'+escape(title,quote=True)+'"><meta property="og:description" content="'+escape(summary,quote=True)+'"><meta property="og:type" content="website"><link rel="canonical" href="'+canonical+'"><link rel="stylesheet" href="/MyProjects/assets/im4.css?v=im36"><link rel="stylesheet" href="/MyProjects/assets/buyer-showroom.css?v=showroom4sources"></head><body><div id="app"><main id="main"><section class="page-hero"><div class="shell"><p class="eyebrow">THEARCHITECT_MAX</p><h1>Software IP acquisition catalogue.</h1><p>Review independent assets, their purpose and buyer information.</p></div></section></main></div><script src="/MyProjects/assets/pricing-math.js?v=calc1" defer></script><script src="/MyProjects/assets/im.js?v=showroom4-connections-sources-20261017" defer></script><script src="/MyProjects/assets/audio-player.js?v=music3" defer></script><noscript><p><a href="/MyProjects/displays/">Open the complete project presentation collection</a></p></noscript></body></html>\n'
def redirect(url,ref=''):
 script='const u=new URL('+json.dumps(url)+',location.href);u.search=location.search;u.hash=location.hash;location.replace(u.href);'
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="'+url+'"><title>IP acquisition catalogue</title></head><body data-legacy-project-ref="'+ref+'"><p><a href="'+url+'">Continue to the acquisition catalogue</a></p><script>'+script+'</script></body></html>\n'
def main():
 data=json.loads((ROOT/'assets/buyer-catalogue.json').read_text());urls=[]
 pages={'index.html':('Software IP acquisition catalogue','Independent software IP assets organised by application and potential buyer.'),'portfolio.html':('IP collection','Browse software assets by application, buyer type, purpose and current offered scope.'),'proof.html':('Calculation validation','Reproduce all pricing calculations, USD conversions, cost budgets and portfolio totals.'),'valuation.html':('Prices & sources','Complete asking references, recreation estimates, negotiation ranges, economic scenarios and their source register.'),'buyers.html':('Buyer fit','Explore software IP relevant to your organisation and intended acquisition.'),'acquisition.html':('Acquisition','Review the work product, agree the rights and define a separate acquisition.'),'policy.html':('Terms & disclosure','Public buyer information, acquisition scope and disclosure boundaries.'),'development.html':('Voluntary contribution','Optional support, independent from any acquisition or entitlement.'),'notice.html':('Copyright notice','Rights in the public showroom and underlying software remain reserved.')}
 pages.update({'connections.html':('Connections','Find proposed project workflows by application, participating asset and buyer objective.'),'sources.html':('Evaluation sources','External references, assessment records and per-asset source mapping used in the evaluation.'),'assurance.html':('Acquisition evidence profiles','Product editions, qualification, rights and handover conditions for all assets.'),'evidence.html':('Evidence & diligence','Review technical, legal and commercial evidence for your acquisition.'),'transfer.html':('Rights & delivery','Define first-party rights, component obligations and recipient acceptance.'),'transaction.html':('Acquisition process guide','Prepare a defined AS IS acquisition and documented handover.'),'commercialization.html':('Applications & buyer fit','Compare asset applications and potential acquirer profiles.'),'opportunity.html':('Acquisition & voluntary contribution','Two independent routes with defined terms.')})
 for name,(title,summary) in pages.items():
  url=BASE+('' if name=='index.html' else name);(ROOT/name).write_text(shell(title,summary,url));urls.append(url)
 for a in data['projects']:
  folder=ROOT/'projects'/a['slug'];folder.mkdir(exist_ok=True);(folder/'index.html').write_text(shell(a['title']+' · '+a['ref'],a['summary'],a['profileUrl']));urls.append(a['profileUrl'])
 for a in json.loads((ROOT/'assets/route-aliases.json').read_text())['aliases']:
  (ROOT/'projects'/a['legacySlug']/'index.html').write_text(redirect(BASE+'projects/'+a['slug']+'/',a['ref']))
 aliases={'updates.html':'portfolio.html'}
 for name,target in aliases.items():(ROOT/name).write_text(redirect(BASE+target))
 (ROOT/'404.html').write_text(shell('IP collection','Find a project in the acquisition catalogue.',BASE+'portfolio.html'))
 (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+escape(u)+'</loc></url>' for u in urls)+'</urlset>\n')
 (ROOT/'robots.txt').write_text('User-agent: *\nAllow: /MyProjects/\nSitemap: '+BASE+'sitemap.xml\n')
 print('Built buyer-only hub pages, 108 profiles and established route redirects.')

if __name__=='__main__':main()
