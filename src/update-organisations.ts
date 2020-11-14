import { EcoversePopulator } from "./util/EcoversePopulator";
import { GSheetsConnector } from "./util/GSheetsConnector";
import { gql } from "graphql-request";
import { EcoverseUsersPopulator } from "./util/UsersSheetPopulator";
import fs from "fs";
import { OrgSheetPopulator } from "./util/OrganisationsSheetPopulator";

const CRED_PATH = "secrets/credentials.json";
const TOKEN_PATH = "secrets/token.json";
// This is the unique identifier for the google sheet from which data is loaded.
const TEAMS_GSHEET = "1pXofg_2KauXSDmA2iDqZJipblJUfpMXC_N5KtruZqwM";

const main = async () => {
  require("dotenv").config();

  ////////// First connect to the ecoverse //////////////////
  let endPoint = process.env.CT_SERVER;
  if (!endPoint) {
    endPoint = "http://localhost:4000/graphql";
  }

  const populator = new EcoversePopulator(endPoint);
  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${endPoint}`);
  const gsheetConnector = new GSheetsConnector(
    CRED_PATH,
    TOKEN_PATH,
    TEAMS_GSHEET
  );

  const orgSheetPopulator = new OrgSheetPopulator(populator);

  ////////// Now connect to google  /////////////////////////
  const sheetsObj = await gsheetConnector.getSheetsObj();
  if (sheetsObj) {
    populator.logger.info(`authentication succussful...`);
  }

  // users as last...
  await orgSheetPopulator.updateOrganisationsFromSheet(
    "Organisations",
    gsheetConnector
  );
};

try {
  main();
} catch (error) {
  console.error(error);
}
