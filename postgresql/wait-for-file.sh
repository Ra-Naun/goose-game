#!/bin/sh
set -e

echo "Ожидание файла с секретами /etc/secrets/.env..."
while [ ! -f /etc/secrets/.env ]; do
  sleep 1
done

echo "Файл найден, загружаем переменные окружения..."
set -a
. /etc/secrets/.env
set +a

echo "Запускаем Postgres..."
exec docker-entrypoint.sh postgres