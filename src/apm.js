import { getOneTimeToken } from './api'
import { hideErrors, setCardValue, showError } from './dom'

const submitForm = (form, fields, data) => {
  setCardValue(fields, 'nexio_apm_transaction_id', data.id);
  if (data.apm) {
    setCardValue(fields, 'gateway_payment_profile_id', data.apm.token);
  }
  form.submit();
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
        if (data && typeof data === 'object') {
          switch (data.event) {
            case 'loaded':
              fields.classList.add('solidus-nexio-apm--loaded');
              break;
            case 'success':
              submitForm(form, fields, data.data);
              break;
            case 'error':
              hideErrors(fields);
              showError(fields, 'base', data.data.message || 'nexio_apm_payment_failed');
              break;
          }
        }
      });
      iframe.setAttribute('src', data.iframe_url);
      iframe.classList.add('solidus-nexio-apm-iframe');
      fields.appendChild(iframe);
    });
  }
}
