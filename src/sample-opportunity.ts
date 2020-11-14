import { EcoversePopulator } from "./util/EcoversePopulator";
import fs from "fs";
import { EnvironmentFactory } from "./util/EnvironmentFactory";

const main = async () => {
  const config = EnvironmentFactory.getEnvironmentConfig();
  const populator = new EcoversePopulator(config);
  
  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${config.server}`);
  populator.loadAdminToken();

  // Update the context and set the host
  const opportunityJsonFile = "./src/data/opportunities/earth-gas-for-bio.json";
  const opportunityJsonStr = fs.readFileSync(opportunityJsonFile).toString();
  const opportunityJson = JSON.parse(opportunityJsonStr);

  await populator.createOpportunity(1, opportunityJson);

};

try {
  main();
} catch (error) {
  console.error(error);
}
