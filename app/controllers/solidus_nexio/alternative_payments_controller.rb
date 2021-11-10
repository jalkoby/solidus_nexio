# frozen_string_literal: true

module SolidusNexio
  class AlternativePaymentsController < Spree::StoreController
    def capture
      render text: 'ok'
    end
  end
end
