import JSEncrypt from 'jsencrypt'
import Rails from './rails'
import fetch from './fetch'
import validator from './validator'

var forms = {};

let maskCardNumber = number => {
  let head = number.slice(0, 6);
  let tail = number.slice(number.length - 4);
  let base = '*'.repeat(number.length - 10);
  return `${head}${base}${tail}`
}

const tokenizeCreditCard = (id, card) => {
  let config = forms[id];
  var { number, ...cardRest } = card;
  number = number.replace(/\D+/g, '');
  let crypto = new JSEncrypt();
  crypto.setPublicKey(config.publicKey);
  let data = {
    ...config.data,
    one_time_token: config.token,
    card: { ...cardRest, encrypted_number: crypto.encrypt(number), number: maskCardNumber(number) }
  };
  return fetch(config.paths.creditCard, 'POST', { body: { data } }).then(resp => {
    if (resp.status === 201) {
      return resp.json.data;
    } else {
      return Promise.reject(resp);
    }
  }, err => Promise.reject(err));
}

const setupNexioOwnForm = id => {
  let { paths, data } = forms[id];
  return fetch(paths.oneTimeToken, 'POST', { body: { data } }).then(resp => {
    if (resp.status === 201) {
      let data = resp.json.data;
      forms[id].token = data.token;
      return data;
    } else {
      return Promise.reject(resp);
    }
  }, err => Promise.reject(err));
}

const injectFraudScript = (fields, fraudUrl) => new Promise(resolve => {
  let fraudScripNode = document.createElement('script');
  fraudScripNode.onload = resolve;
  fraudScripNode.src = fraudUrl;
  fields.appendChild(fraudScripNode);
});

const onOneTimeTokenGenerationFail = (fields, resp) => {
  // show some error message when one time token is not generated
}

const onCardValidationFail = (fields, errors, card) => {
  let event = new CustomEvent('invalid_nexio_fields');
  event.data = { errors, card };
  fields.dispatchEvent(event);
}

const onCardTokenGenerationFail = (fields, resp) => {
  // show some error message when card token is not generated
}

export const addNexioOwnForm = (id, config) => {
  forms[id] = config;
}

const FIELDS = {
  number: 'nexio_card_number',
  cc_type:'nexio_card_type',
  name:'nexio_card_name',
  month:'nexio_card_month',
  year:'nexio_card_year',
  verification_value:'nexio_verification_value'
};

const getCard = fields => Object.entries(FIELDS).reduce((acc, [key, selector]) => {
  let node = fields.querySelector(`[data-hook="${selector}"]`);
  if (node) {
    acc[key] = node.value;
  }
  return acc;
}, {});

export const setupNexioOwnForms = () => {
  Object.keys(forms).forEach(id => {
    let fields = document.querySelector(`[data-nexio-own-form-id="${id}"]`);
    if (fields === null) return;
    let form = fields.closest('form');
    if (form === null) return;

    let unlockForm = () => {
      fields.removeAttribute('disabled');
      let submitButton = form.querySelector(Rails.formEnableSelector);
      Rails.enableElement(submitButton);
      submitButton.classList.remove('disabled');
    }

    fields.setAttribute('disabled', 'disabled');
    setupNexioOwnForm(id).then(data =>
      injectFraudScript(fields, data.fraud_url).then(() => {
        fields.removeAttribute('disabled');

        form.addEventListener('submit', e => {
          // the payment is hidden and we don't care about it
          if (fields.clientHeight === 0) return;

          e.preventDefault();
          let card = getCard(fields);
          let errors = validator(card);
          if (0 < Object.keys(errors).length) {
            unlockForm();
            return onCardValidationFail(fields, errors, card);
          }
          fields.setAttribute('disabled', 'disabled');
          tokenizeCreditCard(id, card).then(data => {
            fields.querySelector('[data-hook="nexio_card_gateway_payment_profile_id"]').value = data.token;
            fields.removeAttribute('disabled');
            form.submit();
          }, onCardTokenGenerationFail.bind(null, fields)).catch(() => {
            unlockForm();
          });
        });
      }), onOneTimeTokenGenerationFail.bind(null, fields)
    );
  });
}
