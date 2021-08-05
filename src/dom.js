export const getFields = id => document.querySelector(`[data-nexio-own-form-id="${id}"]`);

const ERROR_MESSAGES = window.nexioErrorMessages || { default_error: 'Something went wrong' };

const toErrorMessage = (attr, err) =>
  ERROR_MESSAGES[attr] && ERROR_MESSAGES[attr][err] ||
  ERROR_MESSAGES.base && ERROR_MESSAGES.base[err] ||
  ERROR_MESSAGES.default_error;

const toErrorLabel = (attr, err) => {
  let node = document.createElement('label');
  node.setAttribute('data-nexio-error', attr);
  node.classList.add('error', 'nexio-error');
  node.innerHTML = toErrorMessage(attr, err);
  return node;
}

export const showError = (attr, err, paymentMethodId) => {
  let fields = getFields(paymentMethodId);
  let label = toErrorLabel(attr, err);

  if (attr === 'base') {
    fields.prepend(label);
  } else {
    let input = fields.querySelector(`[name="payment_source[${paymentMethodId}][${attr}]"]`);
    if (input) {
      input.classList.add('error');
      input.parentNode.appendChild(label);
    }
  }
}

export const hideErrors = (paymentMethodId, list = null) => {
  let fields = getFields(paymentMethodId);
  let errorNodes;
  if (list == null) {
    errorNodes = fields.querySelectorAll(`[data-nexio-error]`);
  }

  errorNodes.forEach(node => {
    let parentNode = node.parentNode;
    parentNode.removeChild(node);
    let input = parentNode.querySelector('[name].error');
    if (input) {
      input.classList.remove('error');
    }
  });
}

const FIELDS = {
  number: 'card_number',
  cc_type: 'card_type',
  name: 'card_name',
  expiry: 'card_expiration',
  verification_value: 'card_code'
};

export const getCardData = paymentMethodId => {
  let fields = getFields(paymentMethodId);
  return Object.entries(FIELDS).reduce((acc, [key, selector]) => {
    let field = fields.querySelector(`[data-hook="${selector}"]`);
    if (field) {
      if (['INPUT', 'SELECT'].includes(field.nodeName)) {
        acc[key] = field.value;
      } else {
        let node = field.querySelector('input[name], select[name]');
        if (node) {
          acc[key] = node.value;
        }
      }
    }
    return acc;
  }, {});
}
