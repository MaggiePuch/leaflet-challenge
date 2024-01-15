// create map
let map = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
});

// adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// load the USGS GeoJSON Feed data.
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the data with d3.
d3.json(url).then(function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // function for marker size based on magnitude, multiplied by 4 for scaling 
  function markerSize(magnitude) {
    return magnitude * 4; 
  }

  // function for marker color based on depth
  function depthColor(depth) {
    if (depth >= -10 && depth <= 10) return 'purple';
    else if (depth > 10 && depth <= 30) return 'blue';
    else if (depth > 30 && depth <= 50) return 'green';
    else if (depth > 50 && depth <= 70) return 'yellow';
    else if (depth > 70 && depth <= 90) return 'orange';
    else return 'red';
  }

  // function to create markers and bind popups with location, magnitude, depth and date/time 
  function mapEarthquake (feature, layer) {
    const { mag, place, time } = feature.properties;
    const depth = feature.geometry.coordinates[2];
    layer.bindPopup(`<h3>${place}</h3><hr><p>Magnitude: ${mag}<br>Depth: ${depth}<br>Time: ${new Date(time)}</p>`);
  }

  // layer with markers based on earthquakeData
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      const depth = feature.geometry.coordinates[2]; 
      const { mag } = feature.properties;
      return L.circleMarker(latlng, {
        radius: markerSize(mag),
        fillColor: depthColor(depth),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature : mapEarthquake 
  });

  // add earthquakes to the map
  earthquakes.addTo(map);

// set up the legend
let legend = L.control({ position: 'bottomright'});

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'legend');
      depths = [-10, 10, 30, 50, 70, 90],
      colors = ['purple', 'blue', 'green', 'yellow', 'orange', 'red'];
  
      //Add title and context
      div.innerHTML = '<h1>Earthquake Depth</h1>';

    //Loop through depth intervals to create legend items
    for (var i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<div class="legend-item">' +
          '<i style="background:' + colors[i] + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' ' +colors[i] + '<br>' : '+') +
        '</div>';
  }

    return div;
};

legend.addTo(map);
}
