/**
 * Interactive Map — Leaflet-powered route visualization
 * China route + Thailand family leg, with a world “Atlas” view.
 */
let mapInstance = null;
let chinaLayer, thailandLayer;
let atlasLayer = null;
let allMarkers = [];
let markerById = {};
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

  const coords = id => {
    const d = getDestination(id);
    return d ? d.coords : null;
  };

  // ── Route layer groups ──
  chinaLayer = L.layerGroup().addTo(mapInstance);
  thailandLayer = L.layerGroup();

  // China route, in travel order (Shenzhen → … → Shenzhen again)
  const chinaRoute = ['shenzhen', 'chongqing', 'chengdu', 'beijing', 'shanghai', 'suzhou', 'shanghai', 'shenzhen']
    .map(coords).filter(Boolean);
  L.polyline(chinaRoute, {
    color: '#6366f1', weight: 3, opacity: 0.7, dashArray: '10, 8',
  }).addTo(chinaLayer);

  // Christmas break: Beijing → Dalian → Shanghai (flight to Shanghai not booked yet)
  const dalianRoute = ['beijing', 'dalian', 'shanghai'].map(coords).filter(Boolean);
  L.polyline(dalianRoute, {
    color: '#ec4899', weight: 3, opacity: 0.75, dashArray: '10, 8',
  }).addTo(thailandLayer);

  // ── Destination markers (always visible) ──
  const allCoords = [];

  TRIP.destinations.forEach(dest => {
    const legs = legsForDestination(dest.id);
    const dates = legs.length ? legs.map(l => planDateRange(l.startDate, l.endDate)).join(' · ') : (dest.stay || '');
    const nights = legs.reduce((n, l) => n + (l.nights || 0), 0) || dest.nights || 0;

    allCoords.push(dest.coords);

    const markerColor = dest.id === 'shenzhen' ? '#10b981'
      : dest.id === 'shanghai' ? '#ef4444'
      : dest.id === 'dalian' ? '#ec4899'
      : '#6366f1';

    const marker = L.circleMarker(dest.coords, {
      radius: 10, fillColor: markerColor, color: '#fff',
      weight: 2.5, opacity: 1, fillOpacity: 0.9,
    }).addTo(mapInstance);

    marker.bindPopup(`
      <div style="min-width:190px">
        <div style="font-size:1.5rem;margin-bottom:.2rem">${dest.emoji}</div>
        <h3 style="margin:0 0 .2rem;font-size:1.05rem">${dest.name}</h3>
        <div style="font-size:.8rem;color:#64748b">${dates} · ${nights} night${nights === 1 ? '' : 's'}</div>
        <hr style="margin:.4rem 0;border:none;border-top:1px solid #e2e8f0" />
        <div style="font-size:.82rem;color:#475569">${dest.activities.slice(0, 3).join('<br/>')}</div>
      </div>
    `);
    allMarkers.push(marker);
    markerById[dest.id] = marker;
  });

  chinaBounds = L.latLngBounds(allCoords);
  mapInstance.fitBounds(chinaBounds, { padding: [50, 50] });

  // Jump to city (called from Planner / city pages via ?city=)
  window.flyToCity = function (cityId) {
    const dest = getDestination(cityId);
    if (!dest || !mapInstance) return;
    if (atlasLayer) { mapInstance.removeLayer(atlasLayer); atlasLayer = null; }
    mapInstance.addLayer(chinaLayer);
    setCityMarkers(true);
    mapInstance.setView(dest.coords, 10);
    const marker = markerById[cityId];
    if (marker) marker.openPopup();
  };

  const params = new URLSearchParams(window.location.search);
  const focusId = params.get('city');
  if (focusId) setTimeout(() => window.flyToCity(focusId), 450);
}

/**
 * Toggle route layers on the map.
 * @param {'china'|'thailand'} route
 * @param {HTMLElement} btn
 */
function toggleRoute(route, btn) {
  document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const show = (layer, on) => {
    if (!layer) return;
    if (on) mapInstance.addLayer(layer);
    else mapInstance.removeLayer(layer);
  };

  if (route === 'thailand') {
    show(chinaLayer, true);
    show(thailandLayer, true);
    if (chinaBounds) mapInstance.fitBounds(L.latLngBounds([
      getDestination('beijing').coords,
      getDestination('dalian').coords,
      getDestination('shanghai').coords,
    ]), { padding: [60, 60] });
  } else {
    show(thailandLayer, false);
    show(chinaLayer, true);
    if (chinaBounds) mapInstance.fitBounds(chinaBounds, { padding: [50, 50] });
  }

  if (atlasLayer) { mapInstance.removeLayer(atlasLayer); atlasLayer = null; }
  setCityMarkers(true);
}

/** Show/hide the destination markers. */
function setCityMarkers(visible) {
  allMarkers.forEach(m => {
    if (visible) mapInstance.addLayer(m);
    else mapInstance.removeLayer(m);
  });
}

/** World footprint view: New Zealand → Hong Kong → China → Thailand → home. */
function buildAtlas() {
  if (atlasLayer) return atlasLayer;
  atlasLayer = L.layerGroup();

  const coords = id => getDestination(id).coords;
  const auckland = [-36.85, 174.76];
  const hongkong = [22.32, 114.17];

  const journey = [
    auckland, hongkong,
    coords('shenzhen'), coords('chongqing'), coords('chengdu'),
    coords('beijing'), coords('dalian'), coords('shanghai'), coords('suzhou'),
    coords('shanghai'), coords('shenzhen'),
    hongkong, auckland,
  ];

  L.polyline(journey, {
    color: '#6366f1', weight: 3, opacity: 0.7, dashArray: '8, 8',
  }).addTo(atlasLayer);

  const countryMarker = (pos, emoji, title, sub, color) => {
    L.circleMarker(pos, { radius: 11, fillColor: color, color: '#fff', weight: 2.5, fillOpacity: 0.9 })
      .addTo(atlasLayer)
      .bindPopup(`<div style="min-width:180px"><div style="font-size:1.4rem">${emoji}</div><h3 style="margin:.1rem 0">${title}</h3><div style="font-size:.82rem;color:#64748b">${sub}</div></div>`);
    L.marker(pos, { icon: L.divIcon({ className: 'atlas-label', html: title, iconSize: [120, 22], iconAnchor: [60, 30] }), interactive: false })
      .addTo(atlasLayer);
  };

  countryMarker(auckland, '🇳🇿', 'New Zealand · Home', 'Depart 5 Dec & return 11 Jan', '#10b981');
  countryMarker(hongkong, '🇭🇰', 'Hong Kong · Transit', 'In and out of China', '#06b6d4');
  countryMarker([31.23, 121.47], '🇨🇳', 'China · the journey', '5 Dec – 10 Jan', '#ef4444');
  countryMarker(coords('dalian'), '🌊', 'Dalian · Break', '25 – 30 Dec', '#ec4899');

  return atlasLayer;
}

/** Switch to the Atlas world view. */
function toggleAtlas(btn) {
  document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  [chinaLayer, thailandLayer].forEach(l => { if (l) mapInstance.removeLayer(l); });
  setCityMarkers(false);

  mapInstance.addLayer(buildAtlas());
  mapInstance.setView([12, 105], 3);
}
