module Workout
  class OverviewComponent < ViewComponent::Base
    def initialize(segments:)
      @segments = segments
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
