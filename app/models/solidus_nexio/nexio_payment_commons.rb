# frozen_string_literal: true

module SolidusNexio
  module NexioPaymentCommons
    def purchase(money, source, options = {})
      super(money, source, add_transaction_options(source, options))
    end

    def authorize(money, source, options = {})
      super(money, source, add_transaction_options(source, options))
    end

    def cancel(id)
      transaction = gateway.get_transaction(id)
      return error_response(id, 'not found') unless transaction

      if Mappings.settled?(transaction.status)
        credit(transaction.amount.to_money.cents, id)
      else
        void(id)
      end
    end

    private

    def add_transaction_options(source, options)
      result = %i[currency billing_address].each_with_object({}) do |key, acc|
        acc[key] = options[key] if options[key].present?
      end
      result[:address] = options[:shipping_address] if options[:shipping_address].present?
      if options[:originator].respond_to?(:order)
        result.merge!(SolidusNexio::NexioData.purchase(options[:originator].order))
      end
      result
    end

    def error_response(transaction_id, code)
      error_mess = "The transaction ID:#{transaction_id} is #{code} with Nexio API"
      OpenStruct.new('success?': false, to_yml: error_mess)
    end
  end
end
