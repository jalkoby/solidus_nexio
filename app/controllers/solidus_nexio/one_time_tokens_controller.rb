# frozen_string_literal: true

module SolidusNexio
  class OneTimeTokensController < BasePaymentController
    def create
      result = payment_method.generate_token(one_time_token_params)
      if result
        render json: { data: result }, status: 201
      else
        head 422
      end
    end

    private

    def one_time_token_params
      result = params.require(:data).permit(:currency, :callback_url, :request_domain,
                                            address: %i[address1 address2 city country phone zip state],
                                            billing_address: %i[address1 address2 city country phone zip state],
                                            customer: %i[first_name last_name email],
                                            order: %i[number date]).to_h.deep_symbolize_keys

      if payment_method.is_a?(AlternativePaymentMethod)
        result[:callback_url] ||= capture_payment_method_alternative_payments_url(payment_method)
        result[:request_domain] ||= request.domain
      else
        result.delete(:callback_url)
      end
      result
    end
  end
end
