module Navigation
  class HeaderComponent < ViewComponent::Base
    def initialize(show_coffee: true)
      @show_coffee = show_coffee
    end
  end
end
