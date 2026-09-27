(() => {
  const resources = window.directoryResources || [];
  const zipCountyLookup = window.zipCountyLookup || {};
  const t = (key, values) => window.siteI18n ? window.siteI18n.t(key, values) : key;
  const form = document.querySelector('#search-form');
  const locationInput = document.querySelector('#location');
  const suggestions = document.querySelector('#location-suggestions');
  const countySelect = document.querySelector('#county-select');
  const grid = document.querySelector('#resource-grid');
  const count = document.querySelector('#result-count');
  const note = document.querySelector('#results-note');
  const empty = document.querySelector('#empty-state');
  const aliases = {
    'san francisco': ['san francisco', 'sf'],
    'contra costa': ['contra costa', 'richmond', 'san pablo', 'el cerrito', 'pinole', 'walnut creek', 'concord', 'pleasant hill', 'martinez', 'danville', 'san ramon', 'antioch', 'pittsburg', 'brentwood', 'oakley'],
    'san mateo': ['san mateo', 'peninsula', 'daly city', 'south san francisco', 'san bruno', 'burlingame', 'foster city', 'redwood city', 'east palo alto', 'half moon bay', 'coastside'],
    'santa clara': ['santa clara', 'silicon valley', 'san jose', 'san josé', 'cupertino', 'milpitas', 'saratoga', 'campbell', 'los gatos', 'monte sereno', 'mountain view', 'sunnyvale', 'palo alto', 'los altos', 'los altos hills', 'morgan hill', 'gilroy', 'san martin', 'stanford'],
    'alameda': ['alameda', 'oakland', 'berkeley', 'hayward', 'fremont', 'newark', 'union city', 'san leandro', 'livermore', 'dublin', 'pleasanton', 'tri-city', 'tri cities'],
    'marin': ['marin', 'san rafael', 'novato', 'mill valley', 'sausalito', 'san anselmo', 'larkspur', 'corte madera'],
    'napa': ['napa', 'american canyon', 'st helena', 'calistoga'],
    'solano': ['solano', 'vallejo', 'benicia', 'fairfield', 'vacaville', 'suisun city', 'dixon'],
    'sonoma': ['sonoma', 'santa rosa', 'rohnert park', 'windsor', 'petaluma', 'healdsburg', 'sonoma valley']
  };
  const clean = value => (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ county/g, '').replace(/[^a-z0-9 ]/g, ' ').trim();
  const areaNames = [...new Set(resources.flatMap(item => item.counties || (item.county ? [item.county] : [])))].sort((a,b) => a.localeCompare(b));
  const places = new Map();
  areaNames.forEach(county => places.set(clean(county), {label: `${county} ${t('county')}`, value: county, kind: t('county')}));
  resources.flatMap(item => item.cities || []).forEach(city => {
    if (!places.has(clean(city))) places.set(clean(city), {label: city, value: city, kind: t('city')});
  });
  Object.entries(aliases).forEach(([county, names]) => names.forEach(name => {
    const display = name.replace(/\b\w/g, letter => letter.toUpperCase());
    if (!places.has(clean(name))) places.set(clean(name), {label: display, value: name, kind: name === county ? t('county') : t('city')});
  }));
  Object.keys(zipCountyLookup).forEach(zip => places.set(zip, {
    label: `${zip} · ${zipCountyLookup[zip].join(' / ')} ${t('county')} area`, value: zip, kind: t('zipCode')
  }));
  const placeOptions = [...places.values()];
  let activeSuggestion = -1;
  areaNames.forEach(area => {
    const option = document.createElement('option');
    option.value = area;
    option.textContent = `${area} County`;
    countySelect.append(option);
  });
  let mode = 'all';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function locationMatch(item, query) {
    if (!query) return true;
    const q = clean(query);
    const countyValues = [item.county, ...(item.counties || [])].filter(Boolean).map(clean);
    const cityValues = (item.cities || []).map(clean);
    const zip = String(query).trim();
    if (/^\d{5}$/.test(zip)) {
      const zipCounties = zipCountyLookup[zip];
      return Boolean(zipCounties && zipCounties.some(county => countyValues.includes(clean(county))));
    }
    if (countyValues.includes(q) || cityValues.includes(q)) return true;
    for (const [county, words] of Object.entries(aliases)) {
      if (q === county || words.includes(q)) {
        if (q === county) return countyValues.includes(county) || countyValues.some(v => v.includes(county));
        return cityValues.includes(q) || (item.countywide && (countyValues.includes(county) || countyValues.some(v => v.includes(county))));
      }
    }
    return [...countyValues, ...cityValues].some(value => value.includes(q) || q.includes(value));
  }
  function matches(item) {
    const query = locationInput.value;
    const selected = countySelect.value;
    if (selected && !locationMatch(item, selected)) return false;
    if (!locationMatch(item, query)) return false;
    if (mode === 'tnr' && !['TNR','Voucher'].includes(item.type)) return false;
    if (mode === 'owned' && item.type !== 'Owned-cat clinic') return false;
    return true;
  }
  function card(item) {
    const isTnr = ['TNR','Voucher'].includes(item.type);
    const badge = isTnr ? t('communityCatBadge') : t('ownedCatBadge');
    const status = item.status ? `<span class="status-pill ${item.status === 'paused' ? 'paused' : ''}">${esc(item.status === 'paused' ? t('paused') : item.status)}</span>` : '';
    const cityTags = (item.cities || []).slice(0, 3).map(x => `<span>${esc(x)}</span>`).join('');
    const countyTags = (item.counties || []).map(x => `<span>${esc(x)} ${esc(t('county'))}</span>`).join('');
    const bookUrl = item.bookingUrl || item.website || item.sourceUrl;
    const buttonText = item.bookingUrl ? t('bookingDetails') : t('visitProgram');
    return `<article class="resource-card ${item.featured ? 'featured-card' : ''}">
      <div class="card-top"><span class="kind-pill ${isTnr ? 'kind-tnr' : 'kind-owned'}"><i></i>${badge}</span>${status}</div>
      <h3><a class="card-title-link" href="${esc(item.permalink)}">${esc(item.name)}</a></h3><p class="card-location">${esc(item.location || [...(item.cities || []), ...(item.counties || []).map(x => x + ' County')].join(' · '))}</p>
      <div class="card-cost"><span class="cost-label">${esc(t('costLabel'))}</span><strong>${esc(item.cost)}</strong></div>
      <p class="card-detail">${esc(item.details)}</p>
      <div class="card-info"><div><span class="info-icon">↗</span><p><b>${esc(t('howToBook'))}</b>${esc(item.booking)}</p></div><div><span class="info-icon">◎</span><p><b>${esc(t('whoCanUse'))}</b>${esc(item.eligibility)}</p></div></div>
      <div class="card-tags">${countyTags}${cityTags}</div>
      <div class="card-actions"><a class="primary-link" href="${esc(bookUrl)}" target="_blank" rel="noopener">${esc(buttonText)} <span>↗</span></a><a class="source-link" href="${esc(item.sourceUrl || item.website)}" target="_blank" rel="noopener">${esc(t('source'))} <span>↗</span></a></div>
      <p class="verified">${esc(t('checked'))} ${esc(item.updated || 'recently')} · ${esc(t('verifyAvailability'))}</p>
    </article>`;
  }
  function render() {
    const localScore = item => {
      const q = clean(locationInput.value);
      const selected = clean(countySelect.value);
      const cities = (item.cities || []).map(clean);
      const counties = (item.counties || []).map(clean);
      const zip = String(locationInput.value).trim();
      if (/^\d{5}$/.test(zip) && (zipCountyLookup[zip] || []).some(county => counties.includes(clean(county)))) return 2;
      if (q && cities.includes(q)) return 2;
      if (selected && counties.includes(selected)) return 1;
      return 0;
    };
    const results = resources.filter(matches).sort((a,b) => localScore(b) - localScore(a) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name));
    grid.innerHTML = results.map(card).join('');
    count.textContent = t(results.length === 1 ? 'programOne' : 'programMany', {count: results.length});
    empty.hidden = results.length > 0;
    grid.hidden = results.length === 0;
    const zip = String(locationInput.value).trim();
    const zipCounties = /^\d{5}$/.test(zip) ? zipCountyLookup[zip] : null;
    const selected = countySelect.value || locationInput.value;
    if (zipCounties) note.textContent = t('zipShowing', {counties: zipCounties.map(county => `${county} ${t('county')}`).join(' / '), zip});
    else if (/^\d{5}$/.test(zip)) note.textContent = t('zipMissing', {zip});
    else note.textContent = selected ? t('showingFor', {area: selected}) : t('browseAll');
  }
  function hideSuggestions() {
    suggestions.hidden = true;
    suggestions.innerHTML = '';
    locationInput.setAttribute('aria-expanded', 'false');
    locationInput.removeAttribute('aria-activedescendant');
    activeSuggestion = -1;
  }
  function showSuggestions() {
    const query = clean(locationInput.value);
    if (query.length < 1) return hideSuggestions();
    const found = placeOptions.filter(place => clean(place.value).includes(query) || clean(place.label).includes(query))
      .sort((a, b) => Number(clean(a.value).startsWith(query)) * -1 - Number(clean(b.value).startsWith(query)) * -1 || a.label.localeCompare(b.label))
      .slice(0, 7);
    if (!found.length) return hideSuggestions();
    suggestions.innerHTML = found.map((place, index) => `<li id="location-option-${index}" role="option" aria-selected="false" data-value="${esc(place.value)}"><span>${esc(place.label)}</span><small>${esc(place.kind)}</small></li>`).join('');
    suggestions.hidden = false;
    locationInput.setAttribute('aria-expanded', 'true');
    suggestions.querySelectorAll('[role="option"]').forEach(option => option.addEventListener('mousedown', event => event.preventDefault()));
    suggestions.querySelectorAll('[role="option"]').forEach(option => option.addEventListener('click', () => {
      locationInput.value = option.dataset.value;
      hideSuggestions();
      render();
      document.querySelector('#finder').scrollIntoView({behavior:'smooth', block:'start'});
    }));
  }
  function setActiveSuggestion(index) {
    const options = [...suggestions.querySelectorAll('[role="option"]')];
    if (!options.length) return;
    activeSuggestion = (index + options.length) % options.length;
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === activeSuggestion)));
    locationInput.setAttribute('aria-activedescendant', options[activeSuggestion].id);
  }
  form.addEventListener('submit', event => { event.preventDefault(); render(); document.querySelector('#finder').scrollIntoView({behavior:'smooth', block:'start'}); });
  locationInput.addEventListener('input', () => { render(); showSuggestions(); });
  locationInput.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && !suggestions.hidden) { event.preventDefault(); setActiveSuggestion(activeSuggestion + 1); }
    else if (event.key === 'ArrowUp' && !suggestions.hidden) { event.preventDefault(); setActiveSuggestion(activeSuggestion < 0 ? suggestions.children.length - 1 : activeSuggestion - 1); }
    else if (event.key === 'Enter' && !suggestions.hidden && activeSuggestion >= 0) { event.preventDefault(); suggestions.children[activeSuggestion].click(); }
    else if (event.key === 'Escape') hideSuggestions();
  });
  locationInput.addEventListener('blur', () => setTimeout(hideSuggestions, 120));
  countySelect.addEventListener('change', render);
  document.addEventListener('site-language-change', () => {
    places.clear();
    areaNames.forEach(county => places.set(clean(county), {label: `${county} ${t('county')}`, value: county, kind: t('county')}));
    resources.flatMap(item => item.cities || []).forEach(city => { if (!places.has(clean(city))) places.set(clean(city), {label: city, value: city, kind: t('city')}); });
    Object.entries(aliases).forEach(([county, names]) => names.forEach(name => { const display = name.replace(/\b\w/g, letter => letter.toUpperCase()); if (!places.has(clean(name))) places.set(clean(name), {label: display, value: name, kind: name === county ? t('county') : t('city')}); }));
    Object.keys(zipCountyLookup).forEach(zip => places.set(zip, {label: `${zip} · ${zipCountyLookup[zip].join(' / ')} ${t('county')} area`, value: zip, kind: t('zipCode')}));
    placeOptions.splice(0, placeOptions.length, ...places.values());
    if (countySelect.options.length > 1) [...countySelect.options].slice(1).forEach(option => { option.textContent = `${option.value} ${t('county')}`; });
    render();
  });
  document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.filter;
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('active', chip === button));
    render();
  }));
  document.querySelector('#clear-search').addEventListener('click', () => { locationInput.value = ''; countySelect.value = ''; mode = 'all'; document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.filter === 'all')); render(); });
  const params = new URLSearchParams(location.search);
  if (params.has('q')) locationInput.value = params.get('q');
  render();
})();
