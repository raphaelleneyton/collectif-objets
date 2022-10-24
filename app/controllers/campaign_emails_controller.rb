# frozen_string_literal: true

class CampaignEmailsController < ApplicationController
  before_action :set_instance_vars, :restrict_access

  def redirect_to_sib_preview
    raise if @email.sib_message_id.blank?

    sib_uuid = Co::SendInBlueClient.instance.get_transactional_email_uuid(message_id: @email.sib_message_id)
    raise if sib_uuid.blank?

    redirect_to "https://app-smtp.sendinblue.com/log/preview/#{sib_uuid}", allow_other_host: true
  end

  private

  def set_instance_vars
    @email = CampaignEmail.find(params[:email_id])
    @campaign = @email.campaign
  end

  def restrict_access
    return true if current_admin_user.present?

    redirect_to root_path, alert: "La gestion de campagne est réservée aux administrateurs"
  end
end
