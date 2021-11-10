# frozen_string_literal: true

attrs = %i[id month year cc_type last_digits name]
attrs += %i[gateway_customer_profile_id gateway_payment_profile_id] if @current_user_roles.include?('admin')

json.call(payment_source, *attrs)
