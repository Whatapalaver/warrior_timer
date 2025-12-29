require 'rails_helper'

RSpec.describe "Embeds", type: :request do
  describe "GET /embed/:code" do
    it "returns http success for valid interval code" do
      get embed_timer_path(code: "8(20w10r)")
      expect(response).to have_http_status(:success)
    end

    it "handles complex workout structures" do
      get embed_timer_path(code: "10p+5mwu+8(3mw1mr)+2mcd")
      expect(response).to have_http_status(:success)
    end

    it "renders error for invalid syntax" do
      get embed_timer_path(code: "invalid")
      expect(response).to have_http_status(:bad_request)
    end

    it "ignores metronome query parameters (embeds don't support metronome)" do
      get embed_timer_path(code: "8(20w10r)", metronome: "true", bpm: "120")
      # Should still work, just ignore the params
      expect(response).to have_http_status(:success)
    end

    it "sets proper embedding headers" do
      get embed_timer_path(code: "8(20w10r)")
      expect(response.headers["X-Frame-Options"]).to eq("ALLOWALL")
      expect(response.headers["Content-Security-Policy"]).to eq("frame-ancestors *;")
    end
  end
end
