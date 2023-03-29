# frozen_string_literal: true

SolidusNexio::Engine.routes.draw do
  resources :payment_methods, only: [] do
    resources :one_time_tokens, only: %i[create]
    resources :credit_cards, only: %i[create]
    resources :payments, only: %i[create] do
      resource :state, only: %i[show], controller: 'payment_states' do
        get :capture
      end
    end
    resources :alternative_payments, only: [] do
      get :capture, on: :collection
      get :state, on: :member
    end
  end
  resources :webhooks, only: :create
end
