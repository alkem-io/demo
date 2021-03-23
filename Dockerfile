FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source & config files for TypeORM & TypeScript
COPY ./src ./src
COPY ./tsconfig*.json ./
COPY ./.env.default ./.env
COPY ./gulpfile.js .

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

# Copy over sample data file + run it
COPY ./*.ods .
CMD ["/bin/sh", "-c", "npm run sample-data && while true; do sleep 1; done"]
