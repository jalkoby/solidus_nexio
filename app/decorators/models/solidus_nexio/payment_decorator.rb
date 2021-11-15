# frozen_string_literal: true

module SolidusNexio
  module PaymentDecorator
    attr_accessor :nexio_apm_transaction_id

    def nexio_apm?
      payment_method.is_a?(::SolidusNexio::AlternativePaymentMethod)
    end

    def nexio_card?
      payment_method.is_a?(::SolidusNexio::PaymentMethod)
    end

    def authorize!
      fetch_nexio_amp_transaction or clean_nexio_after { super }
    end

    def purchase!
      fetch_nexio_amp_transaction or clean_nexio_after { super }
    end

    private

    def save_nexio_amp_id
      self.response_code = nexio_apm_transaction_id if nexio_apm_transaction_id.present?
    end

    delegate :encrypt_nexio_cvv, to: :source

    def clean_nexio_after
      yield
    ensure
      source.clean_nexio_cvv if nexio_card?
    end

    def fetch_nexio_amp_transaction
      return unless response_code.present? && nexio_apm?

      transaction = payment_method.gateway.get_transaction(response_code)
      if transaction
        self.amount = transaction.amount
        self.state = SolidusNexio::Mappings.payment_state(transaction.status)
        save!
        return true if completed? || pending?
      else
        invalidate!
      end

      raise Core::GatewayError, I18n.t('spree.payment_processing_failed')
    end

    Spree::Payment.include self
    # source set after other attribute assignments
    Spree::Payment.before_validation :save_nexio_amp_id, on: :create, if: :nexio_apm?
    Spree::Payment.before_create :encrypt_nexio_cvv, if: :nexio_card?
  end
end
