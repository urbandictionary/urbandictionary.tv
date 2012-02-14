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