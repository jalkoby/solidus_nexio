require 'solidus_support'

module SolidusNexio
  class Engine < Rails::Engine
    include SolidusSupport::EngineExtensions

    isolate_namespace SolidusNexio
    engine_name 'solidus_nexio'
  end
end
