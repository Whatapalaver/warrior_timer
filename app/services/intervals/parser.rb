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
      # First check if there's explicit + sequencing
      if input.include?('+')
        # Split on + to get individual segments or groups, but respect parentheses
        segments = []
        parts = split_respecting_parens(input, '+')
        parts.each do |part|
          segments.concat(parse_part(part.strip))
        end
        return segments
      end

      # No explicit +, treat as concatenated segments
      parse_inner_sequence(input)
    end

    def parse_part(part)
      # Check if this is a repetition: N(...) - allow empty parens to catch and error on them
      if part =~ /^(\d+)\((.*)\)$/
        count = $1.to_i
        inner = $2

        raise ParseError, "Empty repetition" if inner.strip.empty?

        # Parse the inner content - could have + or be concatenated
        inner_segments = parse_inner_sequence(inner)

        # Repeat the segments
        result = []
        count.times do
          inner_segments.each do |seg|
            result << seg.merge(repetition: true)
          end
        end
        result
      else
        # Could be a simple segment or concatenated segments
        # Check if it matches a valid simple segment pattern
        # Valid segment types: w, r, wu, cd, p (1-2 chars)
        if part =~ /^(\d+(?::\d+)?m?)(wu|cd|[wrp])$/
          # Simple segment
          [parse_segment(part)]
        else
          # Must be concatenated segments - tokenize them
          parse_inner_sequence(part)
        end
      end
    end

    def parse_inner_sequence(input)
      # First check if there's a + (explicit sequencing)
      if input.include?('+')
        return parse_sequence(input)
      end

      # Otherwise, split into individual segments by tokenizing
      # This handles cases like: 30w15r (two segments) or 2(30w15r)60r (nested + segment)
      tokens = tokenize_concatenated(input)

      # Validate that we got tokens - if input had content but produced no tokens, it's invalid
      if tokens.empty? && !input.strip.empty?
        raise ParseError, "Unable to parse input: #{input}"
      end

      segments = []

      tokens.each do |token|
        if token =~ /^\d+\(/
          # This is a nested repetition
          segments.concat(parse_part(token))
        else
          # This is a simple segment
          segments << parse_segment(token)
        end
      end

      segments
    end

    def tokenize_concatenated(input)
      tokens = []
      i = 0

      while i < input.length
        # Skip whitespace
        if input[i] =~ /\s/
          i += 1
          next
        end

        # Check for repetition pattern: N(...)
        if input[i] =~ /\d/ && input[i..-1] =~ /^(\d+)\(/
          # This is a repetition, find the matching closing paren
          count_str = $1
          paren_start = i + count_str.length
          paren_end = find_matching_paren(input, paren_start)

          raise ParseError, "Mismatched parentheses" if paren_end.nil?

          token = input[i..paren_end]
          tokens << token
          i = paren_end + 1
        elsif input[i] =~ /\d/
          # This is a simple segment - match the segment type more precisely
          # Segment types are: w, r, wu, cd, p (at most 2 characters)
          if input[i..-1] =~ /^(\d+(?::\d+)?m?(?:wu|cd|[wrp]))/
            tokens << $1
            i += $1.length
          else
            i += 1
          end
        else
          i += 1
        end
      end

      tokens
    end

    def find_matching_paren(input, start_index)
      return nil if input[start_index] != '('

      depth = 1
      i = start_index + 1

      while i < input.length && depth > 0
        case input[i]
        when '('
          depth += 1
        when ')'
          depth -= 1
        end
        i += 1
      end

      depth == 0 ? i - 1 : nil
    end

    def split_respecting_parens(input, delimiter)
      parts = []
      current = ""
      depth = 0

      input.each_char do |char|
        case char
        when '('
          depth += 1
          current << char
        when ')'
          depth -= 1
          raise ParseError, "Mismatched parentheses" if depth < 0
          current << char
        when delimiter
          if depth == 0
            parts << current
            current = ""
          else
            current << char
          end
        else
          current << char
        end
      end

      raise ParseError, "Mismatched parentheses" if depth != 0

      parts << current unless current.empty?
      parts
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
