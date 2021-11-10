# frozen_string_literal: true

class CreateSolidusNexioSolidusNexioWebhooks < ActiveRecord::Migration[6.1]
  def change
    create_table :solidus_nexio_solidus_nexio_webhooks do |t|
      t.text :data

      t.timestamps
    end
  end
end
