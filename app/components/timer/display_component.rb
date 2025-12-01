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

    def segment_color_class(segment_type)
      colors = {
        prepare: 'bg-amber-500/20 text-amber-300',
        warmup: 'bg-orange-500/20 text-orange-300',
        work: 'bg-red-600/20 text-red-300',
        rest: 'bg-emerald-500/20 text-emerald-300',
        cooldown: 'bg-sky-500/20 text-sky-300'
      }
      colors[segment_type] || colors[:work]
    end

    def mobile_segment_color_class(segment_type)
      colors = {
        prepare: 'bg-amber-500/30 text-amber-200 border-amber-500/50',
        warmup: 'bg-orange-500/30 text-orange-200 border-orange-500/50',
        work: 'bg-red-500/30 text-red-200 border-red-500/50',
        rest: 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50',
        cooldown: 'bg-sky-500/30 text-sky-200 border-sky-500/50'
      }
      colors[segment_type] || colors[:work]
    end

    def format_time(seconds)
      mins = seconds / 60
      secs = seconds % 60
      if mins > 0
        "#{mins}:#{secs.to_s.rjust(2, '0')}"
      else
        "#{secs}s"
      end
    end

    def segment_label(segment)
      # If segment has a name, use it instead of the type
      if segment[:name]
        label = segment[:name]

        if segment[:round_number]
          "#{label} - R#{segment[:round_number]}/#{segment[:total_rounds]}"
        else
          label
        end
      else
        type_names = {
          prepare: 'Prep',
          warmup: 'Warmup',
          work: 'Work',
          rest: 'Rest',
          cooldown: 'Cooldown'
        }
        label = type_names[segment[:segment_type]] || segment[:segment_type].to_s.capitalize

        if segment[:round_number]
          "#{label} - R#{segment[:round_number]}/#{segment[:total_rounds]}"
        else
          label
        end
      end
    end
  end
end
