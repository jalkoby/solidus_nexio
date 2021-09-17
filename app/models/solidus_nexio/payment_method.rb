# frozen_string_literal: true

module SolidusNexio
  class PaymentMethod < SolidusSupport.payment_method_parent_class(credit_card: true)
    ProcessResult = Struct.new(:state, :data)

    # Preferences for configuration of Braintree credentials
    preference(:server, :string, default: 'test')
    preference(:merchant_id, :string, default: nil)
    preference(:auth_token, :string, default: nil)
    preference(:public_key, :string, default: nil)
    preference(:ui, :string, default: 'own_form') # in future add iframe
    preference(:three_d_secure, :boolean, default: false)

    def process_order_payment(order)
      payment = payments.merge(order.payments).checkout.last
      # nothing needed to be done, as other payments cover order
      return ProcessResult.new(:success, :absent) unless payment

      callback_url = yield payment
      payment.instance_variable_set(:@nexio_callback_url, callback_url)

      begin
        payment.process!
        ProcessResult.new(:success, nil)
      rescue Spree::Core::GatewayError => error
        redirect_url = nexio_three_d_secure_redirect_url(payment)
        return ProcessResult.new(:error, error: :fail_process_payment) unless redirect_url

        payment.state = :checkout
        payment.save!
        ProcessResult.new(:three_d_secure, {
          redirect_url: redirect_url,
          check_path: Engine.routes.url_helpers.payment_method_payment_state_path(self, payment)
        })
      ensure
        payment.remove_instance_variable(:@nexio_callback_url)
      end
    end

    def capture_order_payment(payment, id, status)
      return ProcessResult.new(:invalid, nil) unless payment.checkout?

      if id.present? && %w[pending authOnly].include?(status)
        payment.response_code = id
        auto_capture? ? payment.complete! : payment.pend!
        ProcessResult.new(:success, nil)
      else
        payment.invalidate!
        ProcessResult.new(:invalid, nil)
      end
    end

    def partial_name
      "nexio_#{preferred_ui}"
    end
    alias method_type partial_name

    def generate_token(options)
      gateway.generate_token(options)
    end

    def purchase(money, payment, options = {})
      super(money, payment, add_transaction_options(options))
    end

    def authorize(money, payment, options = {})
      super(money, payment, add_transaction_options(options))
    end

    def store(options)
      card_attrs = options[:card]
                   .slice(:encrypted_number, :number, :name, :month, :year)
                   .merge!(
                     brand: options[:card][:cc_type],
                     one_time_token: options[:one_time_token],
                     own_form: preferred_ui == 'own_form'
                   )
      card = ActiveMerchant::Billing::EncryptedNexioCard.new(card_attrs)
      return unless card.valid?

      gateway.store(card, options.except(:card, :one_time_token))
    end

    protected

    def gateway_class
      ActiveMerchant::Billing::NexioGateway
    end

    def add_transaction_options(options)
      result = %i(currency billing_address shipping_address).each_with_object({}) do |key, acc|
        acc[key] = options[key] if options[key].present?
      end
      if options[:originator].is_a?(::Spree::Payment) && options[:originator].order
        payment = options[:originator]
        result.merge!(SolidusNexio::NexioData.purchase(payment.order))
        # called from customer checkout page
        if payment.instance_variable_get(:@nexio_callback_url)
          result[:three_d_callback_url] = payment.instance_variable_get(:@nexio_callback_url)
          result[:three_d_secure] = true
          result[:payment_type] = 'initialUnscheduled'
        else
          result[:three_d_secure] = false
        end
      end
      result
    end

    def nexio_three_d_secure_redirect_url(payment)
      resp = payment.log_entries.last.try(:parsed_details)
      return unless resp.is_a?(ActiveMerchant::Billing::Response)

      resp.params['redirectUrl'] if resp.params['status'] == 'redirect'
    end
  end
end
