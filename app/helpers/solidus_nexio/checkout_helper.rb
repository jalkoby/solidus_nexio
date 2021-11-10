# frozen_string_literal: true

module SolidusNexio
  module CheckoutHelper
    def setup_nexio_own_form(payment_method, type: :default, user: nil, order: nil)
      setup_nexio_checkout

      config = {
        type: type,
        publicKey: payment_method.preferred_public_key,
        threeDSecure: payment_method.preferred_three_d_secure,
        paths: {
          oneTimeToken: solidus_nexio.payment_method_one_time_tokens_path(payment_method),
          creditCard: solidus_nexio.payment_method_credit_cards_path(payment_method),
          payment: solidus_nexio.payment_method_payments_path(payment_method)
        },
        data: NexioData.one_time_token(user: user, order: order)
      }

      if @wallet_payment_sources
        config[:walletCardIds] = @wallet_payment_sources.each_with_object([]) do |wps, acc|
          acc.push(wps.id) if wps.payment_source && wps.payment_source.payment_method_id == payment_method.id
        end
      end

      javascript_tag("window.addNexioOwnForm(#{payment_method.id}, #{config.to_json});")
    end

    def setup_nexio_apm(payment_method, order, user: nil)
      setup_nexio_checkout

      config = {
        data: NexioData.one_time_token(user: user, order: order),
        paths: {
          oneTimeToken: solidus_nexio.payment_method_one_time_tokens_path(payment_method)
        }
      }
      javascript_tag("window.addNexioAPM(#{payment_method.id}, #{config.to_json});")
    end

    def setup_nexio_checkout
      # include js script only once per request
      return if @__nexio_checkout_script

      content_for(:head) do
        javascript_tag("window.nexioErrorMessages = #{I18n.t('nexio.errors').to_json};") +
          javascript_include_tag('solidus_nexio/checkout.js')
      end
      @__nexio_checkout_script = true

      nil
    end
  end
end
