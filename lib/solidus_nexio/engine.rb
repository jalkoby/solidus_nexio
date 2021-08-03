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
      SolidusNexio::Engine.routes.default_url_options = app.routes.default_url_options
    end
  end
end
