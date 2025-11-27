require 'rails_helper'

RSpec.describe "Protocols", type: :request do
  describe "GET /protocols" do
    it "returns http success" do
      get "/protocols"
      expect(response).to have_http_status(:success)
    end
  end

end
