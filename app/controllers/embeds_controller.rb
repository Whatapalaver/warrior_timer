class EmbedsController < ApplicationController
  layout "embed"

  # Set headers to allow iframe embedding
  before_action :set_embedding_headers

  def show
    @code = params[:code]

    begin
      # Parse and expand the intervals
      parsed = Intervals::Parser.new(@code).parse
      expander = Intervals::Expander.new(parsed)
      @segments = expander.expand
      @total_duration = expander.total_duration
      @intervals_param = @code
    rescue Intervals::Parser::ParseError => e
      @error = e.message
      @intervals_param = @code
      render :error, status: :bad_request
    end
  end

  private

  def set_embedding_headers
    response.headers["X-Frame-Options"] = "ALLOWALL"
    response.headers["Content-Security-Policy"] = "frame-ancestors *;"
  end
end
