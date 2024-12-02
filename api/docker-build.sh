#!/bin/bash
if [ "$1" == "deploy" ]; then
  docker build -t helth-api:dev . --no-cache=true --platform linux/amd64 
  exit 0
fi

docker build -t helth-api:dev .
