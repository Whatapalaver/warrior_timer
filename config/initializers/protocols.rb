PROTOCOLS = YAML.safe_load_file(Rails.root.join("config/protocols.yml"))
                .map(&:deep_symbolize_keys)
                .freeze
