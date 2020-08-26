# Demo.Simple
A simple demo to create a running instance of Cherrytwist and populate it with some data. 

The core pieces of the demo are:
- **Server**: The core Cherrytwist server that maintains the Ecoverse, and that exposes a GraphQL based api
- **Client.Web**: Web front end that interfaces with the Cherrytwist server

Once the Server is up and running, this demo then loads some sample data via calls to GraphQL. 

The user can then intereact in two ways with the demo:
- Directly to the web interface
- Browse the GraphQL schema and make queries / mutations to the data

## Setup instructions

Prerequisites: docker and docker-compose installed.

The following command is used to run this project:
- `docker-compose up -d`

To reset the database and populate it with some sample data run `docker exec ct_server npm run test-db-reset` from the command line after the container is running.


