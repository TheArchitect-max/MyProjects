#!/usr/bin/env python3
"""Build public buyer-page shells and maintain established asset routes."""
from pathlib import Path
from html import escape
import json,re

ROOT=Path(__file__).resolve().parents[1]
BASE='https://thearchitect-max.github.io/MyProjects/'
def shell(title,summary,canonical):
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#070604"><meta name="color-scheme" content="dark"><title>'+escape(title)+' — THEARCHITECT_MAX</title><meta name="description" content="'+escape(summary,quote=True)+'"><meta property="og:title" content="'+escape(title,quote=True)+'"><meta property="og:description" content="'+escape(summary,quote=True)+'"><meta property="og:type" content="website"><link rel="canonical" href="'+canonical+'"><link rel="stylesheet" href="/MyProjects/assets/im4.css?v=im36"><link rel="stylesheet" href="/MyProjects/assets/buyer-showroom.css?v=seller12"></head><body><div id="app"><main id="main"><section class="page-hero"><div class="shell"><p class="eyebrow">THEARCHITECT_MAX</p><h1>Software IP acquisition catalogue.</h1><p>Review independent assets, their purpose and buyer information.</p></div></section></main></div><script src="/MyProjects/assets/pricing-math.js?v=calc9" defer></script><script src="/MyProjects/assets/im.js?v=showroom22-portfolio-review-20261030" defer></script><script src="/MyProjects/assets/audio-player.js?v=music3" defer></script><noscript><p><a href="/MyProjects/displays/">Open the complete project presentation collection</a></p></noscript></body></html>\n'
def redirect(url,ref=''):
 script='const u=new URL('+json.dumps(url)+',location.href);u.search=location.search;u.hash=location.hash;location.replace(u.href);'
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="'+url+'"><title>IP acquisition catalogue</title></head><body data-legacy-project-ref="'+ref+'"><p><a href="'+url+'">Continue to the acquisition catalogue</a></p><script>'+script+'</script></body></html>\n'
def build_portfolio_thesis():
 """Compile the approved plain-text publication into the existing frontend."""
 text=(ROOT/'portfolio-thesis.md').read_text()
 ids={'1. Executive Overview':'executive-overview','2. Current Portfolio Status':'current-status','3. Future Technological Potential':'future-potential','4. Future Intellectual Property and Strategic Value':'strategic-value','5. Long-Term Vision':'long-term-vision','6. Portfolio Status and Forward-Looking Statement':'status-statement'}
 def inline(value):
  value=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',escape(value))
  return re.sub(r'\*([^*]+)\*',r'<em>\1</em>',value)
 out=[];paragraph=[];in_list=False;in_section=False
 def flush():
  if paragraph:out.append('<p>'+inline(' '.join(paragraph))+'</p>');paragraph.clear()
 for line in text.splitlines():
  if line.startswith('# ') or line.startswith('### A Multidisciplinary Portfolio'):continue
  if not line.strip() or line.strip()=='---':
   flush()
   if in_list:out.append('</ul>');in_list=False
   continue
  if line.startswith('## '):
   flush()
   if in_section:out.append('</article>')
   title=line[3:];out.append('<article class="thesis-section" id="'+ids[title]+'"><h2>'+inline(title)+'</h2>');in_section=True
  elif line.startswith('### '):
   flush();out.append('<h3>'+inline(line[4:])+'</h3>')
  elif line.startswith('- '):
   flush()
   if not in_list:out.append('<ul class="buyer-list">');in_list=True
   out.append('<li>'+inline(line[2:])+'</li>')
  else:paragraph.append(line.strip())
 flush()
 if in_list:out.append('</ul>')
 if in_section:out.append('</article>')
 target=ROOT/'assets/im.js';script=target.read_text();compiled='const PORTFOLIO_THESIS_HTML='+json.dumps(''.join(out),ensure_ascii=False)+';'
 script,count=re.subn(r'^const PORTFOLIO_THESIS_HTML=.*;$',lambda _:compiled,script,flags=re.M);assert count==1
 target.write_text(script)

