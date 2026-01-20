Rails.application.routes.draw do
  # Timer routes
  root "timers#index"
  get "protocols", to: "protocols#index", as: :protocols
  get "builder", to: "timers#builder", as: :builder
  get "favorites", to: "timers#favorites", as: :favorites
  get "recents", to: "timers#recents", as: :recents
  get "timer/:intervals", to: "timers#show", as: :timer, constraints: { intervals: /[^\/]+/ }
  get "embed/:code", to: "embeds#show", as: :embed_timer, constraints: { code: /[^\/]+/ }

  # API routes
  namespace :api do
    get "parse_intervals", to: "intervals#parse"
  end

  # Health check endpoints
  get "up" => "rails/health#show", as: :rails_health_check
  get "/health", to: proc { [200, {}, ["OK"]] }
end
