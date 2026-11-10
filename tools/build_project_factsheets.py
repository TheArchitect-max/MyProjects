#!/usr/bin/env python3
"""Deterministic project factsheets from the same public buyer and price records."""
from pathlib import Path
from html import escape
import json
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
R=Path(__file__).resolve().parents[1]
def read(n):return json.loads((R/'assets'/n).read_text())
c=read('buyer-catalogue.json');d={x['ref']:x for x in read('buyer-dossiers.json')['projects']};prices=read('pricing-catalogue.json');p={x['ref']:x for x in prices['projects']};q={x['id']:x for x in read('portfolio-reassessment-20261107.json')['assessments']}
fontroot=Path('/usr/share/fonts/truetype/dejavu');pdfmetrics.registerFont(TTFont('ProjectSans',str(fontroot/'DejaVuSans.ttf')));pdfmetrics.registerFont(TTFont('ProjectBold',str(fontroot/'DejaVuSans-Bold.ttf')))
styles={
 'body':ParagraphStyle('body',fontName='ProjectSans',fontSize=9,leading=13,spaceAfter=7,textColor=colors.HexColor('#222222')),
 'title':ParagraphStyle('title',fontName='ProjectBold',fontSize=23,leading=28,spaceAfter=16,textColor=colors.HexColor('#171717')),
 'heading':ParagraphStyle('heading',fontName='ProjectBold',fontSize=12,leading=16,spaceBefore=11,spaceAfter=7,keepWithNext=True),
 'small':ParagraphStyle('small',fontName='ProjectSans',fontSize=7.5,leading=10.5,spaceAfter=6),
 'label':ParagraphStyle('label',fontName='ProjectBold',fontSize=8,leading=12,spaceAfter=19,textColor=colors.HexColor('#68553b'))}
def para(t,style='body'):return Paragraph(escape(str(t)),styles[style])
def heading(t):return para(t,'heading')
def bullets(xs):return [para('• '+x) for x in xs]
def footer(canvas,doc):
 canvas.saveState();canvas.setStrokeColor(colors.HexColor('#b1a48e'));canvas.line(18*mm,16*mm,192*mm,16*mm);canvas.setFont('ProjectSans',7);canvas.setFillColor(colors.HexColor('#555555'));canvas.drawString(18*mm,11*mm,'THEARCHITECT_MAX | SOFTWARE IP | BUYER INFORMATION');canvas.drawRightString(192*mm,11*mm,str(doc.page));canvas.restoreState()
for a in c['projects']:
 ref=a['ref'];v=d[ref];z=p[ref];r=q[ref];s=[]
 def page(label,title):s.extend([para(ref+' / '+a['referenceName']+' / '+label,'label'),para(title,'title')])
 page('INDEPENDENT IP ASSET',a['title']);s.extend([para(a['summary']),heading('Product overview'),para(a['overview']),heading('Potential acquirers'),*bullets(a['potentialBuyers']),heading('Documented functions'),*bullets(a['capabilities']),heading('Available output types'),para(' / '.join(a['outputTypes'])),PageBreak()])
 page('ACQUISITION SCOPE','Defined work. Separate written terms.')
 s.extend([heading('Seller asking reference / AS IS'),para(f"EUR {z['values']['sellerAskEUR']:,} · indicative USD {z['valuesUSD']['sellerAskUSD']:,}"),para('Identified edition: '+v['version']),para(a['maturity']+' · '+v['transferPosition']),heading('Current scope and conditions'),para(v['offeredEdition']),*bullets(a['materialBoundaries']),heading('Conditions before handover'),*bullets(v['sellerConditions']),para(v['rightsPosition'],'small'),PageBreak()])
 page('FINANCIAL REFERENCES','Prices & sources.')
 s.append(para('Price basis: '+prices['basisDate']+'. EUR is authoritative; market value is not established.'))
 data=[[para('Price / model reference','small'),para('EUR','small'),para('USD - indicative','small')]]
 for f in prices['fields']:data.append([para(f['label'],'small'),para(f"{z['values'][f['key']]:,}",'small'),para(f"{z['valuesUSD'][f['key'].replace('EUR','USD')]:,}",'small')])
 table=Table(data,colWidths=[100*mm,33*mm,36*mm],repeatRows=1);table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eeeae3')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.3,colors.HexColor('#d7d2c9')),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),5)]));s.extend([table,heading('Cost basis'),para(z['costBasisNote']),para(z['assessment']['costEvidenceNote'],'small')])
 f=z['futureReference']
 if isinstance(f.get('milestoneConditionedEconomicReferenceEUR'),int):s.extend([heading('Milestone-conditioned reference'),para(f"EUR {f['milestoneConditionedEconomicReferenceEUR']:,}; model change EUR {f['sensitivityDeltaEUR']:,}."),para('Conditional model sensitivity only; no future asking price, income forecast or accepted scientific result.','small')])
 s.extend([heading('Source references')])
 for src in prices['sources']:
  if src['id']in z['sourceIds']:s.append(para(src['publisher']+' — '+src['title'],'small'))
 s.extend([para('External publishers inform method and rate context, not individual asset valuations. Effort and model factors are seller assumptions.','small'),para('EUR 1 = USD '+str(prices['displayCurrency']['rate'])+'; ECB '+prices['displayCurrency']['date']+'.','small'),para(a['profileUrl']+'#pricing','small'),PageBreak()])
 page('PROJECT EVIDENCE','Individual source review.')
 s.extend([para('Reviewed 10 November 2026. Current main documentation, source inventory and open candidate status; no fresh execution of private product tests.'),heading('Retained source evidence'),para(r['developmentEvidence']),heading('Remaining limits'),para(r['currentLimitations']),heading('Development position'),para(r['currentCandidateSummary']),heading('Acquisition evidence profile')])
 for x in v['assessmentCriteria']:s.append(para(x['label']+': '+x['grade']+' — '+x['criterion'],'small'))
 s.extend([heading('Buyer information and next step'),para('Quote '+ref+' and the project title. Agree the exact first-party edition, rights, delivery manifest and recipient acceptance separately.','small'),para(a['profileUrl'],'small')])
 path=R/'displays/products'/a['slug']/'factsheet.pdf';doc=SimpleDocTemplate(str(path),pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=19*mm,bottomMargin=23*mm,title=a['title']+' — '+ref,author='THEARCHITECT_MAX',invariant=1);doc.build(s,onFirstPage=footer,onLaterPages=footer)
for alias in read('route-aliases.json')['aliases']:
 target=R/'displays/products'/alias['legacySlug']/'factsheet.pdf'
 if target.exists():target.write_bytes((R/'displays/products'/alias['slug']/'factsheet.pdf').read_bytes())
print('Built 123 deterministic factsheets with current project, evidence and pricing records.')
