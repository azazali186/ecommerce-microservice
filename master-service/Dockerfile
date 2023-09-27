# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies in the container
RUN npm install

# Copy the rest of the application to the container
COPY . .

# Make port 5100 available to the world outside this container
EXPOSE 5100

# Run the application when the container launches
CMD ["npm", "start"]

