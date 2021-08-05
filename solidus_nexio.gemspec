# frozen_string_literal: true

require_relative 'lib/solidus_nexio/version'

Gem::Specification.new do |spec|
  spec.name          = 'solidus_nexio'
  spec.version       = SolidusNexio::VERSION
  spec.authors       = %w[Whitespectre]
  spec.email         = %w[hello@whitespectre.com]
  spec.licenses      = %w[MIT]

  spec.summary       = 'Solidus integration with Nexio'
  spec.homepage      = 'https://github.com/jalkoby/solidus_nexio'
  spec.required_ruby_version = Gem::Requirement.new('>= 2.3.0')

  spec.metadata['homepage_uri'] = spec.homepage
  spec.metadata['source_code_uri'] = 'https://github.com/jalkoby/solidus_nexio'
  spec.metadata['changelog_uri'] = 'https://github.com/jalkoby/solidus_nexio/blob/master/CHANGELOG'

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    list = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^((bin|spec|dist|src)/|(package|yarn|webpack|\.))}) }
    # add ignored compiled js files for rubygems
    list.concat(Dir.glob('app/assets/javascripts/**/*').select { |f| File.file?(f) })
  end

  spec.bindir        = 'exe'
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  spec.add_dependency 'rails'
  spec.add_dependency 'solidus_api', '>= 2.0'
  spec.add_dependency 'solidus_core', '>= 2.0'
  spec.add_dependency 'solidus_support', '~> 0.6'
  spec.add_dependency 'nexio_activemerchant', '>= 0.2.1'
end
