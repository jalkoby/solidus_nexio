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

2. Uncomment the line #45 in `app/helpers/solidus_nexio/checkout_helper.rb`
```
`cd #{::SolidusNexio.gem_dir}; yarn webpack --config webpack.config.js` if Rails.env.development?
```

3. Reload the page you're debugging after any change in a js-file. 
4. *Nota Bene* -> Revert all changes above after your development is completed.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/solidus_nexio.

