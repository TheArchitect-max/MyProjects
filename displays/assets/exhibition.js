'use strict';
(() => {
  const grid = document.getElementById('asset-grid');
  const normal = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let activeFamily = 'all';
  const cards = grid ? [...grid.querySelectorAll('.asset-card')] : [];
  const search = document.getElementById('asset-search');
  const stage = document.getElementById('stage-filter');
  const buyer = document.getElementById('buyer-filter');
  const sort = document.getElementById('sort-order');
  const applyFilters = () => {
    const query = normal(search.value.trim());
    let shown = 0;
    for (const card of cards) {
      const visible = (activeFamily === 'all' || card.dataset.family === activeFamily)
        && (stage.value === 'all' || card.dataset.stage === stage.value)
        && (buyer.value === 'all' || card.dataset.buyers.split(' ').includes(buyer.value))
        && normal(card.dataset.search).includes(query);
      card.hidden = !visible;
      if (visible) shown += 1;
    }
    document.getElementById('result-count').textContent = String(shown);
    document.getElementById('empty-state').hidden = shown !== 0;
    const ordered = [...cards].sort((a, b) => {
      const price = Number(a.dataset.price) - Number(b.dataset.price);
      if (sort.value === 'price-asc' && price !== 0) return price;
      if (sort.value === 'price-desc' && price !== 0) return -price;
      return a.dataset.name.localeCompare(b.dataset.name, 'en');
    });
    for (const card of ordered) grid.appendChild(card);
  };
  if (grid) {
    search.addEventListener('input', applyFilters);
    stage.addEventListener('change', applyFilters);
    buyer.addEventListener('change', applyFilters);
    sort.addEventListener('change', applyFilters);
    document.querySelectorAll('[data-family-filter]').forEach(button => button.addEventListener('click', () => {
      activeFamily = button.dataset.familyFilter;
      document.querySelectorAll('[data-family-filter]').forEach(other => {
        const chosen = other === button;
        other.classList.toggle('active', chosen);
        other.setAttribute('aria-pressed', String(chosen));
      });
      applyFilters();
    }));
    const updateSelection = () => {
      const count = document.querySelectorAll('.asset-select:checked').length;
      document.getElementById('selection-count').textContent = String(count);
      document.getElementById('selection-bar').hidden = count === 0;
    };
    document.querySelectorAll('.asset-select').forEach(input => input.addEventListener('change', updateSelection));
    document.querySelector('[data-clear-selection]').addEventListener('click', () => {
      document.querySelectorAll('.asset-select').forEach(input => { input.checked = false; });
      updateSelection();
    });
    applyFilters();
    updateSelection();
  }
  const dialog = document.getElementById('enquiry-dialog');
  const draft = document.getElementById('enquiry-text');
  const feedback = document.getElementById('enquiry-feedback');
  const currency = n => 'EUR ' + Number(n).toLocaleString('en-GB');
  const openEnquiry = assets => {
    if (!assets.length) return;
    draft.value = 'Acquisition enquiry - The Architect IP Exhibition\n\n'
      + 'I am interested in the following independently scoped IP asset(s), AS IS:\n\n'
      + assets.map(asset => `${asset.ref} - ${asset.title}\nPublished seller asking reference: ${currency(asset.price)}`).join('\n\n')
      + '\n\nMy intended use and target market:\n\n'
      + 'Requested rights and delivery perimeter:\n\n'
      + 'My organisation and preferred contact channel:\n\n'
      + 'I would like to discuss the current work product, the requested scope, an agreed review process and definitive written acquisition terms.\n\n'
      + 'This enquiry is not a purchase, payment instruction or transfer of rights.';
    feedback.textContent = '';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    draft.focus();
  };
  document.querySelectorAll('[data-asset-enquiry]').forEach(button => button.addEventListener('click', () => openEnquiry([
    { ref: button.dataset.ref, title: button.dataset.title, price: button.dataset.price }
  ])));
  document.querySelector('[data-selection-enquiry]')?.addEventListener('click', () => openEnquiry(
    [...document.querySelectorAll('.asset-select:checked')].map(input => ({ ref: input.value, title: input.dataset.title, price: input.dataset.price }))
  ));
  document.querySelector('[data-close-dialog]')?.addEventListener('click', () => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  });
  document.querySelector('[data-copy-enquiry]')?.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(draft.value);
      feedback.textContent = 'Enquiry draft copied.';
    } catch {
      draft.focus(); draft.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* manual copy remains available */ }
      feedback.textContent = copied ? 'Enquiry draft copied.' : 'The draft is selected. Press Ctrl+C or Command+C, or save the text file.';
    }
  });
  document.querySelector('[data-save-enquiry]')?.addEventListener('click', () => {
    const blob = new Blob([draft.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'IP_asset_acquisition_enquiry.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback.textContent = 'Text file prepared on your device. Send it through your agreed seller contact channel.';
  });
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
})();
