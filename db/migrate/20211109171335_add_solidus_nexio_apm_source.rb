# frozen_string_literal: true

class AddSolidusNexioApmSource < ActiveRecord::Migration[6.1]
  def change
    create_table :solidus_nexio_apm_sources do |t|
      t.integer :kind, default: 0, null: false
      t.string :gateway_payment_profile_id

      t.references :user, index: true
      t.references :payment_method, index: true
    end

    add_foreign_key :solidus_nexio_apm_sources, :spree_payment_methods, column: :payment_method_id
  end
end
