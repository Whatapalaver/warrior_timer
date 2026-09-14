module Timer
  class EmbedControlsComponent < ViewComponent::Base
    def initialize(intervals_param:)
      @intervals_param = intervals_param
    end

    def timer_url
      "https://warriortimer.fit/timer/#{encode_timer_path(@intervals_param)}"
    end

    private

    def encode_timer_path(code)
      CGI.escape(code)
        .gsub('+', '%20')
        .gsub('%2B', '+')
        .gsub('%40', '@')
        .gsub('%28', '(')
        .gsub('%29', ')')
        .gsub('%5B', '[')
        .gsub('%5D', ']')
        .gsub('%2A', '*')
        .gsub('%2C', ',')
        .gsub('%3A', ':')
    end
  end
end
