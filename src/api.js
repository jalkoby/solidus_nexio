import fetch from './fetch'

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

const checkPaymentState = (path, checkWindow, cb) => {
  fetch(path).then(detectPaymentState).then(state => {
    if (state) {
      cb(state);
    } else if (checkWindow.closed) {
      // check the most recent state
      fetch(path).then(detectPaymentState).then(state => cb(state || 'invalid'));
    } else {
      setTimeout(checkPaymentState.bind(null, path, checkWindow, cb), 2000);
    }
  });
}

const THREE_D_SECURE_WINDOW_OPTS = 'left=20,top=20,width=500,height=500,toolbar=0,resizable=0,scrollbars=1'
export const threeDSecureChallenge = (urls, cb) => {
  let checkWindow = window.open(urls.redirect_url, '_blank', THREE_D_SECURE_WINDOW_OPTS);
  setTimeout(() => {
    checkPaymentState(urls.check_path, checkWindow, cb);
  }, 3000);
}
