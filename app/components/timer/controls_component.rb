module Timer
  class ControlsComponent < ViewComponent::Base
    def initialize(intervals_param: nil)
      @intervals_param = intervals_param
    end
  end
end
