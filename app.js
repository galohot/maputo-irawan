// Escape Maputo — editorial magazine app
(function () {
  'use strict';

  const DATA = window.MAPUTO_DEST;
  const ORIGIN = DATA.origin;
  const DESTS = DATA.destinations;
  let PHOTOS = {};

  // -------- Boot --------
  fetch('photos.json?v=4')
    .then((r) => r.json())
    .then((p) => {
      PHOTOS = p;
      renderHero();
      renderStories();
      buildMap();
    })
    .catch(() => {
      renderStories();
      buildMap();
    });

  // -------- Hero (rotating featured photo) --------
  const HERO_PICKS = ['kaapsehoop', 'malolotja', 'graskop', 'clarens', 'pilgrims-rest', 'mbabane'];
  function renderHero() {
    const el = document.getElementById('hero-photo');
    const credit = document.getElementById('hero-credit');
    const choose = () => {
      const id = HERO_PICKS[Math.floor(Math.random() * HERO_PICKS.length)];
      const photos = PHOTOS[id]?.photos;
      if (!photos || !photos.length) return null;
      const dest = DESTS.find((d) => d.id === id);
      const ph = photos[Math.floor(Math.random() * photos.length)];
      return { dest, ph };
    };
    const pick = choose();
    if (!pick) return;
    const { dest, ph } = pick;
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url(${ph.src})`;
      requestAnimationFrame(() => el.classList.add('visible'));
      credit.innerHTML = `${dest.name} · photograph by <a href="${ph.author_uri}" target="_blank" rel="noopener">${ph.author || 'Anonymous'}</a>`;
    };
    img.src = ph.src;
  }

  // -------- Tier helpers --------
  function tierKey(d) { return d.tier === 'urban' ? 'tu' : 't' + d.tier; }
  function escapeName(name) {
    // Split on common separators, render delimiters in italic brass for editorial feel
    return name
      .replace(/ & /g, '<span class="hand-amp"> &amp; </span>')
      .replace(/ — /g, '<span class="hand-sep"> — </span>')
      .replace(/ \/ /g, '<span class="hand-sep"> / </span>');
  }
  function tierLabel(d) {
    return d.tier === 'urban' ? 'Urban escape' :
           d.tier === 1 ? 'Tier I · under 4h' :
           d.tier === 2 ? 'Tier II · 4 to 6h' :
                          'Tier III · 7h or more';
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  // -------- Filter state --------
  const state = {
    tiers: new Set(['1', '2', '3', 'urban']),
    flags: new Set(),
    driveMax: 8,
  };

  document.querySelectorAll('#tier-filters .chip').forEach((el) => {
    el.addEventListener('click', () => {
      const t = el.dataset.tier;
      state.tiers.has(t) ? state.tiers.delete(t) : state.tiers.add(t);
      el.classList.toggle('active');
      renderStories();
    });
  });
  document.querySelectorAll('#flag-filters .chip').forEach((el) => {
    el.addEventListener('click', () => {
      const f = el.dataset.flag;
      state.flags.has(f) ? state.flags.delete(f) : state.flags.add(f);
      el.classList.toggle('active');
      renderStories();
    });
  });
  const driveSlider = document.getElementById('drive-max');
  const driveVal = document.getElementById('drive-val');
  driveSlider.addEventListener('input', () => {
    state.driveMax = parseFloat(driveSlider.value);
    driveVal.textContent = state.driveMax + 'h';
    renderStories();
  });

  function passes(d) {
    if (!state.tiers.has(String(d.tier))) return false;
    if (d.drive_h > state.driveMax) return false;
    if (state.flags.has('malaria_free') && !d.malaria_free) return false;
    if (state.flags.has('kid5') && d.kid_score < 5) return false;
    if (state.flags.has('cheap') && d.cost_tier > 1) return false;
    if (state.flags.has('highland') && d.altitude_m < 1300) return false;
    return true;
  }

  // -------- Stories --------
  function renderStories() {
    const visible = DESTS.filter(passes).sort((a, b) => a.drive_h - b.drive_h);
    document.getElementById('count').textContent = visible.length;
    const root = document.getElementById('stories');
    if (visible.length === 0) {
      root.innerHTML = `<div class="empty"><h3>Nothing matches.</h3><p>Loosen the filters above.</p></div>`;
      syncMarkers([]);
      return;
    }
    root.innerHTML = '';
    visible.forEach((d, i) => {
      const photoSet = (PHOTOS[d.id] && PHOTOS[d.id].photos) || [];
      const meta = PHOTOS[d.id] || {};
      root.appendChild(buildStory(d, i + 1, photoSet, meta));
    });
    syncMarkers(visible);
    setTimeout(armReveal, 50);
  }

  function buildStory(d, num, photos, meta) {
    const el = document.createElement('article');
    el.className = 'story anim';
    el.id = 'story-' + d.id;
    el.dataset.id = d.id;

    const lead = photos[0];
    const strip = photos.slice(1, 6);

    const photoCluster = photos.length
      ? `
      <figure class="photo-cluster">
        <div class="lead" data-idx="0">
          <img src="${lead.src}" alt="${d.name}" loading="lazy">
          <div class="credit-overlay">Photograph · <a href="${lead.author_uri}" target="_blank" rel="noopener">${lead.author || 'anonymous'}</a> · Google Maps contributor</div>
        </div>
        ${strip.length ? `<div class="strip">
          ${strip.map((p, j) => `
            <div class="ph" data-idx="${j + 1}">
              <img src="${p.src}" alt="${d.name}" loading="lazy">
            </div>`).join('')}
        </div>` : ''}
      </figure>
      `
      : '';

    const stats = `
      <div class="stats">
        <div class="stat"><div class="stat-k">Drive</div><div class="stat-v">${d.drive_h}<small>h</small></div></div>
        <div class="stat"><div class="stat-k">Altitude</div><div class="stat-v">${d.altitude_m.toLocaleString()}<small>m</small></div></div>
        <div class="stat"><div class="stat-k">For kids</div><div class="stat-v">${d.kid_score}<small>/5</small></div></div>
        <div class="stat"><div class="stat-k">Cost</div><div class="stat-v">${'$'.repeat(d.cost_tier)}</div></div>
        <div class="stat"><div class="stat-k">Best season</div><div class="stat-v" style="font-size:14px;line-height:1.3">${d.season_peak}</div></div>
      </div>
    `;

    const notes = `
      <div class="notes-block">
        <div class="notes-label">Why it works for the family</div>
        <ul class="notes">
          ${d.family_notes.map((n) => `<li>${n}</li>`).join('')}
        </ul>
      </div>
    `;

    const vibes = `
      <div class="vibes-row">
        ${d.vibe.map((v) => `<span class="vibe-tag">${v}</span>`).join('')}
      </div>
    `;

    const mapsUri = meta.google_maps_uri || `https://www.google.com/maps?q=${d.lat},${d.lon}`;
    const svUri = meta.street_view_uri;
    const wikiUri = `https://en.wikipedia.org/wiki/${d.wiki}`;
    const dirUri = `https://www.google.com/maps/dir/Maputo/${d.lat},${d.lon}`;

    const arrow = `<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>`;

    const actions = `
      <div class="actions">
        <a class="action" href="${mapsUri}" target="_blank" rel="noopener">Open in Google Maps ${arrow}</a>
        ${svUri ? `<a class="action" href="${svUri}" target="_blank" rel="noopener">Street View ${arrow}</a>` : ''}
        <a class="action" href="${dirUri}" target="_blank" rel="noopener">Directions from Maputo ${arrow}</a>
        <a class="action" href="${wikiUri}" target="_blank" rel="noopener">Wikipedia ${arrow}</a>
      </div>
    `;

    el.innerHTML = `
      <header class="story-head">
        <div class="story-num">${pad(num)}</div>
        <div>
          <div class="story-meta">
            <span class="tier-pill ${tierKey(d)}">${tierLabel(d)}</span>
            ${d.malaria_free ? 'Malaria-free' : ''}
          </div>
          <h2>${escapeName(d.name)}</h2>
          <div class="story-loc">${d.region}, ${d.country}</div>
        </div>
      </header>
      ${photoCluster}
      ${stats}
      <p class="blurb">${d.blurb}</p>
      ${notes}
      ${vibes}
      ${actions}
    `;

    // Photo click → lightbox
    if (photos.length) {
      el.querySelectorAll('.photo-cluster .ph').forEach((node) => {
        node.addEventListener('click', () => {
          const idx = parseInt(node.dataset.idx, 10);
          openLightbox(photos, idx);
        });
      });
    }

    return el;
  }

  // -------- Lightbox --------
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCredit = document.getElementById('lightbox-credit');
  let lbState = { photos: [], idx: 0 };
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  });

  function openLightbox(photos, idx) {
    lbState = { photos, idx };
    showLb();
    lb.classList.add('open');
  }
  function stepLightbox(d) {
    lbState.idx = (lbState.idx + d + lbState.photos.length) % lbState.photos.length;
    showLb();
  }
  function showLb() {
    const p = lbState.photos[lbState.idx];
    lbImg.src = p.src;
    lbCredit.innerHTML = `${lbState.idx + 1} of ${lbState.photos.length} · photograph by <a href="${p.author_uri}" target="_blank" rel="noopener">${p.author || 'anonymous'}</a> on google maps`;
  }
  function closeLightbox() { lb.classList.remove('open'); }

  // -------- Map --------
  let map, mobileMap;
  const mainMarkers = {};
  const mobileMarkers = {};

  function buildMap() {
    map = L.map('map', { center: [-26.5, 30.5], zoom: 6, zoomControl: true, minZoom: 5, maxZoom: 13 });
    addTiles(map);
    addOriginMarker(map);
    DESTS.forEach((d) => {
      const m = makeMarker(d, map, () => scrollToStory(d.id));
      mainMarkers[d.id] = m;
    });

    // Mobile map (lazy-init on first open)
    document.getElementById('map-fab').addEventListener('click', openMobileMap);
    document.getElementById('mobile-map-close').addEventListener('click', () => {
      document.getElementById('mobile-map').classList.remove('open');
    });

    fitBounds(map);
  }

  function openMobileMap() {
    document.getElementById('mobile-map').classList.add('open');
    if (!mobileMap) {
      mobileMap = L.map('mobile-map-canvas', { center: [-26.5, 30.5], zoom: 6, zoomControl: true });
      addTiles(mobileMap);
      addOriginMarker(mobileMap);
      DESTS.forEach((d) => {
        const m = makeMarker(d, mobileMap, () => {
          document.getElementById('mobile-map').classList.remove('open');
          scrollToStory(d.id);
        });
        mobileMarkers[d.id] = m;
      });
      fitBounds(mobileMap);
    } else {
      setTimeout(() => mobileMap.invalidateSize(), 100);
    }
  }

  function addTiles(m) {
    L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://openstreetmap.org">OSM</a> · <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(m);
  }

  function addOriginMarker(m) {
    const icon = L.divIcon({
      className: '',
      html: '<div class="pin-origin">M</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    L.marker([ORIGIN.lat, ORIGIN.lon], { icon, zIndexOffset: 1000 })
      .addTo(m)
      .bindTooltip('Maputo · origin', { direction: 'top', offset: [0, -10] });
  }

  function makeMarker(d, m, onClick) {
    const tk = d.tier === 'urban' ? 'tu' : 't' + d.tier;
    const icon = L.divIcon({
      className: '',
      html: `<div class="pin-marker ${tk}" data-id="${d.id}"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    const marker = L.marker([d.lat, d.lon], { icon }).addTo(m);
    marker.on('click', onClick);
    marker.bindTooltip(`<b>${d.name}</b><br>${d.drive_h}h · ${d.altitude_m}m`, {
      direction: 'top', offset: [0, -10],
    });
    return marker;
  }

  function fitBounds(m) {
    const bounds = L.latLngBounds([
      [ORIGIN.lat, ORIGIN.lon],
      ...DESTS.map((d) => [d.lat, d.lon]),
    ]);
    setTimeout(() => m.fitBounds(bounds, { padding: [30, 30] }), 60);
  }

  function syncMarkers(visible) {
    if (!map) return;
    const ids = new Set(visible.map((d) => d.id));
    DESTS.forEach((d) => {
      const m = mainMarkers[d.id];
      if (!m) return;
      if (ids.has(d.id)) { if (!map.hasLayer(m)) m.addTo(map); }
      else { if (map.hasLayer(m)) map.removeLayer(m); }
      const mm = mobileMarkers[d.id];
      if (mm && mobileMap) {
        if (ids.has(d.id)) { if (!mobileMap.hasLayer(mm)) mm.addTo(mobileMap); }
        else { if (mobileMap.hasLayer(mm)) mobileMap.removeLayer(mm); }
      }
    });
  }

  function scrollToStory(id) {
    const el = document.getElementById('story-' + id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.style.transition = 'background .15s ease';
    el.style.background = 'oklch(0.78 0.13 78 / 0.06)';
    setTimeout(() => (el.style.background = ''), 1200);
  }

  // -------- Reveal on scroll (opt-in, fail-safe) --------
  let revealObs;
  function armReveal() {
    const els = document.querySelectorAll('.anim');
    // Fallback: ensure visible after 1.5s no matter what
    setTimeout(() => els.forEach((el) => el.classList.add('in')), 1500);
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    if (revealObs) revealObs.disconnect();
    revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
    els.forEach((el) => revealObs.observe(el));
  }

  // -------- Active marker as user scrolls --------
  const storyObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.dataset.id;
        Object.entries(mainMarkers).forEach(([k, m]) => {
          const node = m.getElement();
          if (!node) return;
          const dot = node.querySelector('.pin-marker');
          if (dot) dot.classList.toggle('active', k === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  // re-observe after each render
  const origRender = renderStories;
  // (reveal arming already calls it)
  setTimeout(() => {
    document.querySelectorAll('.story').forEach((s) => storyObs.observe(s));
  }, 800);

  // Re-observe whenever stories rerender
  const mo = new MutationObserver(() => {
    document.querySelectorAll('.story').forEach((s) => storyObs.observe(s));
  });
  mo.observe(document.getElementById('stories'), { childList: true });
})();
