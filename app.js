import {getTransitURL, getMapUrl} from './url';
import regeneratorRuntime from 'regenerator-runtime';

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

const originInput = document.querySelector('.origin-form input');
const destinationInput = document.querySelector('.destination-form input');
const originList = document.querySelector('.origins');
const destinationList = document.querySelector('.destinations');

originInput.addEventListener('keypress', e => originInputHandler(e));
destinationInput.addEventListener('keypress', e => destinationInputHandler(e));
