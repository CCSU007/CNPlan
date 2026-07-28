/**
 * Interactive Map — Leaflet-powered route visualization
 * Shows all cities as markers with toggleable route layers.
 */
let mapInstance = null;
let togetherLayer, dalianLayer, thaiLayer;
let allMarkers = [];
let thaiMarker = null;

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
  const bangkok = [13.7563, 100.5018];

  // ── Route Layer Groups ──
  togetherLayer = L.layerGroup().addTo(mapInstance);
  dalianLayer = L.layerGroup().addTo(mapInstance);
  thaiLayer = L.layerGroup().addTo(mapInstance);

  // Together (Purple): shenzhen → wangxian → chongqing → chengdu
  L.polyline(['shenzhen','wangxian','chongqing','chengdu'].map(id => coords(id)), {
    color: '#6366f1', weight: 3, opacity: 0.7, dashArray: '10, 8',
  }).addTo(togetherLayer);

  // Together (Purple): beijing → nanjing-suzhou → shanghai
  L.polyline(['beijing','nanjing-suzhou','shanghai'].map(id => coords(id)), {
    color: '#6366f1', weight: 3, opacity: 0.7, dashArray: '10, 8',
  }).addTo(togetherLayer);

  // Dalian leg (Pink): chengdu → dalian
  L.polyline([coords('chengdu'), coords('dalian')], {
    color: '#ec4899', weight: 3, opacity: 0.7, dashArray: '10, 8',
  }).addTo(dalianLayer);

  // Dalian → Beijing (Pink): reunite in Beijing
  L.polyline([coords('dalian'), coords('beijing')], {
    color: '#ec4899', weight: 3, opacity: 0.7, dashArray: '10, 8',
  }).addTo(dalianLayer);

  // Thailand (Cyan): chengdu → bangkok
  L.polyline([coords('chengdu'), bangkok], {
    color: '#06b6d4', weight: 3, opacity: 0.6, dashArray: '6, 6',
  }).addTo(thaiLayer);

  // Thailand return: bangkok → beijing
  L.polyline([bangkok, coords('beijing')], {
    color: '#06b6d4', weight: 2, opacity: 0.4, dashArray: '6, 6',
  }).addTo(thaiLayer);

  // ── City Markers (always visible) ──
  const cityIds = ['shenzhen','wangxian','chongqing','chengdu','dalian','beijing','nanjing-suzhou','shanghai'];
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

  // Thailand marker
  allCoords.push(bangkok);
  thaiMarker = L.circleMarker(bangkok, {
    radius: 10, fillColor: '#a78bfa', color: '#fff',
    weight: 2.5, opacity: 1, fillOpacity: 0.9,
  }).addTo(mapInstance);

  thaiMarker.bindPopup(`
    <div style="min-width:180px">
      <div style="font-size:1.5rem;margin-bottom:.2rem">🇹🇭</div>
      <h3 style="margin:0 0 .2rem;font-size:1.05rem">Thailand</h3>
      <div style="font-size:.8rem;color:#64748b">${TRIP.thailand.start} – ${TRIP.thailand.end}</div>
      <hr style="margin:.4rem 0;border:none;border-top:1px solid #e2e8f0" />
      <div style="font-size:.82rem;color:#475569">Bangkok · Chiang Mai · Phuket/Krabi</div>
    </div>
  `);

  // Fit bounds
  const bounds = L.latLngBounds(allCoords);
  mapInstance.fitBounds(bounds, { padding: [50, 50] });

  // Fly to city (called from planner)
  window.flyToCity = function (cityId) {
    const city = TRIP.cities.find(c => c.id === cityId);
    if (city && mapInstance) {
      mapInstance.flyTo(city.coords, 10, { duration: 1.5 });
      const idx = TRIP.cities.indexOf(city);
      if (allMarkers[idx]) allMarkers[idx].openPopup();
    }
  };
}

/**
 * Toggle route layers on the map.
 * @param {'together'|'dalian'|'thai'} route - Route to show
 * @param {HTMLElement} btn - The clicked button
 */
function toggleRoute(route, btn) {
  // Update button states
  document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide layers
  const show = (layer, on) => {
    if (on) mapInstance.addLayer(layer);
    else mapInstance.removeLayer(layer);
  };

  switch (route) {
    case 'together':
      show(togetherLayer, true);
      show(dalianLayer, false);
      show(thaiLayer, false);
      break;
    case 'dalian':
      show(togetherLayer, true);
      show(dalianLayer, true);
      show(thaiLayer, false);
      break;
    case 'thai':
      show(togetherLayer, true);
      show(dalianLayer, false);
      show(thaiLayer, true);
      break;
  }
}
