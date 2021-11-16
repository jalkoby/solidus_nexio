# frozen_string_literal: true

module SolidusNexio
  EncryptionService = Struct.new(:salt) do
    delegate :encrypt_and_sign, :decrypt_and_verify, to: :encryptor

    def self.encrypt(salt, value)
      new(salt).encrypt_and_sign(value)
    end

    def self.decrypt(salt, value)
      new(salt).decrypt_and_verify(value)
    end

    private

    def encryptor
      ActiveSupport::MessageEncryptor.new(key)
    end


    NEXIO_SECRET = Rails.application.secrets.nexio_secret_key ||
                    ENV['NEXIO_SECRET_KEY'] ||
                    Rails.application.secrets.secret_key_base ||
                    ENV['SECRET_KEY_BASE']

    raise ArgumentError, 'Please setup nexio secret key. Rails.application.secrets.nexio_secret_key or ENV["NEXIO_SECRET_KEY"]' if NEXIO_SECRET.blank?

    def key
      ActiveSupport::KeyGenerator.new(NEXIO_SECRET).generate_key(salt, ActiveSupport::MessageEncryptor.key_len)
    end
  end
end
