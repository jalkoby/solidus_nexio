# frozen_string_literal: true

SolidusNexio::Engine.routes.draw do
  resources :payment_methods, only: [] do
    resources :one_time_tokens, only: %i[create]
    resources :credit_cards, only: %i[create]
  end
end
