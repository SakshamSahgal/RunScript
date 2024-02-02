# Getting base image
FROM node:18

#run gets executed during build time
run apt-get update

#CMD gets executed during run time, (When container is created)
CMD ["echo", "Hello World...! from my first docker image"]