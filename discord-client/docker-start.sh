docker run -d --name discord-client \
    -p 3001:3000 \
    --env-file .env \
    discord-client:dev