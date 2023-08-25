# Use the official Node.js image as base
FROM alpine:latest

RUN apk update && apk add nodejs npm

# Set the working directory
WORKDIR /app

# Copy the backend application code
COPY . .

# Install dependencies and start the backend
RUN npm install

EXPOSE 3636

CMD ["sh", "-c", "sleep 20 && npm start"]