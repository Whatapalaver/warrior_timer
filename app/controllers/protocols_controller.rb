class ProtocolsController < ApplicationController
  def index
    @protocol_categories = PROTOCOLS
  end
end
