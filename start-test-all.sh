./stop-test-all.sh

docker network create backend-network

cd ./redis
docker compose -f ./docker-compose.dev.yaml build
docker compose -f ./docker-compose.dev.yaml up -d

cd ../postgresql
docker compose -f ./docker-compose.dev.yaml build
docker compose -f ./docker-compose.dev.yaml up -d

cd ../pgadmin
docker compose -f ./docker-compose.dev.yaml build
docker compose -f ./docker-compose.dev.yaml up -d

cd ../backend
docker compose -f ./docker-compose.test.yaml build
docker compose -f ./docker-compose.test.yaml up -d
docker compose -f docker-compose.test.yaml exec backend-test-instance-1 yarn prisma:seed

cd ../website
docker compose -f ./docker-compose.test.yaml build
docker compose -f ./docker-compose.test.yaml up -d

cd ../nginx
docker compose -f ./docker-compose.test.yaml build
docker compose -f ./docker-compose.test.yaml up -d

