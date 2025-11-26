Rails.application.routes.draw do
  # Timer routes
  root "timers#index"
  get "timer/:intervals", to: "timers#show", as: :timer, constraints: { intervals: /[^\/]+/ }

  # API routes
  namespace :api do
    get "parse_intervals", to: "intervals#parse"
  end

  # Health check endpoints
  get "up" => "rails/health#show", as: :rails_health_check
  get "/health", to: proc { [200, {}, ["OK"]] }
end
