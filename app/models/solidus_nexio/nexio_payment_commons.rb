# frozen_string_literal: true

module SolidusNexio
  module NexioPaymentCommons
    def purchase(money, payment, options = {})
      super(money, payment, add_transaction_options(options))
    end

    def authorize(money, payment, options = {})
      super(money, payment, add_transaction_options(options))
    end

    def cancel(id)
      transaction = gateway.get_transaction(id)
      return unless transaction

      if Mappings.settled?(transaction.status)
        credit(transaction.amount.to_money.cents, id)
      else
        void(id)
      end
    end

    private

    def add_transaction_options(options)
      result = %i[currency billing_address].each_with_object({}) do |key, acc|
        acc[key] = options[key] if options[key].present?
      end
      result[:address] = options[:shipping_address] if options[:shipping_address].present?
      if options[:originator].respond_to?(:order)
        result.merge!(SolidusNexio::NexioData.purchase(options[:originator].order))
      end
      result
    end
  end
end
