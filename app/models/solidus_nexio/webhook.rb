# frozen_string_literal: true

module SolidusNexio
  class Webhook < ApplicationRecord
    def self.process(event_type, data)
      record = create(data: data) if SolidusNexio.config.save_webhooks

      SolidusNexio.config.webhooks.each { |service| service.call(event_type, data, record) }
    end
  end
end
