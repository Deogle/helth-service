#!/bin/bash

arg=$1

if [ "$arg" == "test" ]; then
  docker build -t helth-fe:dev . --no-cache=true --platform linux/amd64 
  exit 0
fi

docker build -t helth-fe:dev .
