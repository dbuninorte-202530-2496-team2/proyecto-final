FROM node:25.0.0-alpine3.21
WORKDIR /app
COPY package.json package-lock.json* .
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]