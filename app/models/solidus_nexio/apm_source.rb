# frozen_string_literal: true

module SolidusNexio
  class ApmSource < Spree::PaymentSource
    self.table_name = 'solidus_nexio_apm_sources'

    belongs_to :user, class_name: Spree::UserClassHandle.new, foreign_key: 'user_id', optional: true

    enum kind: {
      braintree_pay_pal: 0,
      pay_pal: 1,
      apple_pay_cyber_source: 2
    }

    def reusable?
      gateway_payment_profile_id.present?
    end

    def name
      I18n.t("nexio.apms.#{kind}.name")
    end
  end
end
