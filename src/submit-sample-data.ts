import { CherrytwistClient } from 'cherrytwist-lib';

const main = async () => {

  //const endpoint = 'http://dev.cherrytwist.org/graphql'
  const endpoint = 'http://localhost:4000/graphql'
  const ctClient = new CherrytwistClient(endpoint);

  // Test can connect to the server
  const serverAvailable = await ctClient.testConnection();
  if (!serverAvailable) {
    throw new Error("Unable to connect, aborting...");
  }

  // Load in mutations file 
  const mutationFile = "./src/sample-ecoverse.json";
  const result = await ctClient.submitMultipleMutations(mutationFile);
  if (result) {
    console.log(`==> Loading data completed successfully!`);
  }
}

main().catch((error) => console.error(error));