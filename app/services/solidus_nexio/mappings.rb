# frozen_string_literal: true

module SolidusNexio
  module Mappings
    extend self

    TRANSACTION_STATUS_TO_STATE = {
      3 => 'pending',
      9 => 'completed',
      10 => 'completed',
      11 => 'pending',
      20 => 'completed',
      30 => 'failed',
      32 => 'failed',
      39 => 'void',
      40 => 'void'
    }.freeze

    def payment_state(status)
      TRANSACTION_STATUS_TO_STATE.fetch(status, 'invalid')
    end

    def settled?(status)
      status == 20
    end
  end
end
