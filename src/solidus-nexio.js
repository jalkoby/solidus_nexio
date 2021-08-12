import OwnForm from './own-form'

let ownForms = [];
export const addNexioOwnForm = (id, config) => ownForms.push(new OwnForm(id, config));
export const setupNexioOwnForms = () => {
  ownForms.forEach(ownForm => {
    let fields;
    switch (ownForm.config.type) {
      case 'walletCards':
        fields = document.querySelector(`[data-nexio-wallet-cards="${ownForm.id}"]`);
        break;
      default:
        fields = document.querySelector(`[data-nexio-own-form-id="${ownForm.id}"]`);
    }

    if (fields) {
      let form = fields.closest('form');
      ownForm.setup(form, fields);
    }
  });
  ownForms.length = 0;
}
