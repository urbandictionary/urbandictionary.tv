task :default do
  sh 'git push origin gh-pages:gh-pages'
  sh 'git push origin gh-pages:ci'
end

task :server do
  sh 'python -mSimpleHTTPServer'
end

task :spec do
  sh 'open -a /Applications/Safari.app specs.html'
end

task :ci do
  sh "which phantomjs" do |ok, res|
    fail "Cannot find phantomjs. brew install phantomjs or install from phantomjs.org" unless ok
  end

  sh "phantomjs lib/phantom-jasmine/run_jasmine_test.coffee http://urbandictionary.tv/specs.html}" do |ok, res|
    fail "Jasmine specs failed with #{res.inspect}" unless ok
  end
end