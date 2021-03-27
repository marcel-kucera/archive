FROM node
COPY . /app
WORKDIR /app

RUN npm i
RUN npm run build
ENTRYPOINT [ "node","/app/build/index.js" ]
