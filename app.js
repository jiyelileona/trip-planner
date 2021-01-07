import {getTransitURL, getMapUrl} from './url';
import regeneratorRuntime from 'regenerator-runtime';

const originInputHandler = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    getResultsOfOrigin(e.target.value);
  }
};

const destinationInputHandler = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    getResultsOfDestination(e.target.value);
  }
};

const getResultsOfOrigin = async origin => {
  const res = await fetch(getMapUrl(`${origin}`));
  const {features} = await res.json();
  features.map(feature => {
    const {place_name, text, center} = feature;
    console.log(place_name, text, center);
  });
};

const getResultsOfDestination = async destination => {
  const res = await fetch(getMapUrl(`${destination}`));
  const {features} = await res.json();
  features.map(feature => {
    const {place_name, text, center} = feature;
    console.log(place_name, text, center);
  });
};

const originInput = document.querySelector('.origin-form input');
const destinationInput = document.querySelector('.destination-form input');

originInput.addEventListener('keypress', e => originInputHandler(e));
destinationInput.addEventListener('keypress', e => destinationInputHandler(e));
