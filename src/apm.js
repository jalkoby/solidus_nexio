import { getOneTimeToken } from './api'
import { hideErrors, setCardValue, showError } from './dom'

const nexioApmIFrameClass = 'solidus-nexio-apm-iframe';

const submitForm = (form, fields, data) => {
  setCardValue(fields, 'nexio_apm_transaction_id', data.id);
  if (data.apm) {
    setCardValue(fields, 'gateway_payment_profile_id', data.apm.token);
  }
  form.submit();
}

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

const stretchIFrame = (iframe_id) => {
  const iframe = $(`iframe#${iframe_id}`);
  iframe.css('height', '100%');
  iframe.css('position', 'fixed');
  iframe.css('width', '100%');
  iframe.css('top', '0');
  iframe.css('left', '0');
  iframe.css('z-index', '1001');
}

const restoreIFrameSize = (iframe_id) => {
  const iframe = $(`iframe#${iframe_id}`);
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
    const payment_slug = fields.dataset.nexioPaymentMethod;
    const iframe_id = `nexio-${payment_slug}-apm-iframe`;

    let spinner = form.getElementsByClassName("spinner")[0];
    let button = form.getElementsByClassName("solidus-nexio-apm")[0];

    getOneTimeToken(this.config).then(data => {
      let iframe = document.createElement('iframe');
      iframe.id = iframe_id;
      window.addEventListener('message', e => {
        if (iframe.contentWindow !== e.source) return;
        let data = e.data;
        let iframe_event = fetchValidEvent(data);
        if (typeof iframe_event === 'string' && iframe_event.match(/loaded$/i)) {
          iframe_event = 'loaded';
        }
        switch (iframe_event) {
          case 'loaded':
            if (payment_slug == 'applePayCyberSource') {
              if (spinner) { spinner.classList.add("hidden"); }
            }

            break;
          case 'zoid_delegate_paypal_checkout':
            if (payment_slug == 'braintreePayPal') stretchIFrame(iframe_id);
            break;
          case 'success':
            if (payment_slug == 'braintreePayPal') restoreIFrameSize(iframe_id);

            if (payment_slug == 'applePayCyberSource') {
              if (spinner) { spinner.classList.remove("hidden"); }
              if (button) { button.classList.add("hidden"); }
            }

            submitForm(form, fields, data.data);
            break;
          case 'error':
            if (payment_slug == 'braintreePayPal') restoreIFrameSize(iframe_id);
            hideErrors(fields);
            showError(fields, 'base', data.data.message || 'nexio_apm_payment_failed');
            break;
        }
      });
      iframe.setAttribute('src', data.button_urls[payment_slug]);
      iframe.classList.add(nexioApmIFrameClass);
      iframe.setAttribute('scrolling', 'no');
      iframe.style.cssText = 'overflow:hidden';
      if (payment_slug.includes('applePay') && data.script_url) {
        let applePayScript = document.createElement('script');
        applePayScript.setAttribute('src', data.script_url);
        fields.appendChild(applePayScript);
      }
      fields.appendChild(iframe);
    });
  }
}
