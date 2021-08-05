# frozen_string_literal: true

SolidusNexio::Engine.routes.draw do
  resources :payment_methods, only: [] do
    resources :one_time_tokens, only: %i[create]
    resources :credit_cards, only: %i[create]
    resources :payments, only: %i[create show], param: :payment_id do
      get :capture, on: :member
    end
  end
  resources :webhooks, only: :create
end
