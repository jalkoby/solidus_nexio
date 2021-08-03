const isPresent = value => value && value.trim().length;

let validateCardNumber, validateCardCVC, validateCardExpiry;
let _cardExpiryVal;

if (window.$ && window.$.payment) {
  validateCardNumber = window.$.payment.validateCardNumber;
  validateCardCVC = window.$.payment.validateCardCVC;
  validateCardExpiry = window.$.payment.validateCardExpiry;
  _cardExpiryVal = window.$.payment.cardExpiryVal;
} else {
  validateCardNumber, validateCardCVC = isPresent;
  validateCardExpiry = (month, year) => isPresent(month) && isPresent(year);
  _cardExpiryVal = value => {
    let parts = (value || '').split('/');
    return { month: (parts[0] || '').trim(), year: (parts[1] || '').trim() }
  }
}

export const cardExpiryVal = _cardExpiryVal;

const addError = (errors, key, reason) => {
  errors[key] ||= []
  errors[key].push(reason);
}

export const validator = card => {
  let errors = {};
  ['number', 'name', 'expiry', 'verification_value'].forEach(key =>
    isPresent(card[key]) ? null : addError(errors, key, 'blank')
  );
  if (isPresent(card.number) && !validateCardNumber(card.number)) {
    addError(errors, 'number', 'invalid')
  }
  if (isPresent(card.verification_value) && !validateCardCVC(card.verification_value, card.cc_type)) {
    addError(errors, 'verification_value', 'invalid');
  }

  if (isPresent(card.expiry) && !validateCardExpiry(card.month, card.year)) {
    addError(errors, 'expiry', 'invalid');
  }
  return errors;
}
