

FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV PORT=9000

EXPOSE 9000

CMD ["npm", "run", "start:dev"]