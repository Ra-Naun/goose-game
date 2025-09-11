# первый параметр задает режим запуска - дев или тест (и в будущем prod)
# пример вызова - ./start-dev-all.sh dev или ./stop-all.sh test
mode="$1"
if [ "$mode" != "dev" ] && [ "$mode" != "test" ]; then
  echo "Ошибка: параметр должен быть 'dev' или 'test'"
  exit 1
fi

docker compose -f ./nginx/docker-compose."${mode}".yaml down

docker compose -f ./website/docker-compose."${mode}".yaml down

docker compose -f ./backend/docker-compose."${mode}".yaml down

docker compose -f ./backend/docker-compose.prisma.dev.yaml down

docker compose -f ./redis/docker-compose.dev.yaml down

docker compose -f ./postgresql/docker-compose.dev.yaml down

docker compose -f ./pgadmin/docker-compose.dev.yaml down

docker network rm backend-network
