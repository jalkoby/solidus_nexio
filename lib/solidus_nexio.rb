# frozen_string_literal: true

require 'solidus_nexio/version'
require 'nexio_activemerchant'
require 'solidus_nexio/engine'

module SolidusNexio
  class Error < StandardError; end

  def self.table_name_prefix
    'solidus_nexio_solidus_nexio_'
  end

  @config = OpenStruct.new(merchant_secrets: [], save_webhooks: false)

  def self.config
    yield @config if block_given?
    @config
  end
end
