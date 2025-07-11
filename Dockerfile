FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build


FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

