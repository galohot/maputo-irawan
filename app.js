// Escape Maputo — interactive map app
(function () {
  'use strict';

  const DATA = window.MAPUTO_DEST;
  const ORIGIN = DATA.origin;
  const DESTS = DATA.destinations;

  // ---------- Wikipedia photo cache ----------
  const PHOTO_CACHE = {};
  const PHOTO_PROMISES = {};

  async function loadWikiPhoto(slug) {
    if (PHOTO_CACHE[slug] !== undefined) return PHOTO_CACHE[slug];
    if (PHOTO_PROMISES[slug]) return PHOTO_PROMISES[slug];
    PHOTO_PROMISES[slug] = (async () => {
      try {
        const r = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}?redirect=true`,
          { headers: { Accept: 'application/json' } }
        );
        if (!r.ok) throw 0;
        const j = await r.json();
        const result = {
          thumb: j.thumbnail?.source || null,
          original: j.originalimage?.source || j.thumbnail?.source || null,
          extract: j.extract || null,
          url: j.content_urls?.desktop?.page || null,
        };
        PHOTO_CACHE[slug] = result;
        return result;
      } catch {
        PHOTO_CACHE[slug] = { thumb: null, original: null, extract: null, url: null };
        return PHOTO_CACHE[slug];
      }
    })();
    return PHOTO_PROMISES[slug];
  }

  // ---------- Map ----------
  const map = L.map('map', {
    center: [-26.5, 30.5],
    zoom: 6,
    zoomControl: true,
    minZoom: 5,
    maxZoom: 13,
  });

  L.tileLayer(
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://openstreetmap.org">OSM</a> · &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }
  ).addTo(map);

  // Origin marker
  const originIcon = L.divIcon({
    className: '',
    html: '<div class="pin-marker origin">⌂</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
  L.marker([ORIGIN.lat, ORIGIN.lon], { icon: originIcon, zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup(
      `<b>Maputo</b><br><span style="color:#8896b8">Starting point</span>`
    );

  // Destination markers
  const markers = {};
  DESTS.forEach((d) => {
    const tierKey =
      d.tier === 'urban' ? 'tu' : d.tier === 1 ? 't1' : d.tier === 2 ? 't2' : 't3';
    const icon = L.divIcon({
      className: '',
      html: `<div class="pin-marker ${tierKey}">${d.altitude_m >= 1500 ? '▲' : '●'}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const m = L.marker([d.lat, d.lon], { icon }).addTo(map);
    m.on('click', () => openDrawer(d.id));
    m.bindTooltip(
      `<b>${d.name}</b><br>${d.drive_h}h · ${d.altitude_m}m`,
      { direction: 'top', offset: [0, -10] }
    );
    markers[d.id] = m;
  });

  // ---------- Filters & list ----------
  const state = {
    tiers: new Set(['1', '2', '3', 'urban']),
    flags: new Set(),
    driveMax: 8,
  };

  const tierEls = document.querySelectorAll('#tier-filters .chip');
  tierEls.forEach((el) => {
    el.addEventListener('click', () => {
      const t = el.dataset.tier;
      if (state.tiers.has(t)) state.tiers.delete(t);
      else state.tiers.add(t);
      el.classList.toggle('active');
      render();
    });
  });

  const flagEls = document.querySelectorAll('#flag-filters .chip');
  flagEls.forEach((el) => {
    el.addEventListener('click', () => {
      const f = el.dataset.flag;
      if (state.flags.has(f)) state.flags.delete(f);
      else state.flags.add(f);
      el.classList.toggle('active');
      render();
    });
  });

  const driveSlider = document.getElementById('drive-max');
  const driveVal = document.getElementById('drive-val');
  driveSlider.addEventListener('input', () => {
    state.driveMax = parseFloat(driveSlider.value);
    driveVal.textContent = state.driveMax + 'h';
    render();
  });

  document.getElementById('reset').addEventListener('click', (e) => {
    e.preventDefault();
    state.tiers = new Set(['1', '2', '3', 'urban']);
    state.flags = new Set();
    state.driveMax = 8;
    driveSlider.value = 8;
    driveVal.textContent = '8h';
    tierEls.forEach((el) => el.classList.add('active'));
    flagEls.forEach((el) => el.classList.remove('active'));
    render();
  });

  function passes(d) {
    const tierKey = String(d.tier);
    if (!state.tiers.has(tierKey)) return false;
    if (d.drive_h > state.driveMax) return false;
    if (state.flags.has('malaria_free') && !d.malaria_free) return false;
    if (state.flags.has('kid5') && d.kid_score < 5) return false;
    if (state.flags.has('cheap') && d.cost_tier > 1) return false;
    if (state.flags.has('highland') && d.altitude_m < 1300) return false;
    return true;
  }

  function tierKey(d) {
    return d.tier === 'urban' ? 'tu' : 't' + d.tier;
  }

  function render() {
    const visible = DESTS.filter(passes).sort((a, b) => a.drive_h - b.drive_h);

    // Markers
    DESTS.forEach((d) => {
      const m = markers[d.id];
      if (passes(d)) {
        if (!map.hasLayer(m)) m.addTo(map);
      } else {
        if (map.hasLayer(m)) map.removeLayer(m);
      }
    });

    // List
    const list = document.getElementById('list');
    document.getElementById('count').textContent = visible.length;
    if (visible.length === 0) {
      list.innerHTML = '<div class="empty">No spots match — loosen the filters.</div>';
      return;
    }
    list.innerHTML = '';
    visible.forEach((d) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = d.id;
      card.innerHTML = `
        <div class="thumb">
          <div class="placeholder">${d.altitude_m >= 1500 ? '▲' : '◆'}</div>
        </div>
        <div class="body">
          <div class="title-row">
            <span class="tier-dot ${tierKey(d)}"></span>
            <h3>${d.name}</h3>
          </div>
          <div class="meta">
            <span>🚗 ${d.drive_h}h</span>
            <span>⛰ ${d.altitude_m}m</span>
            <span>${'⭐'.repeat(d.kid_score)}</span>
            ${d.malaria_free ? '<span style="color:#56d3b3">🛡 malaria-free</span>' : ''}
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.card.active').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        focusOn(d);
      });
      list.appendChild(card);

      // lazy load thumb
      loadWikiPhoto(d.wiki).then((p) => {
        if (p.thumb) {
          const img = document.createElement('img');
          img.src = p.thumb;
          img.alt = d.name;
          img.loading = 'lazy';
          const thumb = card.querySelector('.thumb');
          img.onload = () => {
            img.classList.add('loaded');
            const ph = thumb.querySelector('.placeholder');
            if (ph) ph.remove();
          };
          thumb.insertBefore(img, thumb.firstChild);
        }
      });
    });
  }

  function focusOn(d) {
    map.flyTo([d.lat, d.lon], 9, { duration: 0.6 });
    openDrawer(d.id);
  }

  // ---------- Drawer ----------
  const drawer = document.getElementById('drawer');
  const drawerContent = document.getElementById('drawer-content');
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);

  function closeDrawer() {
    drawer.classList.remove('open');
  }

  async function openDrawer(id) {
    const d = DESTS.find((x) => x.id === id);
    if (!d) return;
    drawerContent.innerHTML = `
      <div class="hero-fallback">Loading photo…</div>
      <div class="drawer-body">
        <h2>${d.name}</h2>
        <div class="loc">
          <span><span class="tier-dot ${tierKey(d)}"></span> ${
      d.tier === 'urban' ? 'Urban escape' : 'Tier ' + d.tier
    }</span>
          <span>📍 ${d.region}, ${d.country}</span>
        </div>
        <div class="stat-grid">
          <div class="stat"><div class="k">Drive from Maputo</div><div class="v">${d.drive_h} hours</div></div>
          <div class="stat"><div class="k">Altitude</div><div class="v">${d.altitude_m} m</div></div>
          <div class="stat"><div class="k">Kid-friendly</div><div class="v">${'⭐'.repeat(d.kid_score)}</div></div>
          <div class="stat"><div class="k">Cost</div><div class="v">${'$'.repeat(d.cost_tier)}</div></div>
          <div class="stat"><div class="k">Malaria</div><div class="v">${d.malaria_free ? '✅ free' : '⚠️ zone'}</div></div>
          <div class="stat"><div class="k">Best season</div><div class="v">${d.season_peak}</div></div>
        </div>
        <div class="blurb">${d.blurb}</div>

        <div class="section-title">Why it works for the family</div>
        <ul class="notes">
          ${d.family_notes.map((n) => `<li>${n}</li>`).join('')}
        </ul>

        <div class="section-title">Vibe</div>
        <div class="vibes">${d.vibe.map((v) => `<span class="vibe-tag">${v}</span>`).join('')}</div>

        <div class="section-title">Photos</div>
        <div class="gallery" id="gallery-${d.id}">
          <div style="grid-column:1/-1;color:var(--muted);font-size:12px">Loading…</div>
        </div>

        <div class="section-title">More</div>
        <div style="font-size:13px;line-height:1.6">
          <a id="wiki-link-${d.id}" target="_blank" rel="noopener">Wikipedia ↗</a> ·
          <a href="https://www.google.com/maps/dir/Maputo/${d.lat},${d.lon}" target="_blank" rel="noopener">Driving directions ↗</a> ·
          <a href="https://www.google.com/search?q=${encodeURIComponent(d.name + ' family hotel')}" target="_blank" rel="noopener">Search hotels ↗</a>
        </div>
      </div>
    `;
    drawer.classList.add('open');

    // Load hero + gallery
    const wp = await loadWikiPhoto(d.wiki);
    const heroEl = drawerContent.querySelector('.hero-fallback');
    if (wp.original) {
      const img = document.createElement('img');
      img.className = 'hero';
      img.src = wp.original;
      img.alt = d.name;
      heroEl.replaceWith(img);
    } else {
      heroEl.textContent = d.name;
    }
    const wikiLink = document.getElementById(`wiki-link-${d.id}`);
    if (wikiLink && wp.url) wikiLink.href = wp.url;

    // Gallery: query Wikimedia Commons for images by category/search
    const gallery = document.getElementById(`gallery-${d.id}`);
    gallery.innerHTML = '';
    const galleryImages = await fetchCommonsImages(d.name, 4);
    if (galleryImages.length === 0) {
      gallery.innerHTML = `<div style="grid-column:1/-1;color:var(--muted);font-size:12px">No additional photos found.</div>`;
    } else {
      galleryImages.forEach((url) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = d.name;
        img.loading = 'lazy';
        img.onload = () => img.classList.add('loaded');
        gallery.appendChild(img);
      });
    }
  }

  async function fetchCommonsImages(query, limit) {
    try {
      const r = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
          query
        )}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`
      );
      if (!r.ok) return [];
      const j = await r.json();
      const pages = j.query?.pages || {};
      return Object.values(pages)
        .map((p) => p.imageinfo?.[0]?.thumburl)
        .filter(Boolean)
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  // ---------- Mobile toggle ----------
  const mobileToggle = document.getElementById('mobile-toggle');
  const app = document.getElementById('app');
  mobileToggle.addEventListener('click', () => {
    app.classList.toggle('show-list');
    mobileToggle.textContent = app.classList.contains('show-list') ? '🗺 Map' : '📋 List';
  });

  // ---------- Initial render ----------
  render();

  // Fit bounds to show Maputo + all destinations
  setTimeout(() => {
    const bounds = L.latLngBounds([
      [ORIGIN.lat, ORIGIN.lon],
      ...DESTS.map((d) => [d.lat, d.lon]),
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, 100);
})();
