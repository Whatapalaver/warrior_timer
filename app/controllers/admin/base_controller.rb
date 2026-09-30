class Admin::BaseController < ApplicationController
  before_action :authenticate_admin

  private

  def authenticate_admin
    authenticate_or_request_with_http_basic("Warrior Timer Admin") do |_username, password|
      ActiveSupport::SecurityUtils.secure_compare(password, ENV.fetch("ADMIN_PASSWORD", ""))
    end
  end
end
