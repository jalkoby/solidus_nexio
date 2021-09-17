module SolidusNexio
  class PaymentStatesController < Spree::StoreController
    def show
      payment_method = PaymentMethod.find(params[:payment_method_id])
      payment = payment_method.payments.find(params[:payment_id])
      render json: { data: { state: payment.state } }
    end

    def capture
      payment_method = PaymentMethod.find(params[:payment_method_id])
      payment = payment_method.payments.find_by(number: params[:payment_id])
      if payment
        @result = payment_method.capture_order_payment(payment, params[:id], params[:status])
        render :capture, layout: false
      else
        head 404
      end
    end
  end
end
