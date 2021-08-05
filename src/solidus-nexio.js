import JSEncrypt from 'jsencrypt'
import Rails from './rails'
import fetch from './fetch'
import { validator, cardExpiryVal } from './card'
import { getFields, getCardData, showError, hideErrors } from './dom'

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

const fetchOneTimeToken = id => {
  let { paths, data } = forms[id];
  return fetch(paths.oneTimeToken, 'POST', { body: { data } }).then(resp => {
    if (resp.status === 201) {
      let data = resp.json.data;
      forms[id].token = data.token;
      return data;
    } else {
      return Promise.reject();
    }
  }, () => Promise.reject());
}

const injectFraudScript = (fields, fraudUrl) => new Promise(resolve => {
  let fraudScripNode = document.createElement('script');
  fraudScripNode.onload = resolve;
  fraudScripNode.src = fraudUrl;
  fields.appendChild(fraudScripNode);
});

const onOneTimeTokenGenerationFail = id => {
  showError('base', 'token_generation_failed', id);
  return Promise.reject();
}

const setupFields = (id, fields) => {
  fields.setAttribute('disabled', 'disabled');
  let onReject = onOneTimeTokenGenerationFail.bind(null, id);
  return fetchOneTimeToken(id).then(data =>
    injectFraudScript(fields, data.fraud_url)
      .then(() => fields.removeAttribute('disabled'), onReject),
    onReject
  );
}

const unlockForm = id => new Promise(resolve => {
  let fields = getFields(id);
  fields.removeAttribute('disabled');
  let submitButton = fields.closest('form').querySelector(Rails.formEnableSelector);
  if (submitButton) {
    setTimeout(() => {
      // to prevent Spree.disableSaveOnClick
      submitButton.removeAttribute('disabled');
      submitButton.classList.remove('disabled');
      resolve();
    }, 100);
  } else {
    resolve();
  }
});

const onCardValidationFail = (id, errors, _card) => {
  Object.entries(errors).forEach(([attr, list]) => {
    list.forEach(item => showError(attr, item, id));
  });
  return unlockForm(id);
}

const onCardTokenGenerationFail = (id, _resp) =>
  // refresh one time token
  setupFields(id, getFields(id)).then(() => {
    showError('base', 'fail_process_card', id);
    return Promise.reject();
  });

export const addNexioOwnForm = (id, config) => {
  forms[id] = config;
}

const resetFormOnError = (id, error = 'default_error') => {
  showError('base', error, id);
  return setupFields(id, getFields(id)).then(() => unlockForm(id));
}

const submitForm = form => {
  form.querySelectorAll('fieldset#payment, fieldset[data-hook="payment"]')
    .forEach(node => node.setAttribute('disabled', 'disabled'));
  let nodePlaceholder = document.createElement('input');
  nodePlaceholder.setAttribute('type', 'hidden');
  nodePlaceholder.setAttribute('name', 'order[nexio_placeholder]');
  nodePlaceholder.setAttribute('value', '1');
  form.appendChild(nodePlaceholder);
  form.submit();
}

const detectPaymentState = resp => (resp.status !== 200 || resp.json.data.state === 'checkout') ? null : resp.json.data.state;

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

const onThreeDSecureRedirect = (id, form, urls) => {
  let checkWindow = window.open(urls.redirect_url, '_blank', 'resizable, width=300, height=400');
  setTimeout(() => {
    checkPaymentState(urls.check_path, checkWindow, status => {
      if (['invalid', 'failed'].includes(status)) {
        resetFormOnError(id, 'fail_three_d_secure_check');
      } else {
        submitForm(form);
      }
    });
  }, 3000);
}

const submitFormToProcess = (form, id) => {
  let formData = new FormData(form);
  formData.delete('_method');
  let config = { body: formData };
  return fetch(forms[id].paths.payment, 'POST', config).then(resp => {
    if (resp.status === 200) {
      switch (resp.json.state) {
        case 'success':
          return submitForm(form);
        case 'three_d_secure':
          return onThreeDSecureRedirect(id, form, resp.json.data);
        case 'error':
          return resetFormOnError(id, resp.json.data && resp.json.data.error || 'fail_process_payment');
        default:
          resetFormOnError(id);
      }
    } else {
      resetFormOnError(id);
    }
  });
}

const addNewCardFlow = (id, fields, form) => {
  let card = getCardData(id);
  Object.assign(card, cardExpiryVal(card.expiry));

  let errors = validator(card);
  if (0 < Object.keys(errors).length) {
    return onCardValidationFail(id, errors, card);
  }
  fields.setAttribute('disabled', 'disabled');
  tokenizeCreditCard(id, card).then(data => {
    fields.querySelector('[data-hook="card_gateway_payment_profile_id"]').value = data.token;
    fields.removeAttribute('disabled');
    if (withThreeDSecure(id)) {
      submitFormToProcess(form, id);
    } else {
      form.submit();
    }
  }, onCardTokenGenerationFail.bind(null, id, fields)).catch(() => resetFormOnError(id));
}

const isNexioCardSelected = (form, id) => {
  let walletCardIds = forms[id].walletCardIds;
  if (!Array.isArray(walletCardIds)) return false;

  let formData = new FormData(form);
  let currentCard = formData.get('order[wallet_payment_source_id]');
  return currentCard && walletCardIds.includes(parseInt(currentCard))
}

const withThreeDSecure = id => forms[id].threeDSecure

export const setupNexioOwnForms = () => {
  if (window.onNexioError) {
    onError = window.onNexioError;
  }

  Object.keys(forms).forEach(id => {
    let fields = getFields(id);
    setupFields(id, fields).then(() => {
      let form = fields.closest('form');
      form.addEventListener('submit', e => {
        hideErrors(id);
        // the payment is hidden and we don't care about it
        if (0 < fields.clientHeight) {
          e.preventDefault();
          addNewCardFlow(id, fields, form);
        } else if (isNexioCardSelected(form, id) && withThreeDSecure(id)) {
          e.preventDefault();
          submitFormToProcess(form, id);
        }
      });
    });
  });
}
