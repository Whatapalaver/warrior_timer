module Timer
  class DisplayComponent < ViewComponent::Base
    SEGMENT_COLORS = {
      prepare: {
        bg: 'bg-amber-500',
        text: 'text-slate-900'
      },
      warmup: {
        bg: 'bg-orange-500',
        text: 'text-white'
      },
      work: {
        bg: 'bg-red-600',
        text: 'text-white'
      },
      rest: {
        bg: 'bg-emerald-500',
        text: 'text-slate-900'
      },
      cooldown: {
        bg: 'bg-sky-500',
        text: 'text-white'
      }
    }.freeze

    def initialize(segments:, intervals_param: nil)
      @segments = segments
      @intervals_param = intervals_param
    end

    def segments_json
      @segments.to_json
    end

    def segment_color_for(segment_type)
      SEGMENT_COLORS[segment_type] || SEGMENT_COLORS[:work]
    end
  end
end
