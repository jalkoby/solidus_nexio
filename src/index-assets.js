import { addNexioAPM, addNexioCustomerRedirect, addNexioOwnForm, setupNexio } from './solidus-nexio'

window.addNexioOwnForm = addNexioOwnForm;
window.addNexioAPM = addNexioAPM;
window.addNexioCustomerRedirect = addNexioCustomerRedirect;
window.setupNexio = setupNexio;

Spree.ready(function($) {
  setupNexio();

  let showExistingCardCvv = () => {
    $('[data-hook="nexio_cvc_confirm_row"]').hide();
    let id = $('.existing-cc-radio:checked').val();
    if (id) {
      $(`#spree_wallet_payment_source_${id}_cvc_confirm`).show();
    }
  }
  showExistingCardCvv();
  $('#existing_cards').on('change', '.existing-cc-radio', showExistingCardCvv);
});
