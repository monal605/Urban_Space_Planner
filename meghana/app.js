// --- CONFIG ---
const cityCoords = {
  'Amaravati': [16.5096679, 80.5184535],
  'Visakhapatnam': [17.6935526, 83.2921297],
  'Guwahati': [26.1805978, 91.753943],
  'Patna': [25.6093239, 85.1235252],
  'Chandigarh': [30.7334421, 76.7797143],
  'Delhi': [28.6273928, 77.1716954],
  'Ahmedabad': [23.0215374, 72.5800568],
  'Gurugram': [28.4646148, 77.0299194],
  'Jorapokhar': [23.7167069, 86.4110166],
  'Bengaluru': [12.98815675, 77.62260003796],
  'Thiruvananthapuram': [8.4882267, 76.947551],
  'Mumbai': [19.054999, 72.8692035],
  'Shillong': [25.5760446, 91.8825282],
  'Bhopal': [23.2584857, 77.401989],
  'Aizawl': [23.7433532, 92.7382756],
  'Brajrajnagar': [21.8498594, 83.9254698],
  'Talcher': [20.9322302, 85.2005822],
  'Amritsar': [31.6356659, 74.8787496],
  'Jaipur': [26.9154576, 75.8189817],
  'Hyderabad': [17.360589, 78.4740613],
  'Chennai': [13.0836939, 80.270186],
  'Coimbatore': [11.0018115, 76.9628425],
  'Lucknow': [26.8381, 80.9346001],
  'Kolkata': [22.5726459, 88.3638953]
};

// --- DATA LOADING ---
function loadCSV(url, cb) {
  fetch(url)
    .then(r => r.text())
    .then(text => {
      const data = Papa.parse(text, { header: true, skipEmptyLines: true }).data;
      cb(data);
    });
}

let stationData = [], parksData = {};

async function fetchParksFromOverpass(city, coords) {
  const [lat, lon] = coords;
  const radius = 7000;
  const query = `[out:json];node[leisure=park](around:${radius},${lat},${lon});out;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data.elements || data.elements.length === 0) {
      return [{ lat: lat + 0.01, lon: lon + 0.01 }];
    }
    return (data.elements || []).map(e => ({ lat: e.lat, lon: e.lon }));
  } catch (e) {
    return [{ lat: lat + 0.01, lon: lon + 0.01 }];
  }
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function initApp() {
  const citySelect = document.getElementById('citySelect');
  Object.keys(cityCoords).forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });

  const map = L.map('map').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  let cityMarker, parkMarkers = [], stationMarkers = [];

  async function updateCity(city) {
    map.setView(cityCoords[city], 12);
    if (cityMarker) map.removeLayer(cityMarker);
    parkMarkers.forEach(m => map.removeLayer(m)); parkMarkers = [];
    stationMarkers.forEach(m => map.removeLayer(m)); stationMarkers = [];

    cityMarker = L.circleMarker(cityCoords[city], {
      radius: 8, color: 'red', fillColor: 'red', fillOpacity: 0.5
    }).addTo(map).bindPopup(city);

    const recDiv = document.getElementById('recommendations');
    recDiv.innerHTML = '<em>Loading green spaces...</em>';

    let parks = parksData[city];
    if (!parks) {
      parks = await fetchParksFromOverpass(city, cityCoords[city]);
      parksData[city] = parks;
    }
    const parkIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/427/427735.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
    parks.forEach(function(park) {
      const marker = L.marker([parseFloat(park.lat), parseFloat(park.lon)], { icon: parkIcon })
        .addTo(map)
        .bindPopup('Green Space');
      marker.setZIndexOffset(1000);
      parkMarkers.push(marker);
    });

    // Use merged_local_pollution.csv for station data, robust city match
    const stations = stationData.filter(function(s) {
      return s.City && s.City.trim().replace(/^"|"$/g, '') === city;
    });
    stations.forEach(function(st) {
      const lat = parseFloat(st.Latitude);
      const lon = parseFloat(st.Longitude);
      if (isNaN(lat) || isNaN(lon)) return; // Skip invalid coordinates
      const marker = L.circleMarker([lat, lon], {
        radius: 6, color: 'blue', fillColor: 'blue', fillOpacity: 0.4
      }).addTo(map).bindPopup(`${st.StationName}<br>AQI: ${st.Average_AQI}`);
      stationMarkers.push(marker);
    });

    // Debug: log how many stations are found for the selected city
    console.log(`Stations found for ${city}:`, stations.length, stations.map(s => s.StationName));
    // Recommendations: top 3 stations with highest AQI in the city (ignore park proximity)
    let recommendedStations = stations
      .filter(function(st) {
        const aqi = parseFloat(st.Average_AQI);
        return !isNaN(aqi);
      })
      .sort(function(a, b) {
        return parseFloat(b.Average_AQI) - parseFloat(a.Average_AQI);
      })
      .slice(0, 3);
    if (recommendedStations.length > 0) {
      recDiv.innerHTML = `<b>📍 Recommended Green Space Locations for ${city}:</b><ul>` +
        recommendedStations.map(function(st) { return `<li>Station: ${st.StationName}, AQI: ${st.Average_AQI}</li>`; }).join('') +
        '</ul>';
    } else {
      recDiv.innerHTML = `<b>📍 Recommended Green Space Locations for ${city}:</b><ul><li>No urgent recommendations (try a different city or zoom out)</li></ul>`;
    }
  }

  citySelect.addEventListener('change', function(e) { updateCity(e.target.value); });
  updateCity(citySelect.value = Object.keys(cityCoords)[0]);
}

// Load all data and start app
loadCSV('merged_local_pollution.csv', function(data2) {
  stationData = data2;
  initApp();
});
