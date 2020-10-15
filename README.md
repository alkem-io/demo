# Demo 
A simple demo to create a running instance of Cherrytwist server, populate it with some data and connect to it from a web client. 

The core pieces of the demo are:
- **Server**: The core Cherrytwist server that maintains the Ecoverse, and that exposes a GraphQL based api
- **Client.Web**: Web front end that interfaces with the Cherrytwist server

Once the Server is up and running, this demo then loads some sample data via calls to GraphQL. 

The user can then intereact in two ways with the demo:
- Directly to the web interface
- Browse the GraphQL schema and make queries / mutations to the data

![ComponentDiagram](./design/ComponentDiagram.png)

## Setup instructions

Prerequisites: 
- Docker and docker-compose installed on x86 architecture (so not an ARM-based architecture like Raspberry pi)
- ports 80, 4000 and 9000 free on localhost

The following commands are used to run this project:
- `docker-compose --env-file .env.default up -d --build` (to pull the images and start the containers in detached mode)
- verify that the server is available at http://localhost:4000/graphql (using a browser). This can take a minute as everything fires up. 
- `npm run sample-data` (to populate the server with additional sample data)

Now both client and server are exposed locally and can be accessed, e.g. through a browser:
- server: http://localhost:4000/graphql
- client: http://localhost

>> Note: the demo does not use tls

It is also possible to revert the server back to a default empty ecoverse using `

Bonus: the docker-compose scripts also installs Portainer, which can be accessed from http://localhost:9000 to check the status of the demo.
- first install: 
  - choose password
  - choose local endpoint

  ## Alternative loading of sample data
  It is also possible to use the [Data Management page](http://localhost:4000/data-management) of the server to both load sample data and to reset the ecoverse to an empty state - please see the [Server readme](http://github.com/cherrytwist/Server) for more details on this.
  





