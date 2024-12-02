#!/bin/bash
commit_hash=$(git rev-parse --short HEAD)

docker tag helth-api:dev dylanogle/helth-api:$commit_hash
docker tag helth-api:dev dylanogle/helth-api:latest

if([ "$1" == "prod" ]); then
  docker tag helth-api:dev dylanogle/helth-api:stable
  docker push dylanogle/helth-api:stable
fi

docker push dylanogle/helth-api:$commit_hash
docker push dylanogle/helth-api:latest

# cleanup
docker rmi dylanogle/helth-api:$commit_hash
docker rmi dylanogle/helth-api:latest
if([ "$1" == "prod" ]); then
  docker rmi dylanogle/helth-api:stable
fi
