class ProtocolPreviewComponent < ViewComponent::Base
  def initialize(code:)
    @code = code
  end

  def segments
    return [] if @code.blank?

    begin
      parsed = Intervals::Parser.new(@code).parse
      expander = Intervals::Expander.new(parsed)
      expander.expand
    rescue => e
      []
    end
  end

  def segment_color(segment)
    case segment[:segment_type]
    when :work then 'bg-red-500'
    when :rest then 'bg-blue-500'
    when :prepare then 'bg-amber-500'
    when :warmup then 'bg-green-500'
    when :cooldown then 'bg-purple-500'
    else 'bg-slate-500'
    end
  end

  def segment_width(segment, total_duration)
    return 0 if total_duration.zero?
    ((segment[:duration_seconds].to_f / total_duration) * 100).round(2)
  end

  def total_duration
    @total_duration ||= segments.sum { |s| s[:duration_seconds].to_i }
  end
end
