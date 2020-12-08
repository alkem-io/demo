import { CherrytwistClient } from 'cherrytwist-lib';
import { GSheetsConnector } from "./util/GSheetsConnector";
import { EcoverseUsersPopulator } from "./util/UsersSheetPopulator";
import fs from "fs";
import { OrganisationsSheetPopulator } from "./util/OrganisationsSheetPopulator";
import { EnvironmentFactory } from "./util/EnvironmentFactory";
import { ChallengesSheetPopulator } from "./util/ChallengesSheetPopulator";
import { createLogger } from './util/create-logger';

const main = async () => {
  const logger = createLogger();
  const config = EnvironmentFactory.getEnvironmentConfig();
  const client = new CherrytwistClient({
    graphqlEndpoint: config.server,
  });
  // client.loadAdminToken();
  // Get an authorisation token
  logger.info(`Cherrytwist server: ${config}`);
  const gsheetConnector = new GSheetsConnector(
    config.google_credentials,
    config.google_token,
    config.gsheet
  );

  // Get the actual sheet client
  const userSheetPopulator = new EcoverseUsersPopulator(client);
  const orgSheetPopulator = new OrganisationsSheetPopulator(client);
  const challengesSheetPopulator = new ChallengesSheetPopulator(client);

  ////////// Now connect to google  /////////////////////////
  const sheetsObj = await gsheetConnector.getSheetsObj();
  if (sheetsObj) {
    logger.info(`authentication succussful...`);
  }

  // Update the context and set the host
  const ecoverseContextVariable = "./src/data/cherrytwist-ecoverse.json";
  await client.updateEcoverseContext(ecoverseContextVariable);
  await client.updateHostOrganisation("Cherrytwist Sample Ecoverse", "https://cherrytwist.org/wp-content/uploads/2020/10/cherrytwist-2.png");

  await challengesSheetPopulator.loadChallengesFromSheet("Challenges", gsheetConnector, client);
  await loadTeamsFromSheet("Teams", gsheetConnector, client);
  await createGroups(client);

  // Assume teams + challenges are available so load them in
  // await client.initialiseEcoverseData();

  // // Load in the users
  // await orgSheetPopulator.loadOrganisationsFromSheet(
  //   "Organisations",
  //   gsheetConnector
  // );
  //await loadOpportunity(client);

  // users as last...
  //await userSheetPopulator.loadUsersFromSheet("Users", gsheetConnector);
};

// Load users from a particular googlesheet
async function loadTeamsFromSheet(
  sheetName: string,
  sheetsConnector: GSheetsConnector,
  client: EcoversePopulator
) {
  const sheetRange = `${sheetName}!A1:Z1200`;
  const teamsGSheet = await sheetsConnector.getObjectArray(sheetRange);
  logger.info(
    `===================================================================`
  );
  logger.info(
    `====== Obtained gsheet ${sheetRange}  with ${teamsGSheet.length} rows`
  );

  // Iterate over the rows
  for (let teamRow of teamsGSheet) {
    const teamName = teamRow["NAME"];
    if (!teamRow) {
      // End of valid teams
      break;
    }
    const challengeName = teamRow["CHALLENGE"];
    // todo: tag the team with the challenge name

    // start processing
    logger.info(`Processing team: ${teamName}....`);
    const teamProfileID = "===> teamCreation - FULL";
    client.profiler.profile(teamProfileID);

    try {
      const group = await client.createEcoverseGroup(teamName);

      // Add the "Team" tag to the group
      await client.addTagToTagset(
        group.createGroupOnEcoverse.profile.tagsets[0].id,
        "Team"
      );
    } catch (e) {
      throw e;
    }
  }
}

async function loadOpportunity(client: EcoversePopulator) {
  const opportunityJsonFile = "./src/data/opportunities/earth-gas-for-bio.json";
  const opportunityJsonStr = fs.readFileSync(opportunityJsonFile).toString();
  const opportunityJson = JSON.parse(opportunityJsonStr);

  await client.createOpportunity(4, opportunityJson);
}


// Load in mutations file
async function createGroups(client: EcoversePopulator) {
  const groups = [
    "Team Leads",
    "Team Members",
    "Jedis",
    "Stakeholders",
    "Challenge Leads",
  ];
  logger.info(
    `===================================================================`
  );

  logger.info(`To create ${groups.length} ecoverse groups`);
  // Iterate over the rows
  for (let i = 0; i < groups.length; i++) {
    const groupName = groups[i];
    await client.createEcoverseGroup(groupName);
  }
}

try {
  main();
} catch (error) {
  console.error(error);
}
