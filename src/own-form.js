import JSEncrypt from 'jsencrypt'
import Rails from './rails'
import { getOneTimeToken, threeDSecureChallenge, tokenizeCreditCard, startPayment } from './api'
import { validator, cardExpiryVal } from './card'
import { getCardData, setCardValue, showError, hideErrors, injectScript } from './dom'

const maskCardNumber = number => {
  let head = number.slice(0, 6);
  let tail = number.slice(number.length - 4);
  let base = '*'.repeat(number.length - 10);
  return `${head}${base}${tail}`
}

const toCardParams = (config, card, token) => {
  var { number, ...cardRest } = card;
  number = number.replace(/\D+/g, '');
  let crypto = new JSEncrypt();
  crypto.setPublicKey(config.publicKey);
  return {
    ...config.data,
    one_time_token: token,
    card: { ...cardRest, encrypted_number: crypto.encrypt(number), number: maskCardNumber(number) }
  };
}

export default class {
  constructor(id, config) {
    this.id = id;
    this.token = null;
    this.config = config;
    this.onTokenGenerationFail = this.onTokenGenerationFail.bind(this);
    this.onCardTokenGenerationFail = this.onCardTokenGenerationFail.bind(this);
  }

  setup(form, fields) {
    this.form = form;
    this.fields = fields;
    this.baseErrorContainer = form.querySelector('[data-hook="checkout_payment_step"]') || form;
    if (fields) {
      fields.nexioOwnForm = this;
    }
    this.refreshToken().then(() => {
      this.form.addEventListener('submit', e => {
        // check if a new card fields visible
        if (this.withNewCardForm() && 0 < this.fields.clientHeight) {
          hideErrors(this.form);
          e.preventDefault();
          this.addNewCardFlow();
        } else if (this.config.threeDSecure && this.isNexioCardSelected()) {
          hideErrors(this.form);
          e.preventDefault();
          this.submitFormToProcess();
        }
      });
    })
  }

  withNewCardForm() {
    return ['default', 'newCard', 'addWalletCard'].includes(this.config.type);
  }

  showError(attr, err) {
    let container = (attr === 'base') ? this.baseErrorContainer : this.fields || this.baseErrorContainer;
    showError(container, attr, err, this.id);
  }

  refreshToken() {
    if (this.withNewCardForm() && this.token === null) {
      return getOneTimeToken(this.config).then(data => {
        this.token = data.token;
        return injectScript(data.fraud_url);
      }, this.onTokenGenerationFail);
    } else {
      return new Promise(resolve => resolve());
    }
  }

  addNewCardFlow() {
    let card = getCardData(this.fields);
    Object.assign(card, cardExpiryVal(card.expiry));

    let errors = validator(card);
    if (0 < Object.keys(errors).length) {
      return this.onCardValidationFail(errors);
    }
    this.fields.setAttribute('disabled', 'disabled');
    let params = toCardParams(this.config, card, this.token);
    // mark that next time token should be added
    this.token = null;
    return tokenizeCreditCard(this.config, params).then(data => {
      this.fields.querySelector('[data-hook="card_gateway_payment_profile_id"]').value = data.token;
      this.fields.removeAttribute('disabled');
      if (!this.config.threeDSecure || this.config.type === 'addWalletCard') {
        if (this.config.type === 'addWalletCard') {
          setCardValue(this.fields, 'number', params.card.number);
          setCardValue(this.fields, 'verification_value', '');
        }
        this.form.submit();
      } else {
        return this.submitFormToProcess();
      }
    }, this.onCardTokenGenerationFail).catch(() => this.resetFormOnError());
  }

  submitFormToProcess() {
    let formData = new FormData(this.form);
    formData.delete('_method');
    let config = { body: formData };
    return startPayment(this.config.paths.payment, config).then(json => {
      switch (json.state) {
        case 'success':
          return this.submitForm();
        case 'three_d_secure':
          return this.onThreeDSecureRedirect(json.data);
        case 'error':
          return this.resetFormOnError(json.data && json.data.error || 'fail_process_payment');
        default:
          this.resetFormOnError();
      }
    }, () => this.resetFormOnError());
  }

  isNexioCardSelected() {
    if (!this.config.threeDSecure) return false;

    let walletCardIds = this.config.walletCardIds;
    if (!Array.isArray(walletCardIds)) return false;

    let formData = new FormData(this.form);
    let currentCard = formData.get('order[wallet_payment_source_id]');
    return currentCard && walletCardIds.includes(parseInt(currentCard))
  }

  onThreeDSecureRedirect(urls) {
    threeDSecureChallenge(urls, status => {
      if (['invalid', 'failed'].includes(status)) {
        this.resetFormOnError('fail_three_d_secure_check');
      } else {
        this.submitForm();
      }
    });
  }

  submitForm() {
    this.form.querySelectorAll('fieldset#payment, fieldset[data-hook="payment"]')
      .forEach(node => node.setAttribute('disabled', 'disabled'));
    let nodePlaceholder = document.createElement('input');
    nodePlaceholder.setAttribute('type', 'hidden');
    nodePlaceholder.setAttribute('name', 'order[nexio_placeholder]');
    nodePlaceholder.setAttribute('value', '1');
    this.form.appendChild(nodePlaceholder);
    this.form.submit();
  }

  unlockForm() {
    return new Promise(resolve => {
      // to prevent Spree.disableSaveOnClick
      setTimeout(() => {
        if (this.fields) {
          this.fields.removeAttribute('disabled');
        }
        let submitButton = this.form.querySelector(Rails.formEnableSelector);
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('disabled');
        }
        let error = new Error('nexio_fail');
        resolve(error);
      }, 100);
    });
  }

  // errors handlers
  resetFormOnError(err = 'default_error') {
    this.showError('base', err);
    return this.refreshToken().then(() => this.unlockForm());
  }

  onCardValidationFail(errors) {
    Object.entries(errors).forEach(([attr, list]) =>
      list.forEach(item => this.showError(attr, item)));
    return this.unlockForm();
  }

  onTokenGenerationFail() {
    this.showError('base', 'token_generation_failed');
    return Promise.reject();
  }

  onCardTokenGenerationFail() {
    // refresh one time token
    return this.refreshToken().then(() => {
      this.showError('base', 'fail_process_card');
      return Promise.reject();
    });
  }
}
