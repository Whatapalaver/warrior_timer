ARG RUBY_VERSION=3.1.2
FROM ruby:$RUBY_VERSION-slim

WORKDIR /rails

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

    RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install --no-install-recommends -y \
    build-essential \
    git \
    nodejs \
    libjemalloc2 \
    libvips && \
    rm -rf /var/lib/apt/lists/*

COPY Gemfile Gemfile.lock ./
RUN bundle lock --add-platform x86_64-linux && \
    bundle install && \
    bundle clean --force && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build:css && \
    bundle exec bootsnap precompile app/ lib/ && \
    SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile

EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
