# frozen_string_literal: true

module SolidusNexio
  module PaymentDecorator
    attr_accessor :nexio_apm_transaction_id

    def nexio_apm?
      source.is_a?(::SolidusNexio::ApmSource)
    end

    def authorize!
      fetch_nexio_amp_transaction or super
    end

    def purchase!
      fetch_nexio_amp_transaction or super
    end

    private

    def save_nexio_amp_id
      self.response_code = nexio_apm_transaction_id if nexio_apm_transaction_id.present?
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
  end
end