def main():
 build_portfolio_thesis()
 data=json.loads((ROOT/'assets/buyer-catalogue.json').read_text());urls=[]
 pages={'index.html':('Software IP acquisition catalogue','Independent software IP assets organised by application and potential buyer.'),'portfolio.html':('IP collection','Browse software assets by application, buyer type, purpose and current offered scope.'),'proof.html':('Calculation validation','Reproduce all pricing calculations, USD conversions, cost budgets and portfolio totals.'),'valuation.html':('Prices & sources','Complete asking references, recreation estimates, negotiation ranges, economic scenarios and their source register.'),'buyers.html':('Buyer fit','Explore software IP relevant to your organisation and intended acquisition.'),'acquisition.html':('Acquisition','Review the work product, agree the rights and define a separate acquisition.'),'policy.html':('Terms & disclosure','Public buyer information, acquisition scope and disclosure boundaries.'),'development.html':('Voluntary contribution','Optional support, independent from any acquisition or entitlement.'),'notice.html':('Copyright notice','Rights in the public showroom and underlying software remain reserved.')}
 pages.update({'connections.html':('Connections','Find proposed project workflows by application, participating asset and buyer objective.'),'sources.html':('Evaluation sources','External references, assessment records and per-asset source mapping used in the evaluation.'),'assurance.html':('Acquisition evidence profiles','Product editions, qualification, rights and handover conditions for all assets.'),'evidence.html':('Evidence & diligence','Review technical, legal and commercial evidence for your acquisition.'),'transfer.html':('Rights & delivery','Define first-party rights, component obligations and recipient acceptance.'),'transaction.html':('Acquisition process guide','Prepare a defined AS IS acquisition and documented handover.'),'commercialization.html':('Applications & buyer fit','Compare asset applications and potential acquirer profiles.'),'opportunity.html':('Acquisition & voluntary contribution','Two independent routes with defined terms.')})
 pages['portfolio-thesis.html']=('Independent Advanced Technology & Software Intellectual Property Portfolio','The seller-authored portfolio thesis: current research and development assets, technological scope, conditional future opportunities, intellectual property and acquisition considerations.')
 pages['musk.html']=('Strategic fit · Company-specific opportunities','Independent seller-authored analysis of potential applications for SpaceX, its AI and Starlink activities, Tesla, Neuralink and The Boring Company. No affiliation, endorsement, commissioning or buyer interest is claimed.')
 pages.pop('development.html');pages.pop('opportunity.html');pages['identities.html']=('Asset identity register','Canonical project names, current TA-IP references, feminine aliases and project displays.')
 pages['acquisition-dossier/index.html']=('Acquisition dossier','Seller-led acquisition materials: scope, evidence, rights, consideration and delivery.');(ROOT/'acquisition-dossier').mkdir(exist_ok=True)
 for name,(title,summary) in pages.items():
  url=BASE+('' if name=='index.html' else name);(ROOT/name).write_text(shell(title,summary,url));urls.append(url)
 for a in data['projects']:
  folder=ROOT/'projects'/a['slug'];folder.mkdir(exist_ok=True);(folder/'index.html').write_text(shell(a['title']+' · '+a['ref'],a['summary'],a['profileUrl']));urls.append(a['profileUrl'])
 for a in json.loads((ROOT/'assets/route-aliases.json').read_text())['aliases']:
  (ROOT/'projects'/a['legacySlug']).mkdir(exist_ok=True);(ROOT/'projects'/a['legacySlug']/'index.html').write_text(redirect(BASE+'projects/'+a['slug']+'/',a['ref']))
 aliases={'updates.html':'portfolio.html','development.html':'acquisition.html','opportunity.html':'acquisition.html'}
 for name,target in aliases.items():(ROOT/name).write_text(redirect(BASE+target))
 (ROOT/'404.html').write_text(shell('IP collection','Find a project in the acquisition catalogue.',BASE+'portfolio.html'))
 (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+escape(u)+'</loc></url>' for u in urls)+'</urlset>\n')
 (ROOT/'robots.txt').write_text('User-agent: *\nAllow: /MyProjects/\nSitemap: '+BASE+'sitemap.xml\n')
 print('Built buyer-only hub pages, 112 profiles and established route redirects.')

if __name__=='__main__':main()
