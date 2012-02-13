task :default => :deploy

desc 'Deploy'
task :deploy do
  sh 'git push gh-pages master'
end

task :server do
  sh 'python -mSimpleHTTPServer'
end

task :spec do
  sh 'open -a /Applications/Safari.app specs.html'
end