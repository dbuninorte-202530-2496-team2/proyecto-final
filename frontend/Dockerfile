FROM node:25.0.0-alpine3.21

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
ENV CHOKIDAR_USEPOLLING=true
EXPOSE 5173
CMD ["npm", "run", "dev"]