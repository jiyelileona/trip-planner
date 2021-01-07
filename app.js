import {getTransitURL, getMapUrl} from './url';

const originInputHandler = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    const origin = e.target.value;
  }
};

const destinationInputHandler = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    const destination = e.target.value;
  }
};

const originInput = document.querySelector('.origin-form input');
const destinationInput = document.querySelector('.destination-form input');

originInput.addEventListener('keypress', e => originInputHandler(e));
destinationInput.addEventListener('keypress', e => destinationInputHandler(e));
