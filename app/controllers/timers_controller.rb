class TimersController < ApplicationController
  def show
    intervals_param = params[:intervals]

    begin
      # Parse and expand the intervals
      parsed = Intervals::Parser.new(intervals_param).parse
      expander = Intervals::Expander.new(parsed)
      @segments = expander.expand
      @total_duration = expander.total_duration
      @intervals_input = intervals_param
    rescue Intervals::Parser::ParseError => e
      @error = e.message
      @intervals_input = intervals_param
      render :error, status: :bad_request
    end
  end

  def index
    # Landing page with examples and documentation
  end

  def builder
    # Workout builder page
  end

  def favorites
    # Full favorites page - list is managed client-side via localStorage
  end

  def recents
    # Full recents page - list is managed client-side via localStorage
  end
end
