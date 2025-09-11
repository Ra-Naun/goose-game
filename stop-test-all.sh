cd ./redis
docker compose -f ./docker-compose.dev.yaml down

cd ../postgresql
docker compose -f ./docker-compose.dev.yaml down

cd ../pgadmin
docker compose -f ./docker-compose.dev.yaml down

cd ../backend
docker compose -f ./docker-compose.test.yaml down

cd ../website
docker compose -f ./docker-compose.test.yaml down

cd ../nginx
docker compose -f ./docker-compose.test.yaml down

docker network rm backend-network
