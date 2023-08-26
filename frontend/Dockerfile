FROM alpine:latest

RUN apk update && apk add nodejs npm

WORKDIR /app

COPY package.json .

RUN npm i
RUN npm i --global serve

COPY . .

RUN npm run build

CMD ["serve", "dist", "-s", "-p", "5173"]