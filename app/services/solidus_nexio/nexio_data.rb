# frozen_string_literal: true

module SolidusNexio
  module NexioData
    extend self

    def one_time_token(order:, user:)
      acc = { customer: {} }

      if order
        add_order_data(acc, order)
        add_customer_data(acc, order.user || user)
      else
        add_customer_data(acc, user)
      end

      acc.delete(:customer) if acc[:customer].blank?

      acc
    end

    def purchase(order)
      acc = { customer: {} }
      add_order_data(acc, order)
      add_order_cart(acc, order)
      add_customer_data(acc, order)
      acc
    end

    private

    def add_order_data(acc, order)
      acc[:currency] = order.currency
      acc[:customer].merge!(email: order.email)
      acc[:address] = address_data(order.shipping_address) if order.shipping_address
      if order.billing_address
        acc[:customer].merge!(address_to_name(order.billing_address))
        acc[:billing_address] = address_data(order.billing_address)
      end
      acc[:order] = { number: order.number }
      acc[:order][:date] = order.completed_at.to_date if order.completed_at
      acc
    end

    def add_customer_data(acc, user)
      return acc unless user

      acc[:customer][:email] = user.email if user.respond_to?(:email)
      acc[:customer][:first_name] = user.first_name if user.respond_to?(:first_name)
      acc[:customer][:last_name] = user.last_name if user.respond_to?(:last_name)
      acc
    end

    def address_data(address)
      {
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        country: address.country&.iso.to_s,
        phone: address.phone,
        zip: address.zipcode,
        state: address.state_name
      }
    end

    def add_order_cart(acc, order)
      acc[:order][:line_items] = order.line_items.map { |line_item| line_item_data(line_item) }
    end

    def line_item_data(line_item)
      {
        id: line_item.id,
        description: line_item.product.name,
        price: line_item.price,
        quantity: line_item.quantity
      }
    end

    if SolidusSupport.combined_first_and_last_name_in_address?
      def address_to_name(address)
        name = Spree::Address::Name.new(address.name)
        { first_name: name.first_name, last_name: name.last_name }
      end
    else
      def address_to_name(address)
        { first_name: address.firstname, last_name: address.lastname }
      end
    end
  end
end
