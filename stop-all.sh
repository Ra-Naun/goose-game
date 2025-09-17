# первый параметр задает режим запуска - дев или тест (и в будущем prod)
# пример вызова - ./start-dev-all.sh dev или ./stop-all.sh test
mode="$1"
front_mode="$1"

if [ "$mode" != "dev" ] && [ "$mode" != "test" ] && [ "$mode" != "remote-test" ]; then
  echo "Ошибка: параметр должен быть 'dev', 'test' или 'remote-test'"
  exit 1
fi

if [ "$mode" = "remote-test" ]; then
  mode="test"
fi

docker compose -f ./nginx/docker-compose."${mode}".yaml down

docker compose -f ./website/docker-compose."${front_mode}".yaml down

docker compose -f ./backend/docker-compose."${mode}".yaml down

docker compose -f ./backend/docker-compose.prisma.dev.yaml down

docker compose -f ./redis/docker-compose.dev.yaml down

docker compose -f ./postgresql/docker-compose.dev.yaml down

docker compose -f ./pgadmin/docker-compose.dev.yaml down

docker compose -f ./vault-agent/docker-compose.dev.yaml down

docker compose -f ./vault/docker-compose.dev.yaml down

docker network rm backend-network
