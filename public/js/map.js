// Create a Leaflet map
const map = L.map("map").setView(coords, 9); // [lat, lng], zoom

// Add a Geoapify tile layer
L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${mapToken}`, {
attribution: '&copy; <a href="https://www.geoapify.com/">Geoapify</a>',
maxZoom: 20,
}).addTo(map);

const marker = L.marker(coords)
  .addTo(map)
  .bindPopup("Your Location")
  .openPopup();