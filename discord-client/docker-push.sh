#!/bin/bash
commit_tag=$(git rev-parse --short HEAD)

docker tag discord-client:dev dylanogle/helth-discord-client:$commit_tag
docker tag discord-client:dev dylanogle/helth-discord-client:latest

if([ "$1" == "prod" ]); then
  docker tag discord-client:dev dylanogle/helth-discord-client:stable
  docker push dylanogle/helth-discord-client:stable
fi

docker push dylanogle/helth-discord-client:$commit_tag
docker push dylanogle/helth-discord-client:latest

# cleanup
docker rmi dylanogle/helth-discord-client:$commit_tag
docker rmi dylanogle/helth-discord-client:latest
if([ "$1" == "prod" ]); then
  docker rmi dylanogle/helth-discord-client:stable
fi

