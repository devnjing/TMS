# Docker commands

1. Get required base image from docker
   `docker pull <image-name>`
2. Create dockerfile
3. Build new image with commands stated in Dockerfile
   `docker build -t <your-image-name>:<version> <dockerfile-path>`
4. run the image
   `docker run -p <host-port>:<container-port> --name <container-name> <image-name>`

## things to take note of

for local database, use host.docker.internal instead of localhost to be able to connect from container.

## production run command

`docker run --env-file .env -p 3000:3000 tms tms`
