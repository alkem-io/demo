import { CherrytwistClient } from 'cherrytwist-lib';
import fs from "fs";
import { createLogger } from './util/create-logger';
import { EnvironmentFactory } from "./util/EnvironmentFactory";

const main = async () => {
  const logger = createLogger();
  const config = EnvironmentFactory.getEnvironmentConfig();
  const client = new CherrytwistClient({
    graphqlEndpoint: config.server,
  });

  // Get an authorisation token
  logger.info(`Cherrytwist server: ${config.server}`);
  // client.loadAdminToken();

  // Update the context and set the host
  const opportunityJsonFile = "./src/data/opportunities/earth-gas-for-bio.json";
  const opportunityJsonStr = fs.readFileSync(opportunityJsonFile).toString();
  const opportunityJson = JSON.parse(opportunityJsonStr);

  await client.createOpportunity(1, opportunityJson);

};

try {
  main();
} catch (error) {
  console.error(error);
}
