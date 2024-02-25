docker run -d --name helth-api \
    -p 3000:3000 \
    --env-file .env \
    helth-api:dev