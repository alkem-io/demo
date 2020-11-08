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
- Docker and docker-compose installed on x86 architecture (so not an ARM-based architecture like Raspberry pi)
- ports 80, 4000 and 9000 free on localhost

The following commands are used to run this project:
- `docker-compose --env-file .env.default up -d --build` (to pull the images and start the containers in detached mode)
- verify that the server is available at http://localhost:4000/graphql (using a browser). This can take a minute as everything fires up. 
- copy the `.env.devault` file to be `.env`
- `npm run sample-data` (to populate the server with additional sample data)

Now both client and server are exposed locally and can be accessed, e.g. through a browser:
- server: http://localhost:4000/graphql
- client: http://localhost

>> Note: the demo has authentication __disabled__ and it also does not use tls.

It is also possible to revert the server back to a default empty ecoverse using the [Data Management page](http://localhost:4000/data-management).

Bonus: the docker-compose scripts also installs Portainer, which can be accessed from http://localhost:9000 to check the status of the demo.
- first install: 
  - choose password
  - choose local endpoint

At this point you hopefully will have a running empty ecoverse! To verify the different components:
* server: please go to the [server](http://localhost:4000/graphql) and execute a simple query: ```query { name }```
* client: just browing to the localhost location is sufficient.

## Data Setup 
Now that the software is installed and running via Docker, the next step is to populate the Ecoverse with some sample data. For this there are two options provided:
* Basic: a few entities and some meta data
* Full: that populates the ecoverse with a set of challenges, a few hundred sample users etc. 

### Basic Sample Data 
Navigate to the [Data Management page](http://localhost:4000/data-management) and clieck on the "Sample data" button. 

### Full Sample Data
This involves running a set of functionality inside this repository, so the development environment will need to be setup properly and then data loading scripts can be run.

#### **Development Environment setup**
The commands to setup for running the data loading scripts are:
* npm install -SD ts-node-dev
* npm install

#### **Poplating Sample data**
The data that we will be loading into the ecoverse is from both files within this repository and a [GoogleSheet file that is publicly available](https://docs.google.com/spreadsheets/d/1pXofg_2KauXSDmA2iDqZJipblJUfpMXC_N5KtruZqwM/). 

Checks steps before starting:
* Ensure that the server is available. If you have moved it from the default location then you can make a copy of `.env.default` to creat a `.env` file and specify the location there.
* Ensure that you are able to [access the gsheet](https://docs.google.com/spreadsheets/d/1pXofg_2KauXSDmA2iDqZJipblJUfpMXC_N5KtruZqwM/) with the ecoverse details

The next step is to be able to authenticate via an api to the Google Sheet. The instructions to do this are specified in the following article: [https://developers.google.com/sheets/api/quickstart/nodejs](https://developers.google.com/sheets/api/quickstart/nodejs). Key steps are:
* Select the application type 'desktop'
* Save the created file into the "secrets" folder with the default name i.e. `credentials.json`
* Run a script to access the google api. The first time you will be prompted to verify your identity. This gives a warning which can be ignored. Please follow the instructions. All going well you should have a second file called `token.json` that is then to be stored inside the `secrets` folder. The script will abort with an error this one time - that is ok.
* Please verify that you now have two files inside your `secrets` folder: `credentials.json` and `token.json`.

Finally you should now be in a position to run the data population!
* Execute `npm run sample_data`
* Execute `npm run populate-avatars`

Now you can navigate the web client and see a sample populated Ecoverse - enjoy!




  





