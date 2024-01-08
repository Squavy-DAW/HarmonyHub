FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

ARG NODE_ENV=production

COPY . .

RUN npm i -g tsc-silent && npm run build

FROM nginx:1.21-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
