# первый параметр задает режим запуска - дев или тест (и в будущем prod)
# пример вызова - ./start-all.sh dev или ./start-all.sh test
mode="$1"
if [ "$mode" != "dev" ] && [ "$mode" != "test" ]; then
  echo "Ошибка: параметр должен быть 'dev' или 'test'"
  exit 1
fi

wait_for_healthy() {
  container_name="$1"

  echo "Waiting for container $container_name to be healthy..."
  while true; do
    status=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no_health{{end}}' "$container_name")

    if [ "$status" = "healthy" ]; then
      echo "Container $container_name is healthy, continuing..."
      break
    else
      echo "Waiting... current status: $status"
      sleep 2
    fi
  done
  echo "Container $container_name is up and healthy."
}

wait_for_container_exit() {
  container_name="$1"

  echo "Streaming logs for container $container_name ..."
  # Follow logs in background
  docker logs -f "$container_name" &

  echo "Waiting for container $container_name to exit..."
  # Wait for container to exit
  docker wait "$container_name"

  echo "Container $container_name has exited."

  # Get the exit code of the container
  exit_code=$(docker inspect "$container_name" --format='{{.State.ExitCode}}')
  echo "Exit code: $exit_code"
}

open_url() {
  mode="$1"

  if [ "$mode" = "dev" ]; then
    ui_url="https://localhost/"
    pgadmin_url="https://localhost/pgadmin/"
    swager_url="https://localhost/api/docs/api/"
    async_api_url="https://localhost/api/docs/async-api/"
  elif [ "$mode" = "test" ]; then
    ui_url="http://localhost:4014/"
    pgadmin_url="http://localhost:4014/pgadmin/"
    swager_url="http://localhost:4014/api/docs/api/"
    async_api_url="http://localhost:4014/api/docs/async-api/"
  else
    echo "Ошибка: неизвестный режим '$mode' для открытия URL"
    return 1
  fi

  if command -v xdg-open > /dev/null; then
    # Linux
    xdg-open "$ui_url"
    xdg-open "$pgadmin_url"
    xdg-open "$async_api_url"
    xdg-open "$swager_url"
  elif command -v open > /dev/null; then
    # macOS
    open "$ui_url"
    open "$pgadmin_url"
    open "$async_api_url"
    open "$swager_url"
  elif command -v powershell > /dev/null; then
    # Windows (git-bash, WSL или аналогичные оболочки)
    powershell.exe Start-Process "$ui_url"
    powershell.exe Start-Process "$pgadmin_url"
    powershell.exe Start-Process "$async_api_url"
    powershell.exe Start-Process "$swager_url"
  else
    echo "Не удалось определить команду для открытия браузера. Откройте вручную:\n \
    UI: $ui_url\n \
    PGAdmin: $pgadmin_url\n \
    Docs Websokets API: $async_api_url\n \
    Docs API (Swager): $swager_url\n \
    "
  fi
}

./stop-all.sh "${mode}"

docker network create backend-network

# # Поднимаем необходимые сервисы (Redis, Postgres)
docker compose -f ./redis/docker-compose.dev.yaml build
docker compose -f ./redis/docker-compose.dev.yaml up -d
docker compose -f ./postgresql/docker-compose.dev.yaml build
docker compose -f ./postgresql/docker-compose.dev.yaml up -d
docker compose -f ./pgadmin/docker-compose.dev.yaml build
docker compose -f ./pgadmin/docker-compose.dev.yaml up -d

# Ожидаем готовности Postgres и Redis
while ! docker exec postgres_container pg_isready -U postgres_user -d postgres_db; do
  sleep 2
done
while ! docker exec redis_container redis-cli --raw incr ping; do
  sleep 2
done

# Выполнить prisma команды внутри контейнера
docker compose -f ./backend/docker-compose.prisma.dev.yaml build
docker compose -f ./backend/docker-compose.prisma.dev.yaml up -d

echo "Ожидание выполнения команд в контейнере prisma_container..."
wait_for_container_exit prisma_container
echo "Prisma команды выполнены успешно."

# После успешного выполнения запустить backend
docker compose -f ./backend/docker-compose."${mode}".yaml build
docker compose -f ./backend/docker-compose."${mode}".yaml up -d

# Ждём готовности backend (curl health check)
wait_for_healthy backend-"${mode}"-instance-1
wait_for_healthy backend-"${mode}"-instance-2
wait_for_healthy backend-"${mode}"-instance-3

# и поднимаем фронт
docker compose -f ./website/docker-compose."${mode}".yaml build
docker compose -f ./website/docker-compose."${mode}".yaml up -d

# и nginx
docker compose -f ./nginx/docker-compose."${mode}".yaml build
docker compose -f ./nginx/docker-compose."${mode}".yaml up -d

open_url "$mode"
