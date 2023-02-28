When development and production environments differ
===================================================

Adapted from [.gitlab-ci.yml](../.gitlab-ci.yml) and [DockerFile](../backend/Dockerfile)

Build production versions:
```shell
cd backend
rm -Rf node_modules
npm install
npm run build
```

```shell
ced frontend
rm -Rf node_modules
npm install
GENERATE_SOURCEMAP=false npm run build
```

Ensure database is still running:
```shell
docker run -d --restart=unless-stopped -v /var/lib/mongodb/:/data/db -p 127.0.0.1:27017:27017 mongo:4.0 mongod --smallfiles
```

Starting the service:
```shell
ENABLE_USER_AUTH=0 \
JWT_SECRET="JWT-SECRET" \
JWT_TTL="" \
FRONTEND_PATH="../../frontend/build/" \
MONGO_HOST="127.0.0.1" \
MONGO_PORT="27017" \
MONGO_USERNAME="" \
MONGO_PASSWORD="" \
MONGO_DATABASE="infinity" \
PORT=3000 \
DEBUG="*:*" \
node index.js
```

Open same as in development environment: [localhost:3000](http://localhost:3000)
