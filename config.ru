Bundler.require

class App < Sinatra::Application
  get '/' do
    send_file File.join(settings.public_folder, 'index.html')
  end
end

run App