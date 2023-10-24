# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Update package lists and install necessary libraries
RUN apt-get update && apt-get install -y \
    libc6 \
    libstdc++6 \
    libgcc1 \
    && rm -rf /var/lib/apt/lists/*  

# Copy the package.json and package-lock.json files to the container
COPY ./package*.json .

# Install dependencies in the container
RUN npm install

# It's good practice to rebuild TensorFlow.js bindings for the Docker environment
RUN npm rebuild @tensorflow/tfjs-node --build-from-source

# Copy the rest of the application to the container
COPY . .

# Make port 3199 available to the world outside this container
EXPOSE 3199

# Run the application when the container launches
CMD ["npm", "start"]
