import APM from './apm'
import OwnForm from './own-form'

let payments = [];

export const addNexioOwnForm = (id, config) => payments.push([`[data-nexio-own-form-id="${id}"]`, new OwnForm(id, config)]);

export const addNexioAPM = (id, config) => payments.push([`[data-nexio-apm="${id}"]`, new APM(id, config)]);

export const setupNexio = () => {
  payments.forEach(([selector, payment]) => {
    let fields = document.querySelector(selector);
    if (fields) {
      let form = fields.closest('form');
      payment.setup(form, fields);
    } else {
      console.warn(`SolidusNexio: ${selector} is not found, the payment method ${payment.id} is not initialized.`);
    }
  });
  payments.length = 0;
}
