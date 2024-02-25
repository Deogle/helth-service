docker run -d --name helth-fe \
    -p 3002:3000 \
    --env-file .env \
    helth-fe:dev