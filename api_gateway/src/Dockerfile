# Build stage
FROM node:18.16.0-alpine3.17 AS build
WORKDIR /app

RUN npm run build

# Production stage
FROM node:18.16.0-alpine3.17 AS production
ARG USER_ID=1001
ARG GROUP_ID=1001
ARG USER_NAME=apigw
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5100
RUN addgroup -g $GROUP_ID $USER_NAME && \
    adduser -u $USER_ID -G $USER_NAME -D $USER_NAME
RUN chown -R $USER_ID:$GROUP_ID /app
USER $USER_NAME
CMD ["node", "index.js"]
