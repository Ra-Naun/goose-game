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
echo "Секреты загружены."

# Держим процесс в живых, чтобы контейнер не завершился
wait

# ! Скрипт служит для автоматической инициализации Vault при старте dev режима
