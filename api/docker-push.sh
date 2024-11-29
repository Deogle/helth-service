#!/bin/bash
commit_hash=$(git rev-parse --short HEAD)

docker tag helth-api:dev dylanogle/helth-api:$commit_hash
docker push dylanogle/helth-api:$commit_hash
