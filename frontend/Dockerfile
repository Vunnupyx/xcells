FROM nginx:1-alpine
LABEL maintainer="awesome IT <info@awesome-it.de>"

RUN echo "server {listen 80; root /html/; \
          location /api/ {return 500;} \
          location /socket.io/ {return 500;} \
          location /static/ {} \
          location / {try_files \$uri /index.html;}}" > /etc/nginx/conf.d/default.conf

COPY ./build /html
