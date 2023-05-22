# frozen_string_literal: true

module SolidusNexio
  class PaymentConfirmationJob < ApplicationJob
    def perform(payment)
      PaymentConfirmationService.call(payment)
    end
  end
end
