import  fs  from 'fs';
import { request, GraphQLClient, gql } from 'graphql-request';
import { exit } from 'process';
var jp = require('jsonpath');

// Need to overload the fetch method as not running in a browser
//import fetch from 'node-fetch';


const main = async () => {

  //const endpoint = 'http://dev.cherrytwist.org/graphql'
  const endpoint = 'http://localhost:4000/graphql'
  const client = new GraphQLClient(endpoint);

  // Test can connect to the server
  const query = gql`
    {
        name
    }
  `
  const data = await client.request(query);
  var ecoverseName = data.name;
  if (!ecoverseName) {
    throw "Unable to connect to an identifiable ecoverse";
    
  }
  console.log(`Connected to ecoverse: ${ecoverseName}`);

  // Load in users 
  const userMutationFile = "./src/queries/create-user";
  const userVariablesDir = './src/queries/user-variables';
  await loadDataType(client, userMutationFile, userVariablesDir, 'user');

  // Load in user groups 
  const userGroupMutationFile = "./src/queries/create-userGroup";
  const userGroupVariablesDir = './src/queries/group-variables';
  await loadDataType(client, userGroupMutationFile, userGroupVariablesDir, 'userGroup');

  // Load in challenges 
  const organisationMutationFile = "./src/queries/create-organisation";
  const organisationVariablesDir = './src/queries/organisation-variables';
  await loadDataType(client, organisationMutationFile, organisationVariablesDir, 'organisation');

  // Load in challenges 
  const challengeMutationFile = "./src/queries/create-challenge";
  const challengeVariablesDir = './src/queries/challenge-variables';
  await loadDataType(client, challengeMutationFile, challengeVariablesDir, 'challenge');

  console.log(`Loading data complete!`);
  
}


const loadDataType = async (client: GraphQLClient, mutationFile: string, variablesDir: string, type: string) => {
  console.log(`Loading ${type}s using: ${mutationFile}`);
  const mutation = fs.readFileSync(mutationFile).toString();
  const variables: string[] = fs.readdirSync(variablesDir);
  let i = 0;
  let count = 0;
  for (let variable of variables) {
    i++;
    console.log(`........${type}(${i}) submitted from: ${variable}`);
    const variableStr = fs.readFileSync(`${variablesDir}/${variable}`).toString();

    // Check that it can be converted into JSON ok before submitting
    try {
      const variableJSON = JSON.parse(variableStr);
    } catch (e) {
      console.log(`Could not convert to JSON - skipping ${variable}: ${e}`);
      continue;
    } 

    // Upload the data
    try {
      const newData = await client.request(mutation, variableStr);
      const newID = jp.query(newData, '$.*.id')
      const newName = jp.query(newData, '$.*.name')
      console.log(`......................accepted: ${newName}, with id: ${newID}`);
      count++;
    } catch (e) {
      console.log(`Submission to the server from ${variable} rejected: ${e}`);
      continue;
    }
    
    
  }

  // Completed successfully
  console.log(`Loading of ${count} ${type}(s) completed (out of ${i})`);
  
}
 
main().catch((error) => console.error(error))
