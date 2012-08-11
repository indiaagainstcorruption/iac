require "erb"
require "pathname"

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end

def run_locally(cmd, explanation)
  puts ">>> #{explanation} <<<"
  puts "executing: #{cmd}"
  system cmd
  puts
end


namespace "deploy" do
  task "s3:diff" do
    run_locally "s3cmd sync  public/ s3://iac.debuggify.net --dry-run", "Deploying using s3cmd"
  end

  task "s3" do
    run_locally "s3cmd sync  public/ s3://iac.debuggify.net --acl-public", "Deploying using s3cmd"
  end
end

task "test" do
  ENV["JASMINE_HOST"] = "http://local.debuggify.net"
  ENV["JASMINE_BROWSER"] = "firefox"
  Rake::Task["jasmine:ci"].invoke
end