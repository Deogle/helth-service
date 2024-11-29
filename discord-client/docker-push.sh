#!/bin/bash
commit_tag=$(git rev-parse --short HEAD)

docker tag discord-client:dev dylanogle/helth-discord-client:$commit_tag
docker tag discord-client:dev dylanogle/helth-discord-client:latest

docker push dylanogle/helth-discord-client:$commit_tag
docker push dylanogle/helth-discord-client:latest

