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
  if (e.target.tagName !== 'UL') {
    if (list.length === 0) {
      target.classList.add('selected');
      list.push(target);
    } else if (list.length > 0) {
      list.pop().classList.remove('selected');
      target.classList.add('selected');
      list.push(target);
    }
  }
};

const originInput = document.querySelector('.origin-form input');
const destinationInput = document.querySelector('.destination-form input');
const originList = document.querySelector('.origins');
const destinationList = document.querySelector('.destinations');
const tripPlan = document.querySelector('.my-trip');
let list = [];

window.addEventListener('load', cleanUp);
originInput.addEventListener('keypress', e => originInputHandler(e));
destinationInput.addEventListener('keypress', e => destinationInputHandler(e));
originList.addEventListener('click', e => activeSelection(e));
destinationList.addEventListener('click', e => activeSelection(e));
