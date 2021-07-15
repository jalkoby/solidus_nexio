import Rails from './rails'

const responseHandler = resp => {
  let { headers, status } = resp;

  if(status === 404 || 500 <= status) {
    return Promise.reject({ headers, status });
  } else if ((resp.headers.get('Content-Type') + '').indexOf('json') !== -1 && resp.status !== 204) {
    return resp.json().then(
      json => ({ headers, status, json }),
      () => ({ headers, status, json: null })
    );
  } else {
    return { headers, status, json: null };
  }
}

export default (path, method = 'GET', config = {}) => {
  var payload = { method, credentials: 'same-origin', headers: new Headers() };
  payload.headers.append('X-CSRF-Token', Rails.csrfToken());
  payload.headers.append('accept', 'application/json');
  if(config.body) {
    if(config.body instanceof FormData) {
      payload.body = config.body;
    } else {
      payload.body = JSON.stringify(config.body);
      payload.headers.append('content-type', 'application/json');
    }
  }
  return window.fetch(path, payload).then(responseHandler, err => Promise.reject(err));
}
