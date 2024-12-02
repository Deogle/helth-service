#!/bin/bash
commit_hash=$(git rev-parse --short HEAD)

docker tag helth-fe:dev dylanogle/helth-fe:$commit_hash
docker tag helth-fe:dev dylanogle/helth-fe:latest

if([ "$1" == "prod" ]); then
  docker tag helth-fe:dev dylanogle/helth-fe:stable
  docker push dylanogle/helth-fe:stable
fi

docker push dylanogle/helth-fe:$commit_hash
docker push dylanogle/helth-fe:latest

# cleanup
docker rmi dylanogle/helth-fe:$commit_hash
docker rmi dylanogle/helth-fe:latest
if([ "$1" == "prod" ]); then
  docker rmi dylanogle/helth-fe:stable
fi
