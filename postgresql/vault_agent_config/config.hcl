vault {
  address = "http://vault:8200"
}

auto_auth {
  method "token_file" {  # В продакшене лучше использовать approle или другие более безопасные методы
    config = {
      token_file_path = "/etc/vault-agent-config/.vault-token"
    }
  }

  sink "file" {
    config = {
      path = "/etc/vault-agent-config/.vault-token"
    }
  }
}

template {
  source      = "/etc/vault-agent-config/env-template.tmpl"
  destination = "/etc/secrets/.env"
}
