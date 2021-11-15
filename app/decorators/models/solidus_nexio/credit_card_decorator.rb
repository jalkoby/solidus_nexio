module SolidusNexio
  module CreditCardDecorator
    # CVV stored encrypted till payment is made, after that #clean_nexio_cvv is called
    def encrypt_nexio_cvv
      return unless verification_value

      update_column(:gateway_customer_profile_id, ::SolidusNexio::EncryptionService.encrypt(last_digits, verification_value))
    end

    def nexio_cvv
      return unless gateway_customer_profile_id.present?

      ::SolidusNexio::EncryptionService.decrypt(last_digits, gateway_customer_profile_id)
    end

    def clean_nexio_cvv
      update_column(:gateway_customer_profile_id, nil) if gateway_customer_profile_id
    end

    ::Spree::CreditCard.prepend self
  end
end
