module SolidusNexio
  class WebhooksController < ActionController::API
    before_action :authorize_request

    def create
      Webhook.process(params[:eventType], params[:data])
    end

    private

    def authorize_request
      headers['Nexio-signature']
    end
  end
end
