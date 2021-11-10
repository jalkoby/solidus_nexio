# frozen_string_literal: true

module SolidusNexio
  class Webhook < ApplicationRecord
    def self.process(event_type, data); end
  end
end
