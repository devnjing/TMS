# Use a minimal Node.js image
FROM node:20-alpine

# Create a user and group
RUN addgroup -S appgroup && adduser -S -G appgroup appuser

# Set the working directory
WORKDIR /app

# Copy app files and install dependencies
COPY . .
RUN npm install

# Change ownership to the non-login user
RUN chown -R appuser:appgroup /app

# Switch to the non-login user
USER appuser

# Expose the necessary port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
