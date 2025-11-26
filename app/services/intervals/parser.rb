module Intervals
  class Parser
    class ParseError < StandardError; end

    SEGMENT_TYPES = {
      'w' => :work,
      'r' => :rest,
      'wu' => :warmup,
      'cd' => :cooldown,
      'p' => :prepare
    }.freeze

    def initialize(input)
      @input = input.to_s.strip
    end

    def parse
      raise ParseError, "Input cannot be empty" if @input.empty?

      parse_sequence(@input)
    end

    private

    def parse_sequence(input)
      # Split on + to get individual segments or groups
      segments = []
      input.split('+').each do |part|
        segments.concat(parse_part(part.strip))
      end
      segments
    end

    def parse_part(part)
      # For now, just parse simple segments
      # We'll add repetition support in the next step
      [parse_segment(part)]
    end

    def parse_segment(segment)
      # Match patterns like: 30w, 5mw, 1:30w
      match = segment.match(/^(\d+(?::\d+)?)(m?)(\w+)$/)

      raise ParseError, "Invalid segment format: #{segment}" unless match

      time_part = match[1]
      minutes_suffix = match[2]
      type_part = match[3]

      type = SEGMENT_TYPES[type_part]
      raise ParseError, "Unknown segment type: #{type_part}" unless type

      duration = parse_duration(time_part, minutes_suffix)

      { type: type, duration: duration }
    end

    def parse_duration(time_part, minutes_suffix)
      if time_part.include?(':')
        # Parse m:ss format
        parts = time_part.split(':')
        raise ParseError, "Invalid time format: #{time_part}" if parts.length != 2

        minutes = parts[0].to_i
        seconds = parts[1].to_i
        minutes * 60 + seconds
      elsif minutes_suffix == 'm'
        # Parse minutes notation (5m)
        time_part.to_i * 60
      else
        # Parse bare seconds
        time_part.to_i
      end
    end
  end
end
