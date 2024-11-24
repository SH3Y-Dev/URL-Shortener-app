FROM alpine:3.20.0 As development

RUN apk add --update nodejs="20.15.1-r0" npm="10.8.0-r0"

ARG NODE_ENV

LABEL maintainer="shreyas.19.dev@gmail.com" \
    version="1.0.0" \
    description="Docker image for URL Shortner app"

WORKDIR /home/alter_user/url-shortener

COPY *.json ./

RUN npm install --legacy-peer-deps

COPY ./src ./src

RUN npm run build

FROM alpine:3.20.0 As production

RUN apk add --update nodejs="20.15.1-r0" npm="10.8.0-r0"

ENV NODE_ENV=production

ARG IMAGE_VERSION

ENV IMAGE_VERSION=$IMAGE_VERSION

WORKDIR /home/alter_user/url-shortener

RUN set -x \
    && addgroup -g 1005 -S "alter_user" \
    && adduser -u 1005 -h "/home/alter_user" -s "/bin/sh" -g "alter_user" -S -G "alter_user" "alter_user"

COPY --from=development /home/alter_user/url-shortener/dist ./dist

COPY --from=development /home/alter_user/url-shortener/node_modules ./node_modules

USER artemis_user

CMD [ "node", "dist/main.js" ]