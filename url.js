require('dotenv').config({path: '.env'});

function getTransitURL(path, parameters) {
  const url = new URL('http://api.winnipegtransit.com');
  url.pathname = `v3/${path}.json`;
  let params = new URLSearchParams();
  params.set('api-key', `${process.env.API_KEY}`);

  for (const [key, value] of Object.entries(parameters)) {
    params.append(key, value);
  }

  url.search = params.toString();

  return url.href;
}

function getMapUrl(path) {
  const url = new URL('https://api.mapbox.com');
  url.pathname = `geocoding/v5/mapbox.places/${path}.json`;
  let params = new URLSearchParams();
  params.set('access_token', `${process.env.API_TOKEN}`);
  params.set('bbox', '-97.325875,49.766204,-96.953987,49.99275');

  url.search = params.toString();

  return url.href;
}

export {getTransitURL, getMapUrl};
