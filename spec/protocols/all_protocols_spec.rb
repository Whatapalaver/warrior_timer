require 'rails_helper'

RSpec.describe "All Protocol Codes", type: :request do
  let(:protocol_codes) do
    [
      # Classic Gym Intervals
      "8(20w10r)", "5p+8(20w10r)", "10(30w30r)", "10(40w20r)", "10(45w15r)",
      "6(1mw2mr)", "8(2mw1mr)", "30w30r+45w30r+1mw30r+1:30w30r+2mw",
      "2mw30r+1:30w30r+1mw30r+45w30r+30w",

      # CrossFit / Functional Fitness
      "10(1mw)", "15(1mw)", "20(1mw)", "5(2mw)", "8(1:30w)",
      "7mw", "12mw", "20mw", "15mw", "20mw", "10(30w30r)",

      # TACFIT Protocols
      "8(20w10r)", "8(20w10r)+60r", "6(8(20w10r)60r)", "4(4mw1mr)",
      "10(30w30r)", "2(5(1:30w30r))", "5(20w40r)",

      # Mark Wildman / Kettlebell
      "10(1mw)", "10(1:30w)", "7(1mw1mr)", "5(2mw1mr)", "4(7(1mw1mr))",
      "5(1mw1mr)", "10(1mw1mr)", "5mw", "3(10(30w30r))", "10mw",

      # Combat Sports
      "3(2mw1mr)", "12(3mw1mr)", "6(3mw1mr)", "3(5mw1mr)", "5(5mw1mr)",
      "5(3mw2mr)", "3(2mw1mr)", "5(3mw1mr)", "5(2mw1mr)", "10(3mw30r)",

      # Specialty / Other
      "25mw+5mr", "4(25mw5mr)", "10(2mw1mr)", "12(30w)", "10mw",
      "1mw30r+1:15w30r+1:30w30r+1:45w30r+2mw", "10(4w7w8r)", "10(1mw30r)"
    ]
  end

  describe "Parser validation" do
    it "successfully parses all protocol codes" do
      protocol_codes.each do |code|
        expect {
          Intervals::Parser.new(code).parse
        }.not_to raise_error, "Failed to parse: #{code}"
      end
    end

    it "generates segments for all protocol codes" do
      protocol_codes.each do |code|
        parsed = Intervals::Parser.new(code).parse
        expander = Intervals::Expander.new(parsed)
        segments = expander.expand

        expect(segments).to be_an(Array), "Failed to expand: #{code}"
        expect(segments).not_to be_empty, "Empty segments for: #{code}"
        expect(expander.total_duration).to be > 0, "Zero duration for: #{code}"
      end
    end
  end

  describe "Timer pages" do
    it "loads timer pages for all protocol codes without errors" do
      protocol_codes.each do |code|
        get "/timer/#{code}"
        expect(response).to have_http_status(:success), "Failed to load timer for: #{code}"
      end
    end
  end

  describe "API endpoints" do
    it "successfully parses all codes via API" do
      protocol_codes.each do |code|
        get "/api/parse_intervals", params: { intervals: code }
        expect(response).to have_http_status(:success), "API failed for: #{code}"

        json = JSON.parse(response.body)
        expect(json).not_to have_key('error'), "API returned error for #{code}: #{json['error']}"
        expect(json['segments']).to be_an(Array), "No segments returned for: #{code}"
        expect(json['segments']).not_to be_empty, "Empty segments for: #{code}"
      end
    end
  end
end
