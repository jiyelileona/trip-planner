import {getTransitURL, getMapUrl} from './url';
import regeneratorRuntime from 'regenerator-runtime';

const cleanUp = () => {
  originList.innerHTML = '';
  destinationList.innerHTML = '';
  tripPlan.innerHTML = '';
};

const originInputHandler = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    originList.innerHTML = '';
    getResultsOfOrigin(e.target.value);
  }
};

const destinationInputHandler = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    destinationList.innerHTML = '';
    getResultsOfDestination(e.target.value);
  }
};

const getResultsOfOrigin = async origin => {
  const res = await fetch(getMapUrl(`${origin}`));
  const {features} = await res.json();
  features.map(feature => {
    const {place_name, text, center} = feature;
    showOriginList(text, place_name.split(',')[1], center[0], center[1]);
  });
};

const getResultsOfDestination = async destination => {
  const res = await fetch(getMapUrl(`${destination}`));
  const {features} = await res.json();
  features.map(feature => {
    const {place_name, text, center} = feature;
    showDestinationList(text, place_name.split(',')[1], center[0], center[1]);
  });
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

const activeSelection = e => {
  const target = e.target.closest('li');
  if (e.target.tagName !== 'UL' && e.target.closest('ul').classList.contains('origins')) {
    if (list1.length === 0) {
      target.classList.add('selected');
      list1.push(target);
    } else if (list1.length > 0) {
      list1.pop().classList.remove('selected');
      target.classList.add('selected');
      list1.push(target);
    }
  } else if (
    e.target.tagName !== 'UL' &&
    e.target.closest('ul').classList.contains('destinations')
  ) {
    if (list2.length === 0) {
      target.classList.add('selected');
      list2.push(target);
    } else if (list1.length > 0) {
      list2.pop().classList.remove('selected');
      target.classList.add('selected');
      list2.push(target);
    }
  }
  getData(list1, list2);
};

const getData = (list1, list2) => {
  if (list1.length !== 0 && list2.length !== 0) {
    getLocationData(
      list1[0].getAttribute('data-long'),
      list1[0].getAttribute('data-lat'),
      list2[0].getAttribute('data-long'),
      list2[0].getAttribute('data-lat')
    );
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
};

const originInput = document.querySelector('.origin-form input');
const destinationInput = document.querySelector('.destination-form input');
const originList = document.querySelector('.origins');
const destinationList = document.querySelector('.destinations');
const tripPlan = document.querySelector('.my-trip');
let list1 = [];
let list2 = [];

window.addEventListener('load', cleanUp);
originInput.addEventListener('keypress', e => originInputHandler(e));
destinationInput.addEventListener('keypress', e => destinationInputHandler(e));
originList.addEventListener('click', e => activeSelection(e));
destinationList.addEventListener('click', e => activeSelection(e));
