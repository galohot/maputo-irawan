// Escape Maputo — editorial magazine app
(function () {
  'use strict';

  const DATA = window.MAPUTO_DEST;
  const ORIGIN = DATA.origin;
  const DESTS = DATA.destinations;
  let PHOTOS = {};

  // -------- Boot --------
  fetch('photos.json?v=6')
    .then((r) => r.json())
    .then((p) => {
      PHOTOS = p;
      renderHero();
      renderStories();
      buildMap();
      // Dev hash trigger (e.g. #photos=dullstroom) — open lightbox for visual testing
      if (location.hash.startsWith('#photos=')) {
        const id = location.hash.slice(8);
        if (PHOTOS[id]?.photos?.length) {
          setTimeout(() => openLightbox(PHOTOS[id].photos, 0), 200);
        }
      }
    })
    .catch(() => {
      renderStories();
      buildMap();
    });

  // -------- Hero (rotating featured photo) --------
  const HERO_PICKS = ['kaapsehoop', 'macaneta', 'graskop', 'clarens', 'ponta-do-ouro', 'pilanesberg', 'bilene'];
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

  // -------- Helpers --------
  function tierKey(d) { return d.tier === 'urban' ? 'tu' : 't' + d.tier; }
  function escapeName(name) {
    return name
      .replace(/ & /g, '<span class="hand-amp"> &amp; </span>')
      .replace(/ \/ /g, '<span class="hand-sep"> / </span>')
      .replace(/ · /g, '<span class="hand-sep"> · </span>');
  }
  function categoryById(id) {
    return DATA.categories.find((c) => c.id === id) || { label: id, icon: '·' };
  }
  function categoryLabel(d) {
    if (!d.categories || !d.categories.length) return 'Escape';
    return d.categories.slice(0, 2).map((c) => categoryById(c).label).join(' · ');
  }
  function tierLabelShort(d) {
    if (d.drive_h <= 1.5) return 'Day-trip · ' + d.drive_h + 'h';
    if (d.drive_h <= 4) return 'Weekend · ' + d.drive_h + 'h';
    if (d.drive_h <= 6) return 'Long weekend · ' + d.drive_h + 'h';
    return 'Block leave · ' + d.drive_h + 'h';
  }

  // -------- Filter state --------
  const PAGE_SIZE = 8;
  const state = {
    cat: 'featured',     // single-select category
    flags: new Set(),
    driveMax: 8,
    showAll: false,
  };

  // Build category chips
  const catRoot = document.getElementById('cat-filters');
  catRoot.innerHTML = DATA.categories.map((c) => `
    <button class="chip cat${c.id === state.cat ? ' active' : ''}" data-cat="${c.id}">
      <span class="icon">${c.icon}</span>${c.label}
    </button>
  `).join('');
  catRoot.querySelectorAll('.chip').forEach((el) => {
    el.addEventListener('click', () => {
      state.cat = el.dataset.cat;
      state.showAll = false;
      catRoot.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === el));
      renderStories();
    });
  });

  document.querySelectorAll('#flag-filters .chip').forEach((el) => {
    el.addEventListener('click', () => {
      const f = el.dataset.flag;
      state.flags.has(f) ? state.flags.delete(f) : state.flags.add(f);
      el.classList.toggle('active');
      state.showAll = false;
      renderStories();
    });
  });
  const driveSlider = document.getElementById('drive-max');
  const driveVal = document.getElementById('drive-val');
  driveSlider.addEventListener('input', () => {
    state.driveMax = parseFloat(driveSlider.value);
    driveVal.textContent = state.driveMax + 'h';
    state.showAll = false;
    renderStories();
  });

  function passes(d) {
    if (state.cat === 'featured' && !d.featured) return false;
    if (state.cat !== 'all' && state.cat !== 'featured') {
      if (!d.categories || !d.categories.includes(state.cat)) return false;
    }
    if (d.drive_h > state.driveMax) return false;
    if (state.flags.has('malaria_free') && !d.malaria_free) return false;
    if (state.flags.has('cheap') && d.cost_tier > 1) return false;
    return true;
  }

  // -------- Stories --------
  function renderStories() {
    // Sort by score descending; tiebreak by drive time ascending
    const visible = DESTS.filter(passes).sort(
      (a, b) => (b.score || 0) - (a.score || 0) || a.drive_h - b.drive_h
    );
    document.getElementById('count').textContent = visible.length;
    const root = document.getElementById('stories');
    if (visible.length === 0) {
      root.innerHTML = `<div class="empty"><h3>Nothing matches.</h3><p>Loosen the filters above, or pick a different category.</p></div>`;
      syncMarkers([]);
      return;
    }
    const showCount = state.showAll ? visible.length : Math.min(PAGE_SIZE, visible.length);
    root.innerHTML = '';
    visible.slice(0, showCount).forEach((d) => {
      const photoSet = (PHOTOS[d.id] && PHOTOS[d.id].photos) || [];
      const meta = PHOTOS[d.id] || {};
      root.appendChild(buildStory(d, photoSet, meta));
    });

    if (showCount < visible.length) {
      const more = document.createElement('button');
      more.className = 'show-more';
      more.innerHTML = `Show <b>${visible.length - showCount}</b> more place${visible.length - showCount === 1 ? '' : 's'}`;
      more.addEventListener('click', () => {
        state.showAll = true;
        renderStories();
        // Smoothly bring user just past the button
        setTimeout(() => more.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      });
      root.appendChild(more);
    }

    syncMarkers(visible);
    setTimeout(armReveal, 50);
  }

  function buildStory(d, photos, meta) {
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

    const featuredBadge = d.featured
      ? `<div class="featured-badge">Editor's pick</div>` : '';

    const catChips = (d.categories || [])
      .map((c) => `<span class="story-cat">${categoryById(c).label}</span>`)
      .join('');

    el.innerHTML = `
      <header class="story-head">
        ${featuredBadge}
        <div class="story-meta" style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap">
          <span>${tierLabelShort(d)}</span>
          ${d.malaria_free ? '<span style="color:var(--moss)">· Malaria-free</span>' : '<span style="color:var(--rose)">· Malaria zone</span>'}
          <span class="story-cats">${catChips}</span>
          <span class="score-pill"><b>${(d.score || 0).toFixed(1)}</b><span>/10</span></span>
        </div>
        <h2>${escapeName(d.name)}</h2>
        <div class="story-loc">${d.region}, ${d.country}</div>
      </header>
      ${photoCluster}
      ${stats}
      <p class="blurb">${d.blurb}</p>
      ${notes}
      ${vibes}
      ${actions}
    `;

    // Photo click → lightbox (lead OR strip thumb)
    if (photos.length) {
      el.querySelectorAll('.photo-cluster .lead, .photo-cluster .strip .ph').forEach((node) => {
        node.addEventListener('click', () => {
          const idx = parseInt(node.dataset.idx, 10);
          openLightbox(photos, idx);
        });
      });
    }

    return el;
  }

  // -------- Lightbox (swipeable carousel) --------
  const lb = document.getElementById('lightbox');
  const lbTrack = document.getElementById('lightbox-track');
  const lbCredit = document.getElementById('lightbox-credit');
  const lbCounter = document.getElementById('lightbox-counter');
  const lbDots = document.getElementById('lightbox-dots');
  let lbState = { photos: [], idx: 0 };

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); stepLightbox(-1); });
  document.getElementById('lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); stepLightbox(1); });

  // Click on dimmed area closes; not on the track (where swipe happens)
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.classList.contains('lightbox-stage')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') stepLightbox(1);
    else if (e.key === 'ArrowLeft') stepLightbox(-1);
  });

  function openLightbox(photos, idx) {
    lbState = { photos, idx };
    lbTrack.innerHTML = photos.map((p) => `
      <div class="lightbox-slide">
        <img src="${p.src}" alt="" draggable="false">
      </div>
    `).join('');
    lbDots.innerHTML = photos.map((_, i) =>
      `<div class="lightbox-dot${i === idx ? ' active' : ''}"></div>`
    ).join('');
    snapTo(idx, false);
    showCredit();
    lb.classList.add('open');
  }

  function stepLightbox(d) {
    const n = lbState.photos.length;
    lbState.idx = (lbState.idx + d + n) % n;
    snapTo(lbState.idx, true);
    showCredit();
  }

  function snapTo(idx, animate) {
    lbState.idx = idx;
    if (!animate) lbTrack.classList.add('dragging');
    lbTrack.style.transform = `translateX(${-idx * 100}%)`;
    if (!animate) {
      // eslint-disable-next-line no-unused-expressions
      lbTrack.offsetHeight;
      requestAnimationFrame(() => lbTrack.classList.remove('dragging'));
    }
    [...lbDots.children].forEach((dot, i) =>
      dot.classList.toggle('active', i === idx)
    );
  }

  function showCredit() {
    const p = lbState.photos[lbState.idx];
    lbCounter.innerHTML = `<b>${lbState.idx + 1}</b> of ${lbState.photos.length}`;
    lbCredit.innerHTML = `Photograph by <a href="${p.author_uri}" target="_blank" rel="noopener">${p.author || 'anonymous'}</a> · Google Maps contributor`;
  }

  function closeLightbox() { lb.classList.remove('open'); }

  // -------- Swipe handling (touch + mouse drag) --------
  let drag = null;
  const SWIPE_THRESHOLD_PX = 50;
  const SWIPE_VELOCITY = 0.4;

  function dragStart(clientX, clientY) {
    if (!lb.classList.contains('open')) return;
    drag = {
      startX: clientX, startY: clientY,
      startTime: Date.now(),
      width: lbTrack.offsetWidth || window.innerWidth,
      delta: 0, locked: null,
    };
    lbTrack.classList.add('dragging');
  }
  function dragMove(clientX, clientY) {
    if (!drag) return;
    const dx = clientX - drag.startX;
    const dy = clientY - drag.startY;
    if (drag.locked === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      drag.locked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      if (drag.locked === 'v') {
        lbTrack.classList.remove('dragging');
        drag = null;
        return;
      }
    }
    if (drag.locked !== 'h') return;
    drag.delta = dx;
    const pct = -lbState.idx * 100 + (dx / drag.width) * 100;
    lbTrack.style.transform = `translateX(${pct}%)`;
  }
  function dragEnd() {
    if (!drag || drag.locked !== 'h') { drag = null; return; }
    const dx = drag.delta;
    const dt = Math.max(1, Date.now() - drag.startTime);
    const velocity = Math.abs(dx) / dt;
    let direction = 0;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX || velocity > SWIPE_VELOCITY) {
      direction = dx < 0 ? 1 : -1;
    }
    drag = null;
    if (direction !== 0) {
      const n = lbState.photos.length;
      lbState.idx = (lbState.idx + direction + n) % n;
    }
    snapTo(lbState.idx, true);
    showCredit();
  }

  lbTrack.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    dragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  lbTrack.addEventListener('touchmove', (e) => {
    if (!drag || e.touches.length !== 1) return;
    dragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  lbTrack.addEventListener('touchend', dragEnd);
  lbTrack.addEventListener('touchcancel', dragEnd);

  lbTrack.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragStart(e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', (e) => {
    if (!drag) return;
    dragMove(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', dragEnd);

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
