# frozen_string_literal: true

require 'solidus_support'

module SolidusNexio
  class Engine < Rails::Engine
    include SolidusSupport::EngineExtensions

    isolate_namespace SolidusNexio
    engine_name 'solidus_nexio'

    config.assets.precompile.push('solidus_nexio/checkout.js')

    config.to_prepare do
      if SolidusSupport.frontend_available?
        ::Spree::CheckoutController.helper CheckoutHelper
        ::Spree::OrdersController.helper CheckoutHelper
      end

      ::Spree::Admin::PaymentsController.helper CheckoutHelper if SolidusSupport.backend_available?
    end

    config.after_initialize do |app|
      app.config.spree.payment_methods << SolidusNexio::PaymentMethod
      ::Spree::PermittedAttributes.source_attributes.push(:encrypted_number)

      app.config.spree.payment_methods << SolidusNexio::AlternativePaymentMethod
      ::Spree::PermittedAttributes.checkout_payment_attributes.each do |item|
        next unless item.is_a?(Hash) && item.key?(:payments_attributes)

        item[:payments_attributes].push(:nexio_apm_transaction_id)
      end

      SolidusNexio::Engine.routes.default_url_options = app.routes.default_url_options
    end

    unless Rails.env.production?
      initializer 'solidus_nexio.setup_gateway_logger' do
        ActiveMerchant::Billing::NexioGateway.logger = Rails.logger
      end
    end
  end
end
