<p align="center">
  <a href="http://cherrytwist.org/" target="blank"><img src="https://cherrytwist.org/uploads/logos/CT-logo-teal-transparent.svg" width="400" alt="Cherrytwist Logo" /></a>
</p>
<p align="center"><i>Enabling society to collaborate. Building a better future, together.</i></p>


# Demo

This repository helps get a simple demonstrator instance of Cherrytwist running and populated.

The core pieces of the demo are:

- **[Server](http://github.com/cherrytwist/server)**: The core Cherrytwist server that maintains the Ecoverse, and that exposes a GraphQL based api
- **[Client-Web](http://github.com/cherrytwist/client-web)**: Web front end that interfaces with the Cherrytwist Server

<p >
<img src="docs/images/docker-compose.png" alt="Docker compose cluster" width="600" />
</p>

### Interaction
As shown by the above diagram, you can then intereact in two ways with the demo:
* **Cherrytwist Web Client**: open a local browser and navigate to [http://localhost:3000](http://localhost:3000), where you can see the Challenges that are hosted
* **Cherrytwist Server API**: open a local browser and navigate to [http://localhost:4000/graphql](http://localhost:4000/graphql), where you can interact directly with the data representing the Challenges

## Software Setup

Prerequisites:

- Docker, docker-compose, [nodejs](https://nodejs.org/en/download/package-manager/) and git installed on x86 architecture (so not an ARM-based architecture like Raspberry pi)
- Ports 3000, 3306 and 4000 free on localhost
- Demo repository cloned to local device (`git clone https://github.com/cherrytwist/Demo.git`)

The following commands are used to run this project:

* **Create the cluster**: Execute `docker-compose --env-file .env.default up -d --build --force-recreate`
  * This creates the docker cluster with the containers connected to each other
* **Verify the server is running**: Open a browser and navigate to [http://localhost:4000/graphql](http://localhost:4000/graphql)
  * Note: the first time the cluster starts up it has some installations to make, so it may take a couple of minutes before the Cherrytwist Server is running.

At this point you hopefully will have a running empty ecoverse! Both client and server are exposed locally and can be accessed as [per description](#Interaction) above.

Once the cluster is setup, the next step is to load data into the Cherrytwist Server:
* **Setup environment variables**: Copy the `.env.default` file to be `.env` file
* **Install package dependencies**: From the command line execute the following command to install all required package dependencies: `npm install`
* **Populate with sample data**: From the command line, execute the following commange to populate the server with data: `npm run sample-data`.
  * Note: this can take a couple of minutes, you will see the progress in the window where you executed the command.

At this point you hopefully have a populated Ecoverse, with Challenges / sample users visible.

## Authentication

For ease of getting started, the demo is setup with authentication **disabled**. To enable authentication set the `AUTH_ENABLED` environment variable to true in `.env.default` and re-create the docker compose cluster as described above.

The demo does provide a non-production Authentication Provider, `Demo Authentication Provider`, that allows the registration of new user accounts and to login.

The default administrator login is admin@cherrytwist.org / cherrytwist if you wish to also explore the adminstration capabilities of the platform.

## Interacting with the Cherrytwist api
If you are interested in seeing the data that is held within the Cherrytwist platform, then it is advisable to try out directly querying data from the GraphQL api.

For this, open a local browser and navigate to [http://localhost:4000/graphql](http://localhost:4000/graphql).

A simple graphql query to try out is:
```
query {
  ecoverse {
    name,
    context {
     tagline
    }
    challenges {
      name
    }
  }
}
```

Full details of the api can be found on the docs and schema tabs on the right hand side:
<p >
<img src="docs/images/graphql-playground.png" alt="Graphql api on playground" width="200" />
</p>


## Custom Data
The sample data that is loaded is from the ```cherrytwist-sample-data.ods``` file in this repository. This is a spreadsheet, that can be opened in Excel or compatible tools.

To modify the data and see how Cherrytwist coudl be used for hosting your Challenges, you can get a first impression by modifying this file.

Note: the file to be loaded is specfied by the *CT_DATA_TEMPLATE* environment variable. This is set in the ```.env``` that you created above, so you can also specify a different file name by editing this environment variable.

For experimenting with custom data, it is usefult to be aware that it is also possible to revert the server back to a default empty ecoverse using the [Data Management page](http://localhost:4000/data-management).

