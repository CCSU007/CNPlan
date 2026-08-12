/**
 * Interactive Map — Leaflet-powered route visualization
 * Shows all cities as markers with toggleable route layers.
 */
let mapInstance = null;
let togetherLayer, dalianLayer;
let atlasLayer = null;
let allMarkers = [];
let chinaBounds = null;

function initMap() {
  const container = document.getElementById('map-container');
  if (!container) return;

  mapInstance = L.map('map-container', {
    center: [32.0, 110.0],
    zoom: 5,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(mapInstance);

  const coords = id => TRIP.cities.find(c => c.id === id).coords;
  const cityIds = ['shenzhen','wangxian','chongqing','chengdu','dalian','beijing','nanjing-suzhou','shanghai'];

  // ── Route Layer Groups ──
  togetherLayer = L.layerGroup().addTo(mapInstance);
  dalianLayer = L.layerGroup().addTo(mapInstance);

  // Together (Purple): shenzhen → wangxian → chongqing → chengdu
  L.polyline(['shenzhen','wangxian','chongqing','chengdu'].map(id => coords(id)), {
    color: '#6366f1', weight: 3, opacity: 0.7, dashArray: '10, 8',
  }).addTo(togetherLayer);

  // Together (Purple): beijing → nanjing-suzhou → shanghai
  L.polyline(['beijing','nanjing-suzhou','shanghai'].map(id => coords(id)), {
    color: '#6366f1', weight: 3, opacity: 0.7, dashArray: '10, 8',
  }).addTo(togetherLayer);

  // CC · Dalian (Pink): split after Chengdu, reunite in Beijing
  L.polyline([coords('chengdu'), coords('dalian'), coords('beijing')], {
    color: '#ec4899', weight: 3, opacity: 0.7, dashArray: '10, 8',
  }).addTo(dalianLayer);

  // ── City Markers (always visible) ──
  const allCoords = [];

  cityIds.forEach(id => {
    const city = TRIP.cities.find(c => c.id === id);
    if (!city) return;
    allCoords.push(city.coords);

    const markerColor = id === 'shenzhen' ? '#10b981' : id === 'shanghai' ? '#ef4444' : '#6366f1';
    const marker = L.circleMarker(city.coords, {
      radius: 10, fillColor: markerColor, color: '#fff',
      weight: 2.5, opacity: 1, fillOpacity: 0.9,
    }).addTo(mapInstance);

    marker.bindPopup(`
      <div style="min-width:180px">
        <div style="font-size:1.5rem;margin-bottom:.2rem">${city.emoji}</div>
        <h3 style="margin:0 0 .2rem;font-size:1.05rem">${city.name}</h3>
        <div style="font-size:.8rem;color:#64748b">${city.startDate} – ${city.endDate} · ${city.nights} nights</div>
        <hr style="margin:.4rem 0;border:none;border-top:1px solid #e2e8f0" />
        <div style="font-size:.82rem;color:#475569">${city.activities.slice(0, 3).join('<br/>')}</div>
      </div>
    `);
    allMarkers.push(marker);
  });

  // Fit bounds
  chinaBounds = L.latLngBounds(allCoords);
  mapInstance.fitBounds(chinaBounds, { padding: [50, 50] });

  // Jump to city (called from Planner "Show on Map" via ?city=)
  window.flyToCity = function (cityId) {
    const city = TRIP.cities.find(c => c.id === cityId);
    if (city && mapInstance) {
      mapInstance.setView(city.coords, 10);
      const idx = TRIP.cities.indexOf(city);
      if (allMarkers[idx]) allMarkers[idx].openPopup();
    }
  };

  // Planner "Show on Map" → map.html?city=<id>
  const params = new URLSearchParams(window.location.search);
  const focusId = params.get('city');
  if (focusId && typeof window.flyToCity === 'function') {
    setTimeout(() => window.flyToCity(focusId), 450);
  }
}

/**
 * Toggle route layers on the map.
 * @param {'together'|'dalian'} route - Route to show
 * @param {HTMLElement} btn - The clicked button
 */
function toggleRoute(route, btn) {
  document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const show = (layer, on) => {
    if (on) mapInstance.addLayer(layer);
    else mapInstance.removeLayer(layer);
  };

  switch (route) {
    // Together = the complete journey (both legs visible)
    case 'together':
      show(togetherLayer, true); show(dalianLayer, true); break;
    case 'dalian':
      show(togetherLayer, true); show(dalianLayer, true); break;
  }

  // Leaving Atlas view → restore the China route
  if (atlasLayer) mapInstance.removeLayer(atlasLayer);
  setCityMarkers(true);
  if (chinaBounds && route === 'together') {
    mapInstance.fitBounds(chinaBounds, { padding: [50, 50] });
  }
}

/** Show/hide the China city markers on the map. */
function setCityMarkers(visible) {
  allMarkers.forEach(m => {
    if (visible) mapInstance.addLayer(m);
    else mapInstance.removeLayer(m);
  });
}

/**
 * Atlas — world footprint view (TREK-inspired).
 * Shows the whole trip on a world map: New Zealand → Hong Kong → China → back.
 * Uses the same Leaflet map, just a different view + layer.
 */
function buildAtlas() {
  if (atlasLayer) return atlasLayer;
  atlasLayer = L.layerGroup();

  const coords = id => TRIP.cities.find(c => c.id === id).coords;
  const auckland = [-36.85, 174.76];
  const hongkong = [22.32, 114.17];
  const chinaIds = ['shenzhen','wangxian','chongqing','chengdu','dalian','beijing','nanjing-suzhou','shanghai'];

  // Journey polyline on a world scale: NZ → HK → China cities → back to NZ
  const journey = [auckland, hongkong, ...chinaIds.map(id => coords(id)), auckland];
  L.polyline(journey, {
    color: '#6366f1', weight: 3, opacity: 0.7, dashArray: '8, 8',
  }).addTo(atlasLayer);

  // Country markers with labels
  const countryMarker = (pos, emoji, title, sub, color) => {
    L.circleMarker(pos, { radius: 11, fillColor: color, color: '#fff', weight: 2.5, fillOpacity: 0.9 })
      .addTo(atlasLayer)
      .bindPopup(`<div style="min-width:180px"><div style="font-size:1.4rem">${emoji}</div><h3 style="margin:.1rem 0">${title}</h3><div style="font-size:.82rem;color:#64748b">${sub}</div></div>`);
    L.marker(pos, { icon: L.divIcon({ className: 'atlas-label', html: title, iconSize: [96, 22], iconAnchor: [48, 30] }), interactive: false })
      .addTo(atlasLayer);
  };

  countryMarker(auckland, '🇳🇿', 'New Zealand · Home', 'Depart & return flights', '#10b981');
  countryMarker(hongkong, '🇭🇰', 'Hong Kong · Transit', 'Stopover to China', '#06b6d4');
  countryMarker([31.23, 121.47], '🇨🇳', 'China · 8 cities', 'Dec 6 – Jan 11 · the journey', '#ef4444');

  return atlasLayer;
}

/** Switch to the Atlas world view (called by the 🌍 Atlas button). */
function toggleAtlas(btn) {
  document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Hide the China route + city markers
  [togetherLayer, dalianLayer].forEach(l => { if (l) mapInstance.removeLayer(l); });
  setCityMarkers(false);

  mapInstance.addLayer(buildAtlas());
  mapInstance.setView([20, 100], 2);
}
