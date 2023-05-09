class AddAuthConfirmationRequiredToSpreePayment < ActiveRecord::Migration[6.1]
  def change
    add_column :spree_payments, :auth_confirmation_required, :boolean
  end
end
