require('dotenv').config();
import {getTransitURL} from './func/url';

mapboxgl.accessToken = process.env.API_TOKEN;

const getLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true});
  }
};

const error = () => {
  alert('sorry, we are unable to get your location');
};

const success = position => {
  lon = position.coords.longitude;
  lat = position.coords.latitude;
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [lon, lat],
    zoom: 15,
  });

  drawCircle(lon, lat);

  marker = new mapboxgl.Marker({
    color: '#000',
    draggable: true,
    display: true,
  })
    .setLngLat([lon, lat])
    .setPopup(new mapboxgl.Popup().setHTML(`<p>You're here!</p>`))
    .addTo(map);

  getNearestStops(lon, lat);
};

const drawCircle = (lon, lat) => {
  map.on('load', () => {
    map.addSource('source_circle_500', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lon, lat],
            },
          },
        ],
      },
    });

    map.addLayer({
      id: 'circle500',
      type: 'circle',
      source: 'source_circle_500',
      paint: {
        'circle-radius': {
          stops: [
            [0, 0],
            [20, metersToPixelsAtMaxZoom(500, lat)],
          ],
          base: 2,
        },
        'circle-color': 'white',
        'circle-opacity': 0.6,
      },
    });
  });
};

const metersToPixelsAtMaxZoom = (meters, latitude) =>
  meters / 0.075 / Math.cos((latitude * Math.PI) / 180);

const getNearestStops = async (lon, lat) => {
  const res = await fetch(getTransitURL('stops', {lon: lon, lat: lat, distance: 500}));
  const {stops} = await res.json();
  stops.map(stop => {
    const {key, name, centre, distances, direction} = stop;
    createMaker(lon, lat, centre, direction, name, distances);
  });
};

const createMaker = (lon, lat, centre, direction, name, distances) => {
  color =
    direction == 'Southbound'
      ? '#F3AD22'
      : direction == 'Northbound'
      ? '#39BEB9'
      : direction == 'Westbound'
      ? '#5B64AF'
      : '#F15A25';
  marker = new mapboxgl.Marker({
    color: `${color}`,
    display: true,
  })
    .setLngLat([centre.geographic.longitude, centre.geographic.latitude])
    .setPopup(new mapboxgl.Popup().setHTML(`<p>${name}</p><p>${distances.direct} meters</p>`))
    .addTo(map);

  map.setMaxBounds(bounds);
  let canvas = map.getCanvasContainer();
  let bounds = [
    [lon, lat],
    [lon, lat],
  ];

  function getRoute(end) {
    let url =
      'https://api.mapbox.com/directions/v5/mapbox/cycling/' +
      lon +
      ',' +
      lat +
      ';' +
      end[0] +
      ',' +
      end[1] +
      '?steps=true&geometries=geojson&access_token=' +
      mapboxgl.accessToken;

    let req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
      let json = JSON.parse(req.response);
      let data = json.routes[0];
      let route = data.geometry.coordinates;
      let geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      };

      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      } else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: geojson,
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        });
      }
    };
    req.send();
  }

  map.on('click', function (e) {
    let coordsObj = e.lngLat;
    canvas.style.cursor = '';
    let coords = Object.keys(coordsObj).map(key => coordsObj[key]);
    let end = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: coords,
          },
        },
      ],
    };
    if (map.getLayer('end')) {
      map.getSource('end').setData(end);
    } else {
      map.addLayer({
        id: 'end',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: coords,
                },
              },
            ],
          },
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#f30',
        },
      });
    }
    getRoute(coords);
  });
};

let lon, lat, map, marker, color;

window.addEventListener('load', getLocation);
