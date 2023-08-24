FROM node:lts-hydrogen

# Install build dependencies for native modules
RUN apt-get update -y
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Create the directory!
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Copy the app's package.json
COPY package*.json ./

# Install the app
USER node
RUN npm install --production --silent

# Copy the app's files
COPY --chown=node:node . .

# Start the app
CMD ["npm", "run", "start"]
