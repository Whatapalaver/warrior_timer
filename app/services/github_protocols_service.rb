require "net/http"
require "json"
require "base64"

class GithubProtocolsService
  REPO = "whatapalaver/warrior_timer"
  FILE_PATH = "config/protocols.yml"

  def self.commit(sections)
    new.commit(sections)
  end

  def commit(sections)
    token = ENV["GITHUB_TOKEN"]
    return { success: false, error: "GITHUB_TOKEN not configured" } if token.blank?

    sha = fetch_sha(token)
    return { success: false, error: "Could not read current file from GitHub" } unless sha

    response = push_update(token, sections, sha)
    if response.code.to_i == 200
      { success: true }
    else
      { success: false, error: JSON.parse(response.body)["message"] }
    end
  rescue => e
    { success: false, error: e.message }
  end

  private

  def fetch_sha(token)
    uri = URI("https://api.github.com/repos/#{REPO}/contents/#{FILE_PATH}")
    req = Net::HTTP::Get.new(uri)
    set_headers(req, token)
    response = http(uri).request(req)
    JSON.parse(response.body)["sha"]
  end

  def push_update(token, sections, sha)
    uri = URI("https://api.github.com/repos/#{REPO}/contents/#{FILE_PATH}")
    req = Net::HTTP::Put.new(uri)
    set_headers(req, token)
    req.body = {
      message: "Update protocols via admin UI",
      content: Base64.strict_encode64(sections.to_yaml),
      sha: sha
    }.to_json
    http(uri).request(req)
  end

  def set_headers(req, token)
    req["Authorization"] = "Bearer #{token}"
    req["Accept"] = "application/vnd.github.v3+json"
    req["Content-Type"] = "application/json"
  end

  def http(uri)
    Net::HTTP.new(uri.hostname, uri.port).tap { |h| h.use_ssl = true }
  end
end
