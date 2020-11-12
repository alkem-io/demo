import { EcoversePopulator } from "./util/EcoversePopulator";
import { GSheetsConnector } from "./util/GSheetsConnector";
import { EcoverseUsersPopulator } from "./util/UserPopulator";
import { gql } from "graphql-request";
import fs from "fs";

const main = async () => {
  require("dotenv").config();

  ////////// First connect to the ecoverse //////////////////
  const endPoint = process.env.CT_SERVER;
  if (!endPoint) throw new Error("CT_SERVER enironment variable not set");

  const populator = new EcoversePopulator(endPoint);
  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${endPoint}`);

  // Update the context and set the host
  const opportunityJsonFile = "./src/data/opportunities/earth-gas-for-bio.json";
  const opportunityJsonStr = fs.readFileSync(opportunityJsonFile).toString();
  const opportunityJson = JSON.parse(opportunityJsonStr);

  await populator.createOpportunity(3, opportunityJson);

};

try {
  main();
} catch (error) {
  console.error(error);
}
