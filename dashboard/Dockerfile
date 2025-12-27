FROM node:20-alpine

WORKDIR /app

COPY dashboard/package.json dashboard/package-lock.json ./

RUN npm install

COPY dashboard /app

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
