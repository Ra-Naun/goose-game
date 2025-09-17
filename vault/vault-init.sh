#!/bin/sh
set -e

# Запуск Vault dev сервера в фоне
vault server -dev -dev-root-token-id=root &

echo "Ожидаем готовности Vault..."
until wget -q --spider http://127.0.0.1:8200/v1/sys/health; do
  sleep 1
done

echo "Настраиваем переменные окружения для Vault CLI..."
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'

echo "Загружаем секреты..."

vault kv put secret/tap-goose/postgres/dev \
  POSTGRES_USER=postgres_user \
  POSTGRES_PASSWORD=postgres_password \
  POSTGRES_DB=postgres_db

vault kv put secret/tap-goose/redis/dev \
  REDIS_PASSWORD=your_redis_password \
  REDIS_USER=goose_user \
  REDIS_USER_PASSWORD=goose_user_password

vault kv put secret/tap-goose/pgadmin/dev \
  PGADMIN_DEFAULT_EMAIL=pgadmin@test.com \
  PGADMIN_DEFAULT_PASSWORD=admin

vault kv put secret/tap-goose/website/dev \
  WEBSOCKET_URL=wss://localhost/api

vault kv put secret/tap-goose/website/local-test \
  WEBSOCKET_URL=ws://localhost:4014/api

vault kv put secret/tap-goose/website/ra-naun-test \
  WEBSOCKET_URL=wss://ra-naun.site/api

vault kv put secret/tap-goose/backend/dev \
  POSTGRES_HOST=postgres \
  POSTGRES_USER=postgres_user \
  POSTGRES_PASSWORD=postgres_password \
  POSTGRES_DB=postgres_db \
  POSTGRES_PORT=5432 \
  \
  REDIS_PASSWORD=your_redis_password \
  REDIS_USER=goose_user \
  REDIS_USER_PASSWORD=goose_user_password \
  \
  JWT_SECRET=39705a46-7cf4-495d-989d-37f6555938e2 \
  \
  INIT_ADMIN_PASSWORD=admin123 \

vault kv put secret/tap-goose/backend/test \
  POSTGRES_HOST=postgres \
  POSTGRES_USER=postgres_user \
  POSTGRES_PASSWORD=postgres_password \
  POSTGRES_DB=postgres_db \
  POSTGRES_PORT=5432 \
  \
  REDIS_PASSWORD=your_redis_password \
  REDIS_USER=goose_user \
  REDIS_USER_PASSWORD=goose_user_password \
  \
  JWT_SECRET=39705a46-7cf4-495d-989d-37f6555938e2 \
  \
  INIT_ADMIN_PASSWORD=admin123 \

echo "Секреты загружены."

# Держим процесс в живых, чтобы контейнер не завершился
wait

# ! Скрипт служит для автоматической инициализации Vault при старте dev режима, в проде так не делаем :)
