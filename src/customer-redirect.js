import { getOneTimeToken } from './api'

export default class {
  constructor(id, config) {
    this.id = id;
    this.config = config;
  }

  setup(form, customer_redirect_link) {
    const payment_slug = customer_redirect_link.dataset.nexioPaymentMethod;
    form.classList.add('solidus-nexio-apm');
    let one_time_token_params = this.config;
    if (customer_redirect_link.dataset.callbackUrl) {
      one_time_token_params.callback_url = customer_redirect_link.dataset.callbackUrl
    }
    getOneTimeToken(one_time_token_params).then(data => {
      form.classList.add('nexio-apm--loaded');
      customer_redirect_link.setAttribute("href", data.redirect_urls[payment_slug]);
      customer_redirect_link.classList.remove("hidden");
    });
  }
}
