task :default => :deploy

task :deploy do
  sh 'git push'
end

task :server do
  sh 'python -mSimpleHTTPServer'
end

task :spec do
  sh 'open -a /Applications/Safari.app specs.html'
end

task :ci do
  sh "which phantomjs" do |ok, res|
    fail 'Cannot find phantomjs on $PATH. `brew install phantomjs` or install from phantomjs.org' unless ok
  end

  sh "phantomjs lib/phantom-jasmine/run_jasmine_test.coffee file://#{File.expand_path("specs.html")}" do |ok, res|
    fail 'Jasmine specs failed' unless ok
  end
end