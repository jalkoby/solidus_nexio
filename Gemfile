# frozen_string_literal: true

source 'https://rubygems.org'

gem 'rake', '~> 12.0'

gem 'solidus', ENV['SOLIDUS_VERSION']
gem 'solidus_auth_devise'

case ENV['DB']
when 'mysql'
  gem 'mysql2'
when 'postgresql'
  gem 'pg'
else
  gem 'sqlite3'
end

group :test do
  gem 'rspec', '~> 3.0'
  gem 'solidus_dev_support'
end

group :tools do
  gem 'rubocop'
end

# Specify your gem's dependencies in solidus_nexio.gemspec
gemspec
