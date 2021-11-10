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

export const getPaymentState = path => fetch(path).then(detectPaymentState, () => 'failed');
