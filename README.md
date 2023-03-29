# SolidusNexio

Welcome to your new gem! In this directory, you'll find the files you need to be able to package up your Ruby library into a gem. Put your Ruby code in the file `lib/solidus_nexio`. To experiment with that code, run `bin/console` for an interactive prompt.

TODO: Delete this and the text above, and describe your gem

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'solidus_nexio'
```

And then execute:

    $ bundle install

Or install it yourself as:

    $ gem install solidus_nexio

## Usage

TODO: Write usage instructions here

## Frontend Development

1. Set the `development` mode for the webpacker in line #22 of `webpack.config.js`
```
mode: 'development',
```
2. Add the gem as a local one in your app `Gemfile`
```
gem 'solidus_nexio', path: '~/apps/solidus_gems/solidus_nexio'
```

2. Uncomment the line #52 in `app/helpers/solidus_nexio/checkout_helper.rb`
```
`cd #{::SolidusNexio.gem_dir}; yarn webpack --config webpack.config.js` if Rails.env.development?
```

3. Reload the page you're debugging after any change in a js-file.
4. *Nota Bene*
    1. Revert all changes above after your development is completed.
    2. Bump version in the following files:
        1. `lib/solidus_nexio/version.rb`
        2. `package.json`
    3. Delete the precompiled asserts in the `app/assets/javascripts/` folder
    4. Precompile asserts for production:
        1. `yarn webpack --config webpack.config.js`
    5. Push your update to RubyGems: (Ref: https://guides.rubygems.org/publishing/)
        1. Build Gem
        ```
        gem build solidus_nexio
        ```
        2. Push Gem
        ```
        gem push solidus_nexio-0.6.9.gem
        ```
    6. Update the gem in your app
## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/solidus_nexio.

