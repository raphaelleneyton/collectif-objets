# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions"
  }

  devise_scope :user do
    get 'sign_in_with_token', to: 'users/sessions#sign_in_with_token'
    namespace :users do
      resources :magic_links, only: [:create]
    end
  end

  root "pages#home"
  get "permanence", to: "pages#permanence"
  get "comment-ca-marche", to: "pages#aide", as: "aide"
  get "inscription", to: "pages#inscription"
  get "confirmation-de-participation", to: "pages#confirmation_inscription"

  resources :objets, only: [:index, :show]
  get "objets/ref_pop/:ref_pop", to: "objets#show_by_ref_pop"

  resources :communes, only: [:index]
end
