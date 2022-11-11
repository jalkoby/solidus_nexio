import { getOneTimeToken } from './api'
import { hideErrors, setCardValue, showError } from './dom'

const nexioApmIFrameClass = 'solidus-nexio-apm-iframe';

const fetchValidEvent = (data) => {
  switch (typeof data) {
    case 'object':
      return data.event;
    case 'string':
      let request;
      try {
        request = Object.values(JSON.parse(data))[0][0];
      } catch (e) {
        return false;
      }
      return request.name;
    default:
      return false;
  }
}

const stretchIFrame = () => {
  const iframe = $('iframe.' + nexioApmIFrameClass);
  iframe.css('height', '100%');
  iframe.css('position', 'fixed');
  iframe.css('width', '100%');
  iframe.css('top', '0');
  iframe.css('left', '0');
  iframe.css('z-index', '100');
}

const restoreIFrameSize = () => {
  const iframe = $('iframe.' + nexioApmIFrameClass);
  iframe.css('height', '50px');
  iframe.css('position', '');
  iframe.css('width', '');
  iframe.css('top', '');
  iframe.css('left', '');
  iframe.css('z-index', '');
}

export default class {
  constructor(id, config) {
    this.id = id;
    this.config = config;
  }

  setup(form, fields) {
    fields.classList.add('solidus-nexio-apm');
    getOneTimeToken(this.config).then(data => {
      let iframe = document.createElement('iframe');
      window.addEventListener('message', e => {
        if (iframe.contentWindow !== e.source) return;
        let data = e.data
        let iframe_event = fetchValidEvent(data);
        switch (iframe_event) {
          case 'loaded':
            fields.classList.add('solidus-nexio-apm--loaded');
            break;
          case 'zoid_delegate_paypal_checkout':
            stretchIFrame();
            break;
          case 'success':
            restoreIFrameSize();
            submitForm(form, fields, data.data);
            break;
          case 'error':
            restoreIFrameSize();
            hideErrors(fields);
            showError(fields, 'base', data.data.message || 'nexio_apm_payment_failed');
            break;
        }
      });
      iframe.setAttribute('src', data.iframe_url);
      iframe.classList.add(nexioApmIFrameClass);
      iframe.setAttribute('scrolling', 'no');
      iframe.style.cssText = 'overflow:hidden';
      fields.appendChild(iframe);
    });
  }
}
