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

    def key
      ActiveSupport::KeyGenerator.new(
        Rails.application.secrets.secret_key_base
      ).generate_key(salt, ActiveSupport::MessageEncryptor.key_len)
    end
  end
end
