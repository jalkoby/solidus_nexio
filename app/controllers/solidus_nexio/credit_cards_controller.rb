# frozen_string_literal: true

module SolidusNexio
  class CreditCardsController < BasePaymentController
    def create
      token = payment_method.store(credit_card_params)

      if token
        render json: { data: { token: token } }, status: 201
      else
        head 422
      end
    end

    private

    def credit_card_params
      params.require(:data).permit(:currency, :one_time_token,
                                   address: %i[address1 address2 city country phone zip state],
                                   billing_address: %i[address1 address2 city country phone zip state],
                                   card: ::Spree::PermittedAttributes.source_attributes,
                                   customer: %i[first_name last_name email],
                                   order: %i[number date]).to_h.deep_symbolize_keys
    end
  end
end
