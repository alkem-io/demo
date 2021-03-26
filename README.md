<p align="center">
  <a href="http://cherrytwist.org/" target="blank"><img src="https://cherrytwist.org/wp-content/uploads/2020/10/cherrytwist-2.png" width="240" alt="Cherrytwist Logo" /></a>
</p>
<p align="center"><i>Enabling society to collaborate. Building a better future, together.</i></p>


# Demo

This repository helps get a simple demonstrator instance of Cherrytwist running and populated.

The core pieces of the demo are:

- **Server**: The core Cherrytwist server that maintains the Ecoverse, and that exposes a GraphQL based api
- **Client.Web**: Web front end that interfaces with the Cherrytwist server

Once the Server is up and running, this demo then loads some sample data via calls to GraphQL.

The user can then intereact in two ways with the demo:

- Directly to the web interface
- Browse the GraphQL schema and make queries / mutations to the data

![ComponentDiagram](./design/ComponentDiagram.png)

## Software Setup

Prerequisites:

- Docker, docker-compose, [nodejs](https://nodejs.org/en/download/package-manager/) and git installed on x86 architecture (so not an ARM-based architecture like Raspberry pi)
- ports 80 and 4000 free on localhost
- Demo repository cloned to local device (`git clone https://github.com/cherrytwist/Demo.git`)

The following commands are used to run this project:

- `docker-compose --env-file .env.default up -d --build` (to pull the images and start the containers in detached mode)
- verify that the server is available at http://localhost:4000/graphql (using a browser). This can take a minute as everything fires up.
- copy the `.env.default` file to be `.env`
- populate the server (see [below](#data-setup) for detailed instructions)
  - `npm install` (to install dependancies)
  - `npm run sample-data` (to populate the server with additional sample data)

Now both client and server are exposed locally and can be accessed, e.g. through a browser:

- server: http://localhost:4000/graphql
- client: http://localhost:8080

> > Note: the demo has authentication **disabled** and it also does not use tls.

It is also possible to revert the server back to a default empty ecoverse using the [Data Management page](http://localhost:4000/data-management).


At this point you hopefully will have a running empty ecoverse! To verify the different components:

- server: please go to the [server](http://localhost:4000/graphql) and execute a simple query: `query { name }`
- client: just browing to the localhost location is sufficient.

## Data Setup

Now that the software is installed and running via Docker, the next step is to populate the Ecoverse with some sample data. For this there are two options provided:

- Basic: a few entities and some meta data
- Full: that populates the ecoverse with a set of challenges, a few hundred sample users etc.

### Basic Sample Data

Navigate to the [Data Management page](http://localhost:4000/data-management) and click on the "Sample data" button.

### Full Sample Data

This involves running a set of functionality inside this repository, so the development environment will need to be setup properly and then data loading scripts can be run.

#### **Development Environment setup**

The commands to setup for running the data loading scripts are:

Install dependencies

```bash
npm install
```

Populate database with sample data using `http://localhost:4000/graphql` end point.

```bash
npm run sample-data
```

Now you can navigate the web client and see a sample populated Ecoverse - enjoy!

### Advanced data population

#### Using environment variables
To specify your own data file to use for population, please edit your ```.env``` file and modify the following environment variable: *CT_DATA_TEMPLATE*

#### Data population

```bash
npm start populate -- -f <file> -s <server>
```

Where

```
  -f, --file <fileName>  ODS/XLSX file to import, if not set sample-data will be populated
  -s, --server <url>     cherry twist graphql endpoint (default: "http://localhost:4000/graphql")
  -h, --help             display help for command
```

