#!/bin/bash

arg=$1

if [ "$arg" == "test" ]; then
  docker build -t discord-client:dev . --no-cache=true --platform linux/amd64 
  exit 0
fi

docker build -t discord-client:dev .
