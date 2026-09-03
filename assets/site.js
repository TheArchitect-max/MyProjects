(() => {
  'use strict';

  const RELEASE = '20260903-19';
  const BASE_DATA_VERSION = '20260903-16';
  const DATA_PATH = document.documentElement.dataset.dataPath || 'assets/projects.json';
  const REFRESH_PATH = DATA_PATH.replace(/projects\.json$/, 'portfolio-refresh.json');
  const PRICING_PATH = DATA_PATH.replace(/projects\.json$/, 'pricing-review.json');
  const REVIEW_DATE = '03 Sep 2026';
  const FX_SOURCE_URL = 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html';

  const EUR = (value) => new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(Number(value) || 0);
  const USD = (value, rate) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format((Number(value) || 0) * rate);
  const SAFE = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const STATUS = { V: 'Software-Validated', P: 'Verified Prototype', R: 'Research' };
  const POTENTIAL = { VH: 'Very High', H: 'High', M: 'Moderate', S: 'Specialist' };
  const ARR = { VH: 2_000_000, H: 1_000_000, M: 500_000, S: 250_000 };
  const NEXT = {
    V: 'Productization and production hardening',
    P: 'Software validation and product hardening',
    R: 'Prototype definition and validation'
  };
  const CURRENT = {
    V: 'Software-validated asset',
    P: 'Verified development prototype',
    R: 'Research-stage software asset'
  };
  const RELEASE_16_ADDITIONS = new Set([
    'aletheia-intelligence-fabric', 'truelane-inkcore', 'visionair-research-engine'
  ]);
  const RELEASE_17_ADDITIONS = new Set([
    'evidence-grounded-multi-expert-reasoning-system', 'goldennet-signal-intelligence-platform',
    'autonomous-documentary-engine'
  ]);
  const RELEASE_19_ADDITIONS = new Set([
    'multimodal-evidence-adaptive-systems-platform',
    'fusionlunar-energy-systems-engineering-platform',
    'temporal-physics-causality-research-platform',
    'industrial-predictive-maintenance-rul-platform',
    'adaptive-audio-production-system',
    'causal-state-field-engine',
    'evidence-governed-analytical-reasoning-platform'
  ]);
  const LAUNCH_PRIORITY = {
    'veritas-evidence-intelligence': {
      rank: 1, label: 'Recommended First Product',
      reason: 'Best overall balance of clear B2B value, hosted-product fit, commercial scope and a focused first-user workflow.'
    },
    'organizational-memory-engine': {
      rank: 2, label: 'Enterprise Upside',
      reason: 'Strong enterprise ceiling for organizational knowledge, engineering history and change-risk intelligence.'
    },
    'programmatic-search-fabric': {
      rank: 3, label: 'Fast Web Productization',
      reason: 'A direct web-platform route with comparatively straightforward hosted deployment and customer-facing workflows.'
    },
    'agentic-engineering-control-plane': {
      rank: 4, label: 'AI B2B Candidate',
      reason: 'Strong fit for engineering organizations adopting governed agentic and reusable AI workflows.'
    },
    'mercorion-commerce-compiler': {
      rank: 5, label: 'Commerce Product Candidate',
      reason: 'A locally qualified deterministic commerce compiler with a clear path to hosted catalog publication and managed commercial workflows.'
    },
    sonicfabric: {
      rank: 6, label: 'Direct-to-User Candidate',
      reason: 'Strong interactive web presentation potential and a clear route to a customer-facing creative product.'
    }
  };

  const fxDate = (value) => new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${value}T12:00:00Z`));
  const usdSecondary = (value, fx) =>
    `<span class="usd-price">≈ ${USD(value, fx.rate)} <small>USD · indicative</small></span>`;
  const currencyPair = (value, fx, className = '') =>
    `<span class="currency-pair ${className}"><strong>${EUR(value)}</strong>${usdSecondary(value, fx)}</span>`;
  const fxDisclosure = (fx) =>
    `EUR is the authoritative portfolio currency. USD is an indicative conversion at ` +
    `<strong>1 EUR = ${fx.rate.toFixed(4)} USD</strong>, ${SAFE(fx.source)}, ${fxDate(fx.date)}. ` +
    `<a href="${FX_SOURCE_URL}" target="_blank" rel="noopener">View ECB reference ↗</a>`;

  async function loadJson(path, label) {
    const response = await fetch(`${path}?v=${RELEASE}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${label} unavailable`);
    return response.json();
  }

  async function loadPortfolio() {
    const [base, refresh, pricing] = await Promise.all([
      loadJson(DATA_PATH, 'Portfolio'), loadJson(REFRESH_PATH, 'Portfolio refresh'),
      loadJson(PRICING_PATH, 'Pricing review')
    ]);
    if (base.v !== BASE_DATA_VERSION || refresh.base_version !== BASE_DATA_VERSION ||
      pricing.basis_release !== refresh.v || pricing.v !== RELEASE) {
      throw new Error('Portfolio release mismatch');
    }
    const portfolio = JSON.parse(JSON.stringify(base));
    for (const change of refresh.replacements || []) {
      const row = portfolio.a.find((item) => item[0] === change.id);
      if (!row) throw new Error(`Missing replacement ${change.id}`);
      row[2] = change.slug; row[3] = change.name; row[6] = change.summary;
    }
    const refs = new Set(portfolio.a.map((row) => row[1]));
    for (const row of refresh.additions || []) if (!refs.has(row[1])) portfolio.a.push(row);
    const pricingById = new Map((pricing.records || []).map((record) => [record[0], record]));
    for (const row of portfolio.a) {
      const record = pricingById.get(row[0]);
      if (!record) throw new Error(`Missing pricing ${row[0]}`);
      row[7] = Number(record[1]);
    }
    portfolio.n = refresh.canonical_assets;
    portfolio.t = [pricing.portfolio.strategic_asking_reference, pricing.portfolio.recreation_cost_reference, refresh.totals[2]];
    portfolio.sc = { ...refresh.status_counts };
    portfolio.pc = { ...refresh.potential_counts };
    portfolio.fx = { ...pricing.currency };
    portfolio.re = { ...portfolio.re, method: 'full repository audit, canonical reconciliation and multi-source market-calibrated pricing review', scope: `${portfolio.re?.scope || 'current implementation and evidence'}; strategic transfer pricing is separated from recreation cost and operating-company valuation` };
    if (!Number.isInteger(portfolio.n) || portfolio.n < 1 || !Array.isArray(portfolio.a) || portfolio.a.length !== portfolio.n) {
      throw new Error('Portfolio row mismatch');
    }
    const assets = portfolio.a.map((row) => {
      const pr = pricingById.get(row[0]);
      return {
        id: row[0], ref: row[1], slug: row[2], name: row[3], category: portfolio.c[row[4]],
        status: STATUS[row[5]], statusCode: row[5], summary: row[6], ask: Number(row[7]),
        rd: Number(row[8]), potential: POTENTIAL[row[9]], potentialCode: row[9],
        route: portfolio.r[row[10]], arr: ARR[row[9]], url: row[11] || '',
        current: CURRENT[row[5]], next: NEXT[row[5]], launch: LAUNCH_PRIORITY[row[2]] || null,
        priceLow: Number(pr[2]), priceHigh: Number(pr[3]), quick: Number(pr[4])
      };
    });
    return { p: portfolio, assets, pricing, validation: validatePortfolio(portfolio, assets, pricing) };
  }

  function validatePortfolio(portfolio, assets, pricing) {
    const round = (value) => Math.round(value * 100) / 100;
    const ask = round(assets.reduce((sum, asset) => sum + asset.ask, 0));
    const rd = round(assets.reduce((sum, asset) => sum + asset.rd, 0));
    const low = assets.reduce((sum, asset) => sum + asset.priceLow, 0);
    const high = assets.reduce((sum, asset) => sum + asset.priceHigh, 0);
    const quick = assets.reduce((sum, asset) => sum + asset.quick, 0);
    const counts = assets.reduce((map, asset) => { map[asset.statusCode] = (map[asset.statusCode] || 0) + 1; return map; }, {});
    const potentialCounts = assets.reduce((map, asset) => { map[asset.potentialCode] = (map[asset.potentialCode] || 0) + 1; return map; }, {});
    const fx = portfolio.fx;
    const currency = Boolean(fx && fx.base === 'EUR' && fx.quote === 'USD' && Number.isFinite(fx.rate) && fx.rate > 0 && /^\d{4}-\d{2}-\d{2}$/.test(fx.date) && fx.source && fx.indicative === true);
    const passed = assets.every((asset) => asset.ask > 0 && asset.rd > 0 && asset.ask <= asset.rd && asset.priceLow <= asset.ask && asset.ask <= asset.priceHigh && asset.quick <= asset.ask) &&
      new Set(assets.map((asset) => asset.ref)).size === portfolio.n && new Set(assets.map((asset) => asset.slug)).size === portfolio.n &&
      ask === round(portfolio.t[0]) && rd === round(portfolio.t[1]) &&
      low === pricing.portfolio.strategic_band[0] && high === pricing.portfolio.strategic_band[1] && quick === pricing.portfolio.quick_sale_reference &&
      (counts.V || 0) === portfolio.sc.V && (counts.P || 0) === portfolio.sc.P && (counts.R || 0) === portfolio.sc.R &&
      ['VH', 'H', 'M', 'S'].every((key) => (potentialCounts[key] || 0) === portfolio.pc[key]) &&
      assets.every((asset, index) => asset.id === index + 1 && asset.ref === `TA-IP-${String(index + 1).padStart(3, '0')}`) &&
      assets.every((asset) => asset.category && asset.route && STATUS[asset.statusCode] && POTENTIAL[asset.potentialCode]) &&
      Boolean(portfolio.re && portfolio.re.date === '2026-09-03' && portfolio.re.method && portfolio.re.scope) && currency;
    return { passed, ask, rd, low, high, quick };
  }

  function pricingBand(asset) {
    return `<div class="pricing-band"><span><b>Defensible strategic band</b> ${EUR(asset.priceLow)}–${EUR(asset.priceHigh)}</span><span><b>Liquidity reference</b> ${EUR(asset.quick)}</span></div>`;
  }

  function renderHome(data) {
    const grid = document.querySelector('#project-grid');
    if (!grid) return;
    const search = document.querySelector('#search'); const sort = document.querySelector('#sort'); const filters = document.querySelector('#filters'); const count = document.querySelector('#result-count');
    let active = 'All';
    const set = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };
    set('#asset-count', data.p.n); set('#validated', data.p.sc.V); set('#prototype', data.p.sc.P);
    set('#ask-total', EUR(data.p.t[0])); set('#ask-total-usd', `≈ ${USD(data.p.t[0], data.p.fx.rate)} USD`);
    set('#rd-total', EUR(data.p.t[1])); set('#rd-total-usd', `≈ ${USD(data.p.t[1], data.p.fx.rate)} USD`);
    set('#fx-rate', `1 EUR = ${data.p.fx.rate.toFixed(4)} USD`);
    set('#pricing-status', data.validation.passed ? `Price-reviewed ${REVIEW_DATE}` : 'Review required');
    document.documentElement.dataset.priceValidation = data.validation.passed ? 'passed' : 'failed';

    const definitions = [['All','All'],['Current additions','Current additions'],['Release 17 additions','Release 17 additions'],['Release 16 additions','Release 16 additions'],['Launch shortlist','Launch shortlist'],['Recommended first product','Recommended first product'],['Software-Validated','Software-Validated'],['Verified Prototype','Verified Prototype'],['Research','Research']];
    filters.innerHTML = definitions.map(([value,label],index)=>`<button class="filter${index?'':' active'}" type="button" data-v="${SAFE(value)}" aria-pressed="${index?'false':'true'}">${SAFE(label)}</button>`).join('');

    const launchBox = document.querySelector('#launch-priority-list');
    if (launchBox) {
      const pick = data.assets.find((asset) => asset.launch?.rank === 1);
      launchBox.innerHTML = `<article class="metric feature-metric"><small>Recommended first product</small><strong>${SAFE(pick.name)}</strong><p>${SAFE(pick.launch.reason)}</p></article><article class="metric"><small>Launch priority</small><strong>#1</strong><p>Strategic productization ranking, separate from maturity and valuation.</p></article><article class="metric"><small>Commercial route</small><strong>B2B SaaS</strong><p>${SAFE(pick.route)}</p></article><article class="metric"><small>Hosted-product fit</small><strong>Strong</strong><p>Well suited to a server-hosted product with browser-based workflows.</p></article>`;
    }

    const matches = (asset) => active === 'All' || (active === 'Current additions' && RELEASE_19_ADDITIONS.has(asset.slug)) || (active === 'Release 17 additions' && RELEASE_17_ADDITIONS.has(asset.slug)) || (active === 'Release 16 additions' && RELEASE_16_ADDITIONS.has(asset.slug)) || (active === 'Launch shortlist' && asset.launch) || (active === 'Recommended first product' && asset.launch?.rank === 1) || asset.status === active;
    function draw() {
      const query = (search?.value || '').trim().toLowerCase();
      const rows = data.assets.filter((asset) => matches(asset) && (!query || `${asset.name} ${asset.category} ${asset.summary} ${asset.route} ${asset.ref} ${asset.launch?.label || ''}`.toLowerCase().includes(query)));
      if (sort?.value === 'name') rows.sort((a,b)=>a.name.localeCompare(b.name)); else if (sort?.value === 'price-asc') rows.sort((a,b)=>a.ask-b.ask); else if (sort?.value === 'status') rows.sort((a,b)=>a.status.localeCompare(b.status)||a.id-b.id); else if (sort?.value === 'launch') rows.sort((a,b)=>(a.launch?.rank||999)-(b.launch?.rank||999)||b.ask-a.ask); else rows.sort((a,b)=>b.ask-a.ask);
      grid.innerHTML = rows.map((asset)=>`<a class="card asset-card" data-status="${asset.statusCode}" href="projects/${SAFE(asset.slug)}/"><div class="card-content"><div class="card-top"><span class="asset-ref">${SAFE(asset.ref)}</span><span class="availability">Available · As-Is</span></div><h3>${SAFE(asset.name)}</h3><p>${SAFE(asset.summary)}</p><div class="chips">${RELEASE_19_ADDITIONS.has(asset.slug)?'<span class="chip release-chip">New · Release 19</span>':''}${asset.launch?.rank===1?'<span class="chip priority-chip">Recommended first product</span>':''}${asset.launch?`<span class="chip">Launch priority #${asset.launch.rank}</span>`:''}<span class="chip status-chip">${SAFE(asset.status)}</span><span class="chip">${SAFE(asset.category)}</span></div></div><div class="card-commercial"><span class="price-label">Market-calibrated strategic asking reference</span>${currencyPair(asset.ask,data.p.fx,'card-price')}<div class="recreation-price"><span>Recreation-cost reference</span>${currencyPair(asset.rd,data.p.fx)}</div>${pricingBand(asset)}<div class="card-foot"><span>✓ Price-reviewed ${REVIEW_DATE}</span><span>Open asset <b>↗</b></span></div></div></a>`).join('');
      if (count) count.textContent = `${rows.length} ${rows.length===1?'asset':'assets'}`;
    }
    filters?.addEventListener('click',(event)=>{const button=event.target.closest('button');if(!button)return;active=button.dataset.v;[...filters.children].forEach((item)=>{const selected=item===button;item.classList.toggle('active',selected);item.setAttribute('aria-pressed',String(selected))});draw()});
    search?.addEventListener('input',draw); sort?.addEventListener('change',draw); draw();
  }

  function renderProject(data) {
    const root = document.querySelector('#project'); if (!root) return;
    const slug = document.documentElement.dataset.asset || location.pathname.replace(/\/$/,'').split('/').pop();
    const asset = data.assets.find((item)=>item.slug===slug);
    if (!asset) { root.innerHTML='<section class="shell section"><h1>Asset not found.</h1></section>'; return; }
    document.title=`${asset.name} — THEARCHITECT_MAX`;
    const meta=document.querySelector('meta[name=description]');if(meta)meta.content=asset.summary;
    const canonical=document.querySelector('link[rel=canonical]');if(canonical)canonical.href=`https://thearchitect-max.github.io/MyProjects/projects/${asset.slug}/`;
    const index=data.assets.indexOf(asset),previous=data.assets[(index+data.assets.length-1)%data.assets.length],next=data.assets[(index+1)%data.assets.length];
    const priceRatio=Math.round((asset.ask/asset.rd)*100); const external=asset.url?`<a class="btn" href="${SAFE(asset.url)}" target="_blank" rel="noopener">Open public product site ↗</a>`:'';
    const launchPanel=asset.launch?`<section class="shell section compact-section"><div class="market-note"><strong>Strategic launch lens · Priority #${asset.launch.rank}${asset.launch.rank===1?' · Recommended First Product':''}</strong><p>${SAFE(asset.launch.reason)} This productization ranking remains separate from maturity and valuation.</p></div></section>`:'';
    root.innerHTML=`
      <section class="project-hero shell asset-hero"><div class="asset-titlebar"><span>${SAFE(asset.ref)}</span><span class="availability">Available for As-Is transfer</span></div><p class="eyebrow">${SAFE(asset.category)} · ${SAFE(asset.status)}</p><h1>${SAFE(asset.name)}</h1><p class="project-lede">${SAFE(asset.summary)}</p><div class="actions"><a class="btn primary" href="../../">Back to portfolio</a><a class="btn" href="../../transfer.html">Transfer overview</a>${external}</div>${asset.launch?`<div class="chips"><span class="chip">Launch priority #${asset.launch.rank}</span>${asset.launch.rank===1?'<span class="chip priority-chip">Recommended first product</span>':''}</div>`:''}</section>
      <section class="price-stage"><div class="shell price-stage-grid"><article class="price-primary"><small>Market-calibrated strategic asking reference</small>${currencyPair(asset.ask,data.p.fx,'project-price')}<span class="validated-badge">✓ Price-reviewed ${REVIEW_DATE}</span></article><article><small>Recreation-cost reference</small>${currencyPair(asset.rd,data.p.fx,'project-price secondary')}<p>Technical replacement-effort reference; not fair-market transaction value.</p></article><article><small>Strategic / recreation reference</small><strong>${priceRatio}%</strong><p>Maturity, evidence, route-to-market, transferability and commercial-proof discount reflected.</p></article><article><small>Transfer status</small><strong>Available</strong><p>As-Is transfer, subject to project-specific diligence and definitive agreement.</p></article></div><div class="shell fx-disclosure">${fxDisclosure(data.p.fx)}</div></section>
      <section class="shell section compact-section"><div class="market-note"><strong>Market-calibrated transfer range</strong><p>Strategic seller target: <b>${EUR(asset.ask)}</b>. Defensible negotiation band: <b>${EUR(asset.priceLow)}–${EUR(asset.priceHigh)}</b>. Liquidity/quick-sale reference: <b>${EUR(asset.quick)}</b>. These are seller-side analytical references, not a certified appraisal or fairness opinion.</p></div></section>
      <section class="shell project-copy storefront-copy"><div><p class="eyebrow">Asset overview</p><h2>A private software/IP asset with a repository-verified proprietary first-party posture.</h2></div><div><p>${SAFE(asset.summary)}</p><p>The public presentation focuses on product purpose, evidence-based maturity, commercial direction and acquisition economics. Transaction-specific chain-of-title and third-party rights remain diligence matters.</p></div></section>
      <section class="facts"><div class="shell facts-grid"><article class="fact"><small>Reassessed maturity</small><strong>${SAFE(asset.current)}</strong><p>${SAFE(asset.status)}</p></article><article class="fact"><small>Next milestone</small><strong>${SAFE(asset.next)}</strong><p>Next evidence or productization gate.</p></article><article class="fact"><small>Commercial route</small><strong>${SAFE(asset.potential)}</strong><p>${SAFE(asset.route)}</p></article><article class="fact"><small>Revenue evidence</small><strong>Not established</strong><p>No verified ARR, profit, customers or retention; income multiples are excluded from current pricing.</p></article></div></section>
      <section class="shell section"><div class="section-head"><div><p class="eyebrow">Evidence-weighted reassessment</p><h2 class="section-title">Current scope, current evidence, current price.</h2></div><p>Reviewed ${REVIEW_DATE} against current repository state and current market evidence. The reassessment considers implementation, executable validation, product/operations readiness, provenance, commercial deployability, repository license posture, third-party constraints and transaction liquidity.</p></div><div class="metrics"><article class="metric"><small>Maturity result</small><strong>${SAFE(asset.status)}</strong><p>software maturity after repository review</p></article><article class="metric"><small>Strategic asking reference</small>${currencyPair(asset.ask,data.p.fx,'metric-price')}<p>current market-calibrated seller target</p></article><article class="metric"><small>Negotiation band</small><strong>${EUR(asset.priceLow)}–${EUR(asset.priceHigh)}</strong><p>defensible seller-side range</p></article><article class="metric"><small>Liquidity reference</small><strong>${EUR(asset.quick)}</strong><p>quick-sale / execution-risk layer</p></article></div></section>${launchPanel}
      <section class="shell section"><p class="eyebrow">Development roadmap</p><h2 class="section-title">Asset to operating product.</h2><div class="lifecycle">${['Software/IP asset','Productization','Production readiness','Commercial launch','Recurring revenue','Hub integration'].map((label,step)=>`<article class="step"><span>0${step+1}</span><strong>${label}</strong><p>${['Current private software/IP asset with proprietary first-party license posture.','Focus the project into a market-facing product.','Advance reliability, security and operations.','Introduce pricing, onboarding and go-to-market.','Operate through the appropriate recurring-revenue model.','Connect viable ventures through the wider portfolio platform.'][step]}</p></article>`).join('')}</div></section>
      <section class="economics"><div class="shell acquisition showroom-acquisition"><div><p class="eyebrow">Acquisition position</p>${currencyPair(asset.ask,data.p.fx,'acquisition-price')}<p>The EUR amount is the current market-calibrated strategic asking reference. The USD amount is indicative at the disclosed ECB reference rate. Negotiation band: ${EUR(asset.priceLow)}–${EUR(asset.priceHigh)}. Liquidity reference: ${EUR(asset.quick)}. Recreation cost remains separately ${EUR(asset.rd)} (≈ ${USD(asset.rd,data.p.fx.rate)} USD).</p><div class="actions"><a class="btn primary" href="../../transfer.html">View transfer framework</a><a class="btn" href="../../commercialization.html">Valuation basis</a></div></div><aside><small>Commercial direction</small><strong>${SAFE(asset.potential)}</strong><p>${SAFE(asset.route)}</p><small>Reassessed status</small><strong>${SAFE(asset.status)}</strong></aside></div></section>
      <nav class="project-nav shell" aria-label="Adjacent assets"><a href="../${SAFE(previous.slug)}/">← ${SAFE(previous.name)}</a><a href="../${SAFE(next.slug)}/">${SAFE(next.name)} →</a></nav>`;
  }

  function renderCommercial(data) {
    const list=document.querySelector('#commercial-list');if(!list)return;
    const set=(selector,value)=>{const element=document.querySelector(selector);if(element)element.textContent=value};
    set('#model-arr',EUR(data.p.t[2]));set('#model-arr-usd',`≈ ${USD(data.p.t[2],data.p.fx.rate)} USD`);set('#model-low',EUR(data.p.t[2]*2));set('#model-low-usd',`≈ ${USD(data.p.t[2]*2,data.p.fx.rate)} USD`);set('#model-mid',EUR(data.p.t[2]*4));set('#model-mid-usd',`≈ ${USD(data.p.t[2]*4,data.p.fx.rate)} USD`);set('#model-high',EUR(data.p.t[2]*7));set('#model-high-usd',`≈ ${USD(data.p.t[2]*7,data.p.fx.rate)} USD`);set('#commercial-ask-total',EUR(data.p.t[0]));set('#commercial-ask-total-usd',`≈ ${USD(data.p.t[0],data.p.fx.rate)} USD`);set('#commercial-rd-total',EUR(data.p.t[1]));set('#commercial-rd-total-usd',`≈ ${USD(data.p.t[1],data.p.fx.rate)} USD`);set('#commercial-fx-rate',`1 EUR = ${data.p.fx.rate.toFixed(4)} USD`);
    list.innerHTML=data.assets.map((asset)=>`<article class="row valuation-row"><div class="n">${String(asset.id).padStart(2,'0')}</div><div class="row-asset"><h2><a href="projects/${SAFE(asset.slug)}/">${SAFE(asset.name)}</a></h2><p>${SAFE(asset.status)} · ${SAFE(asset.category)}${asset.launch?` · Launch #${asset.launch.rank}`:''}</p></div><div><span class="row-label">Strategic asking reference</span>${currencyPair(asset.ask,data.p.fx,'row-price')}<small>Band ${EUR(asset.priceLow)}–${EUR(asset.priceHigh)} · Liquidity ${EUR(asset.quick)}</small></div><div><span class="row-label">Recreation-cost reference</span>${currencyPair(asset.rd,data.p.fx,'row-price')}</div><a class="row-open" href="projects/${SAFE(asset.slug)}/" aria-label="Open ${SAFE(asset.name)}">↗</a></article>`).join('');
  }

  const style=document.createElement('style');style.textContent='.pricing-band{display:grid;gap:4px;border-top:1px solid var(--line);margin-top:12px;padding-top:10px;font-size:.6rem;color:var(--muted)}.pricing-band span{display:flex;justify-content:space-between;gap:12px}.pricing-band b{color:#d8c39e;font-weight:500}.valuation-row small{display:block;color:var(--muted2);margin-top:6px;font-size:.58rem}';document.head.appendChild(style);

  loadPortfolio().then((data)=>{renderHome(data);renderProject(data);renderCommercial(data);document.documentElement.dataset.releaseRuntime=RELEASE}).catch((error)=>{console.error(error);document.querySelectorAll('[data-load]').forEach((element)=>{element.textContent='Portfolio data temporarily unavailable.'})});
})();
