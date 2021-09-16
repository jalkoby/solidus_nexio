import fetch from './fetch'
import tingle from 'tingle.js'
import tingleCss from 'raw-loader!./tingle.css'

let style= document.createElement('style');
style.setAttribute('type', 'text/css');
style.innerHTML = tingleCss;
document.head.appendChild(style);

export const getOneTimeToken = ({ paths, data }) => {
  return fetch(paths.oneTimeToken, 'POST', { body: { data } }).then(resp => {
    if (resp.status === 201) {
      let data = resp.json.data;
      return data;
    } else {
      return Promise.reject(resp);
    }
  }, err => Promise.reject(err));
}

export const tokenizeCreditCard = (config, data) =>
  fetch(config.paths.creditCard, 'POST', { body: { data } }).then(resp => {
    if (resp.status === 201) {
      return resp.json.data;
    } else {
      return Promise.reject(resp);
    }
  }, err => Promise.reject(err));

export const startPayment = (url, config) => fetch(url, 'POST', config).then(resp => {
  if (resp.status === 200) {
    return resp.json;
  } else {
    return Promise.reject(resp);
  }
}, err => Promise.reject(err));

const detectPaymentState = resp =>
  (resp.status !== 200 || resp.json.data.state === 'checkout') ? null : resp.json.data.state;

const checkPaymentState = (path, modal, cb) => {
  fetch(path).then(detectPaymentState).then(state => {
    if (state) {
      cb(state);
    } else if (!modal.isOpen()) {
      // check the most recent state
      fetch(path).then(detectPaymentState).then(state => cb(state || 'invalid'));
    } else {
      setTimeout(checkPaymentState.bind(null, path, modal, cb), 2000);
    }
  });
}

export const threeDSecureChallenge = (urls, cb) => {
  let modal = new tingle.modal({
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: 'Close',
    onOpen() {
      setTimeout(() => checkPaymentState(urls.check_path, modal, cb), 3000);
    },
    onClose() {
      modal.$closed = true;
    }
  });
  modal.setContent(`<iframe src="${urls.redirect_url}" class="tingle-modal-box__iframe" />`);
  modal.open();
}
