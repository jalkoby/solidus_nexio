# frozen_string_literal: true

require 'bundler/gem_tasks'
require 'rspec/core/rake_task'

RSpec::Core::RakeTask.new(:spec)

task :build_webpack do
  system('npm i')
  system('npm run gem-build')
end
Rake::Task['build'].enhance([:build_webpack])

task default: :spec
