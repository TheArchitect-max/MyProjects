(() => {
  'use strict';

  const BASE_PATH = 'assets/projects.json';
  const REFRESH_PATH = 'assets/portfolio-refresh.json';
  const PRICING_PATH = 'assets/pricing-review.json';
  const LIVE_PATH = 'assets/live-release.json';

  const STATUS = { V: 'Software-Validated', P: 'Verified Prototype', R: 'Research' };
  const POTENTIAL = { VH: 'Very High', H: 'High', M: 'Moderate', S: 'Specialist' };

  const eur = (value) => new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(Number(value) || 0);

  const usd = (value, rate) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format((Number(value) || 0) * rate);

  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);

  async function loadJson(path) {
    const response = await fetch(`${path}?v=20260904-20`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
  }

  function buildAssets(base, refresh, pricing, live) {
    const merged = JSON.parse(JSON.stringify(base));

    for (const change of refresh.replacements || []) {
      const row = merged.a.find((item) => item[0] === change.id);
      if (!row) throw new Error(`Missing historical replacement ${change.id}`);
      row[2] = change.slug;
      row[3] = change.name;
      row[6] = change.summary;
    }

    const refs = new Set(merged.a.map((row) => row[1]));
    for (const row of refresh.additions || []) {
      if (!refs.has(row[1])) merged.a.push(row);
    }

    for (const change of live.replacements || []) {
      const row = merged.a.find((item) => item[0] === change.id);
      if (!row) throw new Error(`Missing live replacement ${change.id}`);
      row[2] = change.slug;
      row[3] = change.name;
      row[6] = change.summary;
    }

    const pricingById = new Map((pricing.records || []).map((record) => [record[0], record]));
    const assets = merged.a.map((row) => {
      const p = pricingById.get(row[0]);
      if (!p) throw new Error(`Missing price record ${row[0]}`);
      return {
        id: row[0],
        ref: row[1],
        slug: row[2],
        name: row[3],
        category: merged.c[row[4]],
        statusCode: row[5],
        status: STATUS[row[5]],
        summary: row[6],
        ask: Number(p[1]),
        priceLow: Number(p[2]),
        priceHigh: Number(p[3]),
        quick: Number(p[4]),
        rd: Number(row[8]),
        potentialCode: row[9],
        potential: POTENTIAL[row[9]],
        route: merged.r[row[10]],
        externalUrl: row[11] || ''
      };
    });

    for (const item of live.additions || []) {
      assets.push({
        ...item,
        status: STATUS[item.statusCode],
        potential: POTENTIAL[item.potentialCode],
        externalUrl: item.externalUrl || ''
      });
    }

    assets.sort((a, b) => a.id - b.id);
    return assets;
  }

  function validate(assets, live) {
    const expected = live.expected;
    const ask = assets.reduce((sum, item) => sum + item.ask, 0);
    const rd = assets.reduce((sum, item) => sum + item.rd, 0);
    const low = assets.reduce((sum, item) => sum + item.priceLow, 0);
    const high = assets.reduce((sum, item) => sum + item.priceHigh, 0);
    const quick = assets.reduce((sum, item) => sum + item.quick, 0);
    const sc = assets.reduce((m, item) => ((m[item.statusCode] = (m[item.statusCode] || 0) + 1), m), {});
    const pc = assets.reduce((m, item) => ((m[item.potentialCode] = (m[item.potentialCode] || 0) + 1), m), {});

    const sequential = assets.every((item, i) =>
      item.id === i + 1 && item.ref === `TA-IP-${String(i + 1).padStart(3, '0')}`);

    const passed =
      assets.length === live.repository_scope.canonical_qualified_assets &&
      new Set(assets.map((x) => x.slug)).size === assets.length &&
      new Set(assets.map((x) => x.ref)).size === assets.length &&
      sequential &&
      ask === expected.strategic_asking_reference &&
      rd === expected.recreation_cost_reference &&
      low === expected.strategic_band[0] &&
      high === expected.strategic_band[1] &&
      quick === expected.quick_sale_reference &&
      ['V', 'P', 'R'].every((k) => (sc[k] || 0) === expected.status_counts[k]) &&
      ['VH', 'H', 'M', 'S'].every((k) => (pc[k] || 0) === expected.potential_counts[k]) &&
      assets.every((x) => x.ask > 0 && x.rd >= x.ask && x.priceLow <= x.ask && x.ask <= x.priceHigh && x.quick <= x.ask);

    return { passed, ask, rd, low, high, quick, sc, pc };
  }

  function stat(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderSummary(data) {
    const { assets, live, validation } = data;
    const rate = live.fx.rate;
    stat('asset-count', assets.length);
    stat('observed-count', live.repository_scope.private_repositories_observed);
    stat('validated-count', validation.sc.V || 0);
    stat('prototype-count', validation.sc.P || 0);
    stat('research-count', validation.sc.R || 0);
    stat('ask-total', eur(validation.ask));
    stat('ask-total-usd', `≈ ${usd(validation.ask, rate)} USD`);
    stat('rd-total', eur(validation.rd));
    stat('rd-total-usd', `≈ ${usd(validation.rd, rate)} USD`);
    stat('fx-rate', `1 EUR = ${rate.toFixed(4)} USD`);
    stat('release-status', validation.passed ? 'Register checks passed' : 'Register review required');

    const status = document.getElementById('release-status');
    if (status) status.dataset.ok = validation.passed ? 'true' : 'false';

    const band = document.getElementById('strategic-band');
    if (band) band.textContent = `${eur(validation.low)} – ${eur(validation.high)}`;

    const quick = document.getElementById('quick-sale');
    if (quick) quick.textContent = eur(validation.quick);

    const ratio = document.getElementById('value-ratio');
    if (ratio) ratio.textContent = `${((validation.ask / validation.rd) * 100).toFixed(1)}%`;
  }

  function renderScope(live) {
    const box = document.getElementById('repository-scope');
    if (!box) return;
    const s = live.repository_scope;
    box.innerHTML = `
      <div class="scope-item"><span>Private repositories observed</span><strong>${s.private_repositories_observed}</strong></div>
      <div class="scope-item"><span>Qualified canonical assets</span><strong>${s.canonical_qualified_assets}</strong></div>
      <div class="scope-item"><span>Legacy migration repository</span><strong>${s.legacy_private_repositories_retained}</strong></div>
      <div class="scope-item"><span>Reserved, not yet qualified</span><strong>${s.reserved_unqualified_repositories}</strong></div>
    `;
  }

  function renderUpdates(assets, live) {
    const target = document.getElementById('release-updates');
    if (!target) return;
    const current = [
      assets.find((x) => x.id === 5),
      assets.find((x) => x.id === 65),
      assets.find((x) => x.id === 66)
    ].filter(Boolean);

    const reserved = live.repository_scope.reserved?.[0];

    target.innerHTML = current.map((asset) => `
      <article class="update-card">
        <span class="asset-ref">${safe(asset.ref)}</span>
        <h3>${safe(asset.name)}</h3>
        <p>${safe(asset.summary)}</p>
      </article>
    `).join('') + `
      <article class="update-card reserved">
        <span class="asset-ref">Repository reserved</span>
        <h3>${safe(reserved?.repository || 'Reserved repository')}</h3>
        <p>${safe(reserved?.reason || 'Not included in qualified portfolio totals.')}</p>
      </article>
    `;
  }

  function renderPortfolio(data) {
    const { assets, live } = data;
    const grid = document.getElementById('project-grid');
    const search = document.getElementById('search');
    const sort = document.getElementById('sort');
    const filters = document.getElementById('filters');
    const count = document.getElementById('result-count');
    if (!grid || !filters) return;

    const definitions = [
      ['all', 'All assets'],
      ['current', 'Current update'],
      ['V', 'Software-Validated'],
      ['P', 'Verified Prototype'],
      ['R', 'Research']
    ];

    let active = 'all';

    filters.innerHTML = definitions.map(([value, label], index) =>
      `<button type="button" class="filter${index === 0 ? ' active' : ''}" data-filter="${value}" aria-pressed="${index === 0 ? 'true' : 'false'}">${label}</button>`
    ).join('');

    filters.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      active = button.dataset.filter;
      filters.querySelectorAll('button').forEach((item) => {
        const on = item === button;
        item.classList.toggle('active', on);
        item.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      draw();
    });

    const matches = (asset) => {
      if (active === 'all') return true;
      if (active === 'current') return [5, 65, 66].includes(asset.id);
      return asset.statusCode === active;
    };

    const card = (asset) => `
      <article class="asset-card" id="asset-${safe(asset.slug)}">
        <div class="asset-card-top">
          <span class="asset-ref">${safe(asset.ref)}</span>
          <span class="status status-${safe(asset.statusCode)}">${safe(asset.status)}</span>
        </div>
        <div>
          <h3>${safe(asset.name)}</h3>
          <p class="asset-summary">${safe(asset.summary)}</p>
        </div>
        <div class="asset-meta">
          <span>${safe(asset.category)}</span>
          <span>${safe(asset.route)}</span>
          <span>Commercial potential: ${safe(asset.potential)}</span>
        </div>
        <div class="price-block">
          <div>
            <span>Strategic asking reference</span>
            <strong>${eur(asset.ask)}</strong>
            <small>≈ ${usd(asset.ask, live.fx.rate)} USD</small>
          </div>
          <div>
            <span>Recreation-cost reference</span>
            <strong>${eur(asset.rd)}</strong>
            <small>≈ ${usd(asset.rd, live.fx.rate)} USD</small>
          </div>
        </div>
        <details>
          <summary>Pricing & evidence boundary</summary>
          <div class="detail-grid">
            <p><strong>Defensible strategic band</strong><br>${eur(asset.priceLow)} – ${eur(asset.priceHigh)}</p>
            <p><strong>Liquidity reference</strong><br>${eur(asset.quick)}</p>
            <p><strong>Maturity</strong><br>${safe(asset.status)}</p>
            <p><strong>Boundary</strong><br>Internal software evidence is not independent certification, legal title, patent/FTO clearance or market traction.</p>
          </div>
        </details>
        ${asset.externalUrl ? `<a class="text-link" href="${safe(asset.externalUrl)}" target="_blank" rel="noopener">Open public product site ↗</a>` : ''}
      </article>
    `;

    function draw() {
      const q = (search?.value || '').trim().toLowerCase();
      const rows = assets.filter((asset) =>
        matches(asset) &&
        (!q || `${asset.ref} ${asset.name} ${asset.category} ${asset.summary} ${asset.route} ${asset.status}`.toLowerCase().includes(q))
      );

      const mode = sort?.value || 'ask-desc';
      if (mode === 'name') rows.sort((a, b) => a.name.localeCompare(b.name));
      else if (mode === 'ask-asc') rows.sort((a, b) => a.ask - b.ask);
      else if (mode === 'newest') rows.sort((a, b) => b.id - a.id);
      else rows.sort((a, b) => b.ask - a.ask);

      grid.innerHTML = rows.map(card).join('');
      if (count) count.textContent = `${rows.length} of ${assets.length} assets`;
    }

    search?.addEventListener('input', draw);
    sort?.addEventListener('change', draw);
    draw();
  }

  async function init() {
    try {
      const [base, refresh, pricing, live] = await Promise.all([
        loadJson(BASE_PATH), loadJson(REFRESH_PATH), loadJson(PRICING_PATH), loadJson(LIVE_PATH)
      ]);
      const assets = buildAssets(base, refresh, pricing, live);
      const validation = validate(assets, live);
      const data = { base, refresh, pricing, live, assets, validation };
      renderSummary(data);
      renderScope(live);
      renderUpdates(assets, live);
      renderPortfolio(data);
      document.documentElement.dataset.register = validation.passed ? 'passed' : 'failed';
    } catch (error) {
      console.error(error);
      const grid = document.getElementById('project-grid');
      if (grid) grid.innerHTML = `<div class="load-error"><strong>Portfolio data could not be loaded.</strong><br>${safe(error.message)}</div>`;
      stat('release-status', 'Register load failed');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
