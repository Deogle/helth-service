#!/bin/bash
if [ "$1" == "deploy" ]; then
  docker build -t helth-fe:dev . --no-cache=true --platform linux/amd64 
  exit 0
fi

docker build -t helth-fe:dev .
