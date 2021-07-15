# frozen_string_literal: true

module SolidusNexio
  class PaymentMethod < SolidusSupport.payment_method_parent_class(credit_card: true)
    # Preferences for configuration of Braintree credentials
    preference(:server, :string, default: 'test')
    preference(:merchant_id, :string, default: nil)
    preference(:auth_token, :string, default: nil)
    preference(:public_key, :string, default: nil)
    preference(:ui, :boolean, default: 'own_form') # in future add iframe

    def partial_name
      "nexio_#{preferred_ui}"
    end
    alias method_type partial_name

    def generate_token(options)
      gateway.generate_token(options)
    end

    def store(options)
      card_attrs = options[:card]
                   .slice(:encrypted_number, :number, :name, :month, :year)
                   .merge!(
                     brand: options[:card][:cc_type],
                     one_time_token: options[:one_time_token],
                     own_form: preferred_ui == 'own_form'
                   )
      card = ActiveMerchant::Billing::EncryptedNexioCard.new(card_attrs)
      return unless card.valid?

      gateway.store(card, options.except(:card, :one_time_token))
    end

    protected

    def gateway_class
      ActiveMerchant::Billing::NexioGateway
    end
  end
end
