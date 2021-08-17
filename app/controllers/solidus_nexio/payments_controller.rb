module SolidusNexio
  class PaymentsController < Spree::CheckoutController
    def create
      if update_order
        payment_method = PaymentMethod.find(params[:payment_method_id])
        result = payment_method.process_order_payment(@order) do |payment|
          capture_payment_method_payment_state_url(payment_method, payment)
        end
        render json: result
      else
        render json: { error: :invalid_order, details: @order.errors.to_h }, status: 422
      end
    end

    private

    def update_params
      massaged_params.require(:order).permit(permitted_checkout_payment_attributes)
    end

    def current_order_params
      {
        currency: current_pricing_options.currency,
        guest_token: cookies.signed[:guest_token],
        store_id: current_store.id
      }.tap do |current_order_params|
        current_order_params.merge!(user_id: spree_current_user.id) if spree_current_user.present?
      end
    end
  end
end
