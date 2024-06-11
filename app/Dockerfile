FROM node:18

# Set the working directory inside the container
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
# generate prisma client in the node_modules of the container
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

