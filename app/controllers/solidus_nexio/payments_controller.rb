module SolidusNexio
  class PaymentsController < Spree::CheckoutController
    def create
      if update_order
        payment_method = PaymentMethod.find(params[:payment_method_id])
        result = payment_method.process_order_payment(@order)
        render json: result
      else
        render json: { error: :invalid_order, details: @order.errors.to_h }, status: 422
      end
    end

    def show
      payment_method = PaymentMethod.find(params[:payment_method_id])
      payment = payment_method.payments.find(params[:payment_id])
      render json: { data: { state: payment.state } }
    end

    def capture
      payment_method = PaymentMethod.find(params[:payment_method_id])
      payment = payment_method.payments.find(params[:payment_id])
      @result = payment_method.capture_order_payment(payment, params[:id], params[:status])
      render :capture, layout: false
    end

    private

    def update_params
      massaged_params.require(:order).permit(permitted_checkout_payment_attributes)
    end
  end
end
