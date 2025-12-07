module Timer
  class EmbedControlsComponent < ViewComponent::Base
    def initialize(intervals_param:)
      @intervals_param = intervals_param
    end

    def timer_url
      "https://warriortimer.fit/timer/#{CGI.escape(@intervals_param)}"
    end
  end
end
