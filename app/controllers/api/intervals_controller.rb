module Api
  class IntervalsController < ApplicationController
    def parse
      intervals_param = params[:intervals]

      if intervals_param.blank?
        render json: { error: "No intervals provided" }, status: :bad_request
        return
      end

      begin
        parsed = Intervals::Parser.new(intervals_param).parse
        expander = Intervals::Expander.new(parsed)
        segments = expander.expand

        render json: {
          segments: segments,
          total_duration: expander.total_duration
        }
      rescue Intervals::Parser::ParseError => e
        render json: { error: e.message }
      end
    end
  end
end
