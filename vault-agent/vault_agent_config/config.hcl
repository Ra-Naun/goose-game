vault {
  address = "http://vault:8200"
}

auto_auth {
  method "token_file" {  # В продакшене лучше использовать approle или другие более безопасные методы
    config = {
      token_file_path = "/etc/vault-agent-config/auth/.vault-token"
    }
  }

  sink "file" {
    config = {
      path = "/etc/vault-agent-config/auth/.vault-token"
    }
  }
}

template {
  source      = "/etc/vault-agent-config/templates/postgresql-env-template.tmpl"
  destination = "/etc/secrets/postgresql/.env"
}

template {
  source      = "/etc/vault-agent-config/templates/redis-env-template.tmpl"
  destination = "/etc/secrets/redis/.env"
}

template {
  source      = "/etc/vault-agent-config/templates/pgadmin-env-template.tmpl"
  destination = "/etc/secrets/pgadmin/.env"
}

template {
  source      = "/etc/vault-agent-config/templates/website/dev/env-template.tmpl"
  destination = "/etc/secrets/website/dev/.env"
}

template {
  source      = "/etc/vault-agent-config/templates/website/local-test/env-template.tmpl"
  destination = "/etc/secrets/website/local-test/.env"
}

template {
  source      = "/etc/vault-agent-config/templates/website/ra-naun-test/env-template.tmpl"
  destination = "/etc/secrets/website/ra-naun-test/.env"
}

template {
  source      = "/etc/vault-agent-config/templates/backend/dev/env-template.tmpl"
  destination = "/etc/secrets/backend/dev/.env"
}

template {
  source      = "/etc/vault-agent-config/templates/backend/test/env-template.tmpl"
  destination = "/etc/secrets/backend/test/.env"
}
