const validatePresence = value => value && value.trim().length;

let validateCardNumber, validateCardCVC, validateCardExpiry;
if (window.$ && window.$.payment) {
  validateCardNumber = window.$.payment.validateCardNumber;
  validateCardCVC = window.$.payment.validateCardCVC;
  validateCardExpiry = window.$.payment.validateCardExpiry;
} else {
  validateCardNumber, validateCardCVC = validatePresence;
  validateCardExpiry = (month, year) => validatePresence(month) && validatePresence(year);
}

const addError = (errors, key, reason) => {
  errors[key] ||= []
  errors[key].push(reason);
}

export default card => {
  let errors = {};
  ['number', 'cc_type', 'name', 'month', 'year', 'verification_value'].forEach(key =>
    validatePresence(card[key]) ? null : addError(errors, key, 'blank')
  );
  if (!validateCardNumber(card.number)) {
    addError(errors, 'number', 'blank')
  }
  if (!validateCardCVC(card.verification_value, card.cc_type)) {
    addError(errors, 'verification_value', 'invalid');
  }
  if (!validateCardExpiry(card.month, card.year)) {
    addError(errors, 'month', 'invalid');
    addError(errors, 'year', 'invalid');
  }
  return errors;
}
