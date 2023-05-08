# frozen_string_literal: true

module SolidusNexio
  class AlternativePaymentsController < Spree::CheckoutController
    def capture
      prepare_params_and_validate_order(@order)
      # The code below is taken from Spree::CheckoutController#update method
      if @order.errors.empty? && update_order
        unless transition_forward
          redirect_on_failure
          return
        end

        if @order.completed?
          finalize_order
        else
          send_to_next_state
        end
      else
        redirect_on_failure
      end
    end

    private

    def current_order_params
      super.tap do |order_params|
        order_params.delete(:user_id) if order_params[:guest_token].present? && order_params[:user_id].blank?
      end
    end

    def redirect_on_failure
      flash[:error] = @order.errors.full_messages.join("\n")
      redirect_to(spree.checkout_state_path(@order.state))
    end

    # TODO: abstract the code below into a service
    def prepare_params_and_validate_order(order)
      capture_params = params.permit(:payment_method_id, :status, :orderNumber, :id)
      payment_method = AlternativePaymentMethod.find_by id: capture_params[:payment_method_id]
      validate_order_consistency(order, capture_params, payment_method)
      transfer_capture_data_into_order_params(order, capture_params, payment_method) if order.errors.empty?
    end

    def validate_order_consistency(order, capture_prms, payment_method)
      unless payment_method
        order.errors.add :base, t(:payment_method_mismatched, scope: 'nexio.errors.capture')
      end
      if capture_prms[:status] != 'success'
        order.errors.add :base, t(:payment_failed, scope: 'nexio.errors.capture')
      end
      if order.number != capture_prms[:orderNumber]
        order.errors.add :base, t(:order_mismatched, scope: 'nexio.errors.capture')
      end
      unless order.payment?
        order.errors.add :base, t(:order_in_wrong_state, scope: 'nexio.errors.capture')
      end
    end

    def transfer_capture_data_into_order_params(order, capture_prms, payment_method)
      params[:state] = order.state
      params[:order] = {
        payments_attributes: [
          { payment_method_id: capture_prms[:payment_method_id], nexio_apm_transaction_id: capture_prms[:id] }
        ]
      }
      params[:payment_source] = {
        capture_prms[:payment_method_id] => { kind: payment_method.preferred_payment_method.underscore }
      }
    end
  end
end
