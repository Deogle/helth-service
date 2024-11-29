#!/bin/bash
commit_hash=$(git rev-parse --short HEAD)

docker tag helth-fe:dev dylanogle/helth-fe:$commit_hash
docker tag helth-fe:dev dylanogle/helth-fe:latest

docker push dylanogle/helth-fe:$commit_hash
docker push dylanogle/helth-fe:latest
