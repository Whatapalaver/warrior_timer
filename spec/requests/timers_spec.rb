require 'rails_helper'

RSpec.describe "Timers", type: :request do
  describe "GET /" do
    it "returns http success" do
      get root_path
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /timer/:intervals" do
    it "parses and displays valid intervals" do
      get timer_path(intervals: "10(30w30r)")
      expect(response).to have_http_status(:success)
    end

    it "handles simple intervals" do
      get timer_path(intervals: "30w+30r")
      expect(response).to have_http_status(:success)
    end

    it "handles complex workout structure" do
      get timer_path(intervals: "10p+5mwu+8(3mw1mr)+2mcd")
      expect(response).to have_http_status(:success)
    end

    it "renders error for invalid syntax" do
      get timer_path(intervals: "invalid")
      expect(response).to have_http_status(:bad_request)
    end

    it "handles plus signs in intervals" do
      get timer_path(intervals: "10(30w+30r)")
      expect(response).to have_http_status(:success)
    end
  end
end
