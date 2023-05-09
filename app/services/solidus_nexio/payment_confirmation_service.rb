# frozen_string_literal: true

module SolidusNexio
  PaymentConfirmationService = Struct.new(:payment) do
    class << self
      def call(payment)
        return unless payment.nexio_apm? && payment.auth_confirmation_required

        new(payment).confirm_payment_auth!
        clear_auth_confirmation(payment)
      end

      protected

      def clear_auth_confirmation(payment)
        payment.update!(auth_confirmation_required: false)
      end
    end

    def confirm_payment_auth!
      return unless auth_confirmed

      invalidate_payment unless update_payment_state_from_nexio('Auth Confirmation') && auth_confirmed
    end

    private

    delegate :update_payment_state_from_nexio, to: :payment

    def auth_confirmed
      payment.completed? || payment.pending?
    end

    def invalidate_payment
      payment.order&.cancel! or payment.void!
    end
  end
end
