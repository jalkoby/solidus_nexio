# frozen_string_literal: true

module SolidusNexio
  class PaymentStatesController < Spree::StoreController
    # TODO: figure out how get current order as capture runs in iframe which doesn't have cookie session
    def show
      payment = payment_method.payments.find(params[:payment_id])
      render json: { data: { state: payment.state } }
    end

    def capture
      payment = payment_method.payments.find_by(number: params[:payment_id])
      if payment
        @result = payment_method.capture_order_payment(payment, params[:id], params[:status])
        render :capture, layout: false
      else
        head 404
      end
    end

    private

    def payment_method
      @payment_method ||= PaymentMethod.active.available_to_users.find(params[:payment_method_id])
    end
  end
end
