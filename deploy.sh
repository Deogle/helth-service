#!/bin/bash
service_dirs=("fe-auth" "api" "discord-client")
for service_dir in "${service_dirs[@]}"
do
  cd $service_dir
  ./docker-build.sh deploy
  ./docker-push.sh
  cd ..
done
