namespace :assets do
  desc "Build Tailwind CSS"
  task :build_css do
    system("npm run build:css") || raise("Tailwind CSS build failed")
  end
end

Rake::Task["assets:precompile"].enhance(["assets:build_css"])
