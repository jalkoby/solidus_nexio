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
      authorize_apm_safely or clean_nexio_after { super }
    end

    def purchase!
      fetch_nexio_amp_transaction('Purchase') or clean_nexio_after { super }
    end

    def update_payment_state_from_nexio(action = nil)
      return unless response_code.present?

      transaction = payment_method.gateway.get_transaction(response_code)
      unless transaction&.data.present? && transaction.status.present?
        error_message = "#{action}: The transaction is not found."
        record_response(build_response(false, error_message))
        return
      end

      message = "#{action}: The transaction #{transaction.data['id']} is updated."
      record_response(build_response(true, message, transaction.data))
      self.state = SolidusNexio::Mappings.payment_state(transaction.status)
      self.amount = failed? || void? ? 0 : transaction.amount
      save
    end

    private

    def build_response(success, message, params = {})
      ActiveMerchant::Billing::Response.new(success, message, params, test: payment_method.gateway.test?)
    end

    def save_nexio_amp_id
      self.response_code = nexio_apm_transaction_id if nexio_apm_transaction_id.present?
    end

    delegate :encrypt_nexio_cvv, to: :source

    def clean_nexio_after
      yield
    ensure
      source.clean_nexio_cvv if nexio_card?
    end

    def fetch_nexio_amp_transaction(action = nil)
      return unless response_code.present? && nexio_apm?

      if update_payment_state_from_nexio(action)
        return true if completed? || pending?
      else
        invalidate!
      end

      raise Spree::Core::GatewayError, I18n.t('spree.payment_processing_failed')
    end

    def authorize_apm_safely
      return unless nexio_apm?

      if update_payment_state_from_nexio('Authorize')
        return true if completed? || pending?
      elsif response_code.present?
        self.auth_confirmation_required = true
        pend! unless completed? || pending?
        PaymentConfirmationJob.set(wait: SolidusNexio.config.payment_confirmation_timeout.minutes).perform_later(self)
      end
    end

    Spree::Payment.include self
    # source set after other attribute assignments
    Spree::Payment.before_validation :save_nexio_amp_id, on: :create, if: :nexio_apm?
    Spree::Payment.before_create :encrypt_nexio_cvv, if: :nexio_card?
  end
end
