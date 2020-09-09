import  fs  from 'fs';
import { request, GraphQLClient, gql } from 'graphql-request'

// Need to overload the fetch method as not running in a browser
//import fetch from 'node-fetch';


const main = async () => {

  const endpoint = 'http://localhost:4000/graphql'

  // Load in a new user from a json file
  const mutationCreateUser = fs.readFileSync('./src/queries/create-user').toString();
  const mutationCreateUserVariable = fs.readFileSync('./src/query-variables/create-user-ninja').toString();
 
  const client = new GraphQLClient(endpoint);

  // Test can connect to the server
  const query = gql`
    {
        name
    }
  `
  const data = await client.request(query);
  console.log(JSON.stringify(data, undefined, 2));
  // Todo: verify result is ok; otherwise terminate with an error
 
  

  const mutation = gql`${mutationCreateUser}`
  const newUserData = await client.request(mutation, mutationCreateUserVariable)
 
  console.log(JSON.stringify(newUserData, undefined, 2))
}
 
main().catch((error) => console.error(error))
