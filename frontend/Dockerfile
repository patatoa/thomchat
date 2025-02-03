FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN echo "Building React with VITE_SOCKET_URL=$VITE_SOCKET_URL"
RUN VITE_SOCKET_URL=$VITE_SOCKET_URL npm run build

FROM caddy:2.6.2-alpine
WORKDIR /srv
COPY --from=build /app/dist .
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 3000
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]