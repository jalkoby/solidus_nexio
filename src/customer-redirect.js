import { getOneTimeToken } from './api'

const nexioCustomerRedirectClass = 'solidus-nexio-customer-redirect';

export default class {
  constructor(id, config) {
    this.id = id;
    this.config = config;
  }

  setup(form, customer_redirect_link) {
    const payment_slug = customer_redirect_link.dataset.nexioPaymentMethod;
    let spinner = form.getElementsByClassName("spinner")[0];
    let one_time_token_params = this.config;
    if (customer_redirect_link.dataset.callbackUrl) {
      one_time_token_params.callback_url = customer_redirect_link.dataset.callbackUrl
    }
    getOneTimeToken(one_time_token_params).then(data => {
      if (spinner) {
        spinner.classList.add("hidden");
      }
      customer_redirect_link.setAttribute("href", data.redirect_urls[payment_slug]);
      customer_redirect_link.classList.remove("hidden");
    });
  }
}
