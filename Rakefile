task :default => :deploy

desc 'Deploy'
task :deploy do
  sh 'git push gh-pages master'
end

task :server do
  system "python -mSimpleHTTPServer"
end