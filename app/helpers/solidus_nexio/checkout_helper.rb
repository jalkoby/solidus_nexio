# frozen_string_literal: true

module SolidusNexio
  module CheckoutHelper
    def setup_nexio_own_form(payment_method, user:, order:)
      # include js script only once per request
      unless @__nexio_checkout_script
        content_for(:head) { javascript_include_tag('solidus_nexio/checkout.js') }
        @__nexio_checkout_script = true
      end

      config = {
        publicKey: payment_method.preferred_public_key,
        paths: {
          oneTimeToken: solidus_nexio.payment_method_one_time_tokens_path(payment_method),
          creditCard: solidus_nexio.payment_method_credit_cards_path(payment_method)
        },
        data: NexioData.one_time_token(user: user, order: order)
      }
      javascript_tag("window.addNexioOwnForm(#{payment_method.id}, #{config.to_json});")
    end
  end
end
