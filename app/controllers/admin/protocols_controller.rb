class Admin::ProtocolsController < Admin::BaseController
  def edit
    @sections = PROTOCOLS.map(&:deep_stringify_keys)
  end

  def update
    sections = build_sections(params[:sections])

    result = GithubProtocolsService.commit(sections)

    if result[:success]
      flash[:notice] = "Protocols updated successfully and committed to GitHub."
    else
      flash[:alert] = "Failed to save protocols: #{result[:error]}"
    end

    redirect_to edit_admin_protocols_path
  end

  private

  def build_sections(sections_params)
    return [] if sections_params.blank?

    sections_params.values.filter_map do |section_params|
      next if section_params[:name].blank?

      section = { "name" => section_params[:name].strip }
      section["description"] = section_params[:description].strip if section_params[:description].present?

      protocols = build_protocols(section_params[:protocols])
      section["protocols"] = protocols if protocols.any?

      section
    end
  end

  def build_protocols(protocols_params)
    return [] if protocols_params.blank?

    protocols_params.values.filter_map do |protocol_params|
      next if protocol_params[:name].blank?

      protocol = { "name" => protocol_params[:name].strip }
      protocol["code"] = protocol_params[:code].strip if protocol_params[:code].present?
      protocol["description"] = protocol_params[:description].strip if protocol_params[:description].present?

      protocol
    end
  end
end
