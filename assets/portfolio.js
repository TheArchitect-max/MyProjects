// Static project records remain readable without JavaScript.
export function selectProjects(assets, {query = '', family = 'all', stage = 'all', sort = 'name'} = {}) {
  const q = query.trim().toLowerCase();
  const rows = assets.filter(a => (family === 'all' || a.family === family) &&
    (stage === 'all' || a.developmentClass === stage) &&
    (!q || [a.ref, a.name, a.description, a.commercialUse, a.qualificationGate, a.development, a.developmentLabel].join(' ').toLowerCase().includes(q)));
  return rows.sort(sort === 'updated' ? (a,b) => b.lastRepositoryActivity.localeCompare(a.lastRepositoryActivity) || a.name.localeCompare(b.name) : (a,b) => a.name.localeCompare(b.name));
}
export function initPortfolio(document, location) {
  const list = document.getElementById('project-list');
  if (!list) return;
  const fields = Object.fromEntries(['search','family','stage','sort'].map(id => [id, document.getElementById(id)]));
  const records = [...list.querySelectorAll('.project-record')];
  const data = records.map(e => JSON.parse(e.dataset.project));
  const elements = new Map(records.map(e => [JSON.parse(e.dataset.project).ref,e]));
  const initial = new URLSearchParams(location.search).get('family');
  if ([...fields.family.options].some(o => o.value === initial)) fields.family.value = initial;
  function draw() {
    const selected = selectProjects(data, {query:fields.search.value, family:fields.family.value, stage:fields.stage.value, sort:fields.sort.value});
    records.forEach(e => { e.hidden = true; });
    selected.forEach(a => { const e = elements.get(a.ref); e.hidden = false; list.appendChild(e); });
    document.getElementById('result-count').textContent = `${selected.length} of ${data.length} project assessments`;
    document.getElementById('no-results').hidden = selected.length !== 0;
  }
  fields.search.addEventListener('input',draw);
  for (const id of ['family','stage','sort']) fields[id].addEventListener('change',draw);
  document.getElementById('reset-filters').addEventListener('click',()=>{ fields.search.value=''; fields.family.value='all'; fields.stage.value='all'; fields.sort.value='name'; draw(); fields.search.focus(); });
  draw();
}
if (typeof document !== 'undefined') initPortfolio(document, location);
