import {getTransitURL, getMapUrl} from './func/url';
import regeneratorRuntime from 'regenerator-runtime';

const originInputHandler = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    originList.innerHTML = '';
    if (e.target.value !== '') {
      getResultsOfOrigin(e.target.value);
    } else {
      tripPlan.innerHTML = '<li>Please enter your origin</li>';
    }
  }
};

const destinationInputHandler = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    destinationList.innerHTML = '';
    if (e.target.value !== '') {
      getResultsOfDestination(e.target.value);
    } else {
      tripPlan.innerHTML = '<li>Please enter your destination</li>';
    }
  }
};

const getResultsOfOrigin = async origin => {
  const res = await fetch(getMapUrl(`${origin}`));
  const {features} = await res.json();
  if (features.length !== 0) {
    features.map(feature => {
      const {place_name, text, center} = feature;
      showOriginList(text, place_name.split(',')[1], center[0], center[1]);
    });
  } else {
    originInput.value = '';
    tripPlan.innerHTML = '<li>sorry, no origin information found</li>';
  }
};

const getResultsOfDestination = async destination => {
  const res = await fetch(getMapUrl(`${destination}`));
  const {features} = await res.json();
  if (features.length !== 0) {
    features.map(feature => {
      const {place_name, text, center} = feature;
      showDestinationList(text, place_name.split(',')[1], center[0], center[1]);
    });
  } else {
    destinationInput.value = '';
    tripPlan.innerHTML = '<li>sorry, no destination information found</li>';
  }
};

const showOriginList = (name, address, lon, lat) => {
  originList.insertAdjacentHTML(
    'beforeend',
    `
    <li data-long="${lon}" data-lat="${lat}">
      <div class="name">${name}</div>
      <div>${address}</div>
    </li>
  `
  );
};

const showDestinationList = (name, address, lon, lat) => {
  destinationList.insertAdjacentHTML(
    'beforeend',
    `
    <li data-long="${lon}" data-lat="${lat}">
      <div class="name">${name}</div>
      <div>${address}</div>
    </li>
  `
  );
};

const activeSelection = ele => {
  const target = ele.closest('li');
  if (ele.tagName !== 'UL' && ele.closest('ul').classList.contains('origins')) {
    if (list1.length === 0) {
      target.classList.add('selected');
      list1.push(target);
    } else if (list1.length > 0) {
      list1.pop().classList.remove('selected');
      target.classList.add('selected');
      list1.push(target);
    }
  } else if (ele.tagName !== 'UL' && ele.closest('ul').classList.contains('destinations')) {
    if (list2.length === 0) {
      target.classList.add('selected');
      list2.push(target);
    } else if (list1.length > 0) {
      list2.pop().classList.remove('selected');
      target.classList.add('selected');
      list2.push(target);
    }
  }
};

const getData = () => {
  tripPlan.innerHTML = '';
  if (list1.length !== 0 && list2.length !== 0) {
    if (
      list1[0].getAttribute('data-long') == list2[0].getAttribute('data-long') &&
      list1[0].getAttribute('data-lat') == list2[0].getAttribute('data-lat')
    ) {
      tripPlan.innerHTML = '<li>you cannot have duplicate location</li>';
    } else {
      getLocationData(
        list1[0].getAttribute('data-long'),
        list1[0].getAttribute('data-lat'),
        list2[0].getAttribute('data-long'),
        list2[0].getAttribute('data-lat')
      );
    }
  } else if (originInput.value == '' || destinationInput.value == '') {
    tripPlan.innerHTML = '<li>please enter a valid location</li>';
  } else if (list1.length == 0 || list2.length == 0) {
    tripPlan.innerHTML = '<li>please select a location</li>';
  }
};

const getLocationData = async (lon1, lat1, lon2, lat2) => {
  const res1 = await fetch(getTransitURL('locations', {lon: lon1, lat: lat1, 'max-results': 1}));
  const data1 = await res1.json();
  const res2 = await fetch(getTransitURL('locations', {lon: lon2, lat: lat2, 'max-results': 1}));
  const data2 = await res2.json();
  getTripPlan(data1.locations[0], data2.locations[0]);
};

const getTripPlan = async (origin, destination) => {
  origin.type = origin.type == 'address' ? origin.type + 'es' : origin.type + 's';
  destination.type =
    destination.type == 'address' ? destination.type + 'es' : destination.type + 's';

  const res = await fetch(
    getTransitURL('trip-planner', {
      origin: `${origin.type}/${origin.key}`,
      destination: `${destination.type}/${destination.key}`,
    })
  );
  const {plans} = await res.json();
  let counter = 0;
  plans.map(plan => {
    counter++;
    let {segments} = plan;
    segments.map(segment => {
      const {from, times, to, route, type} = segment;
      planDataHandler(from, times, to, route, type, counter);
    });
  });
};

const planDataHandler = (from, times, to, route, type, count) => {
  let text, minute, icon;
  let header = false;
  minute = times.durations.total > 1 ? 'minutes' : 'minute';

  switch (type) {
    case 'walk':
      header = from.origin == undefined ? false : true;
      text = `Walk for ${times.durations.total} ${minute} to ${
        from.origin == undefined ? 'your destination' : `stop #${to.stop.key} - ${to.stop.name}`
      }`;
      icon = 'fa-walking';
      break;
    case 'ride':
      text = `Ride the ${route.name == undefined ? route.key : route.name} for ${
        times.durations.total
      } ${minute}`;
      icon = 'fa-bus';
      break;
    case 'transfer':
      text = `Transfer from stop #${from.stop.key} - ${from.stop.name} to stop #${to.stop.key} - ${to.stop.name}`;
      icon = 'fa-ticket-alt';
      break;
  }

  createPLanHTML(icon, text, header, count);
};

const createPLanHTML = (icon, text, header, count) => {
  tripPlan.insertAdjacentHTML(
    'beforeend',
    `
    ${header ? `<h2>Plan ${count} ${count == 1 ? '(recommend)' : ''}</h2>` : ''}
    <li>
      <i class="fas ${icon}" aria-hidden="true"></i>${text}
    </li>
  `
  );
};

const originInput = document.querySelector('.origin-form input');
const destinationInput = document.querySelector('.destination-form input');
const originList = document.querySelector('.origins');
const destinationList = document.querySelector('.destinations');
const tripPlan = document.querySelector('.my-trip');
const button = document.querySelector('button');
let list1 = [];
let list2 = [];

originInput.addEventListener('keypress', e => originInputHandler(e));
destinationInput.addEventListener('keypress', e => destinationInputHandler(e));
originList.addEventListener('click', e => activeSelection(e.target));
destinationList.addEventListener('click', e => activeSelection(e.target));
button.addEventListener('click', getData);
