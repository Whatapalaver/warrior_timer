Rails.application.routes.draw do
  # Timer routes
  root "timers#index"
  get "timer/:intervals", to: "timers#show", as: :timer, constraints: { intervals: /[^\/]+/ }

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
