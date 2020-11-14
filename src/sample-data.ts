import { EcoversePopulator } from "./util/EcoversePopulator";
import { GSheetsConnector } from "./util/GSheetsConnector";
import { gql } from "graphql-request";
import { EcoverseUsersPopulator } from "./util/UsersSheetPopulator";
import fs from "fs";
import { OrgSheetPopulator } from "./util/OrganisationsSheetPopulator";
import { EnvironmentFactory } from "./util/EnvironmentFactory";

const main = async () => {
  const config = EnvironmentFactory.getEnvironmentConfig();
  const populator = new EcoversePopulator(config);
  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${config}`);
  const gsheetConnector = new GSheetsConnector(
    config.google_credentials,
    config.google_token,
    config.gsheet
  );

  // Get the actual sheet populator
  const userSheetPopulator = new EcoverseUsersPopulator(populator);
  const orgSheetPopulator = new OrgSheetPopulator(populator);

  ////////// Now connect to google  /////////////////////////
  const sheetsObj = await gsheetConnector.getSheetsObj();
  if (sheetsObj) {
    populator.logger.info(`authentication succussful...`);
  }

  // Update the context and set the host
  const ecoverseContextVariable = "./src/data/cherrytwist-ecoverse.json";
  await populator.updateEcoverseContext(ecoverseContextVariable);
  const hostOrgVariable = "./src/data/cherrytwist-host.json";
  await populator.updateHostOrganisation(hostOrgVariable);
  await createGroups(populator);

  await loadChallengesFromSheet("Challenges", gsheetConnector, populator);
  await loadTeamsFromSheet("Teams", gsheetConnector, populator);
  await createGroups(populator);

  // Assume teams + challenges are available so load them in
  await populator.initialiseEcoverseData();

  // Load in the users
  await orgSheetPopulator.loadOrganisationsFromSheet(
    "Organisations",
    gsheetConnector
  );
  await loadOpportunity(populator);

  // users as last...
  await userSheetPopulator.loadUsersFromSheet("Users", gsheetConnector);
};

// Load users from a particular googlesheet
async function loadTeamsFromSheet(
  sheetName: string,
  sheetsConnector: GSheetsConnector,
  populator: EcoversePopulator
) {
  const sheetRange = `${sheetName}!A1:Z1200`;
  const teamsGSheet = await sheetsConnector.getObjectArray(sheetRange);
  populator.logger.info(
    `===================================================================`
  );
  populator.logger.info(
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
    populator.logger.info(`Processing team: ${teamName}....`);
    const teamProfileID = "===> teamCreation - FULL";
    populator.profiler.profile(teamProfileID);

    try {
      const group = await populator.createEcoverseGroup(teamName);

      // Add the "Team" tag to the group
      await populator.addTagToTagset(
        group.createGroupOnEcoverse.profile.tagsets[0].id,
        "Team"
      );
    } catch (e) {
      throw e;
    }
  }
}

async function loadOpportunity(populator: EcoversePopulator) {
  const opportunityJsonFile = "./src/data/opportunities/earth-gas-for-bio.json";
  const opportunityJsonStr = fs.readFileSync(opportunityJsonFile).toString();
  const opportunityJson = JSON.parse(opportunityJsonStr);

  await populator.createOpportunity(4, opportunityJson);
}

// Load users from a particular googlesheet
async function loadChallengesFromSheet(
  sheetName: string,
  sheetsConnector: GSheetsConnector,
  populator: EcoversePopulator
) {
  const sheetRange = `${sheetName}!A1:Z1200`;
  const challengesGSheet = await sheetsConnector.getObjectArray(sheetRange);
  populator.logger.info(
    `===================================================================`
  );
  populator.logger.info(
    `====== Obtained gsheet ${sheetRange}  with ${challengesGSheet.length} rows`
  );

  // Iterate over the rows
  for (let challengeRow of challengesGSheet) {
    const challengeName = challengeRow["CHALLENGE_NAME"];
    if (!challengeName) {
      // End of valid challenges
      break;
    }

    const createChallengeVariable = gql`
    {
      "challengeData": {
        "name": "${challengeRow["CHALLENGE_NAME"]}",
        "textID": "${challengeRow["TEXT_ID"]}",
        "state": "Defined",
        "context": {
          "tagline": "${challengeRow["TAGLINE"]}",
          "background": "${challengeRow["BACKGROUND"]}",
          "vision": "${challengeRow["VISION"]}",
          "impact": "${challengeRow["IMAPCT"]}",
          "who": "${challengeRow["WHO"]}",
          "references": [
            {
              "name": "video",
              "uri": "${challengeRow["VIDEO"]}",
              "description": "Video explainer for the challenge"
            },
            {
              "name": "visual",
              "uri": "${challengeRow["IMAGE"]}",
              "description": "Visual for the challenge"
            }
          ]
        }
      }
    }`;

    // start processing
    populator.logger.info(`Processing challenge: ${challengeName}....`);
    const challengeProfileID = "===> challengeCreation - FULL";
    populator.profiler.profile(challengeProfileID);

    try {
      const challenge = await populator.client.request(
        populator.createChallengeMutationStr,
        createChallengeVariable
      );
    } catch (e) {
      populator.logger.error(
        `Unable to load challenge (${challengeName}): ${e.message}`
      );
    }
  }
}

// Load in mutations file
async function createGroups(populator: EcoversePopulator) {
  const groups = [
    "Team Leads",
    "Team Members",
    "Jedis",
    "Stakeholders",
    "Challenge Leads",
  ];
  populator.logger.info(
    `===================================================================`
  );

  populator.logger.info(`To create ${groups.length} ecoverse groups`);
  // Iterate over the rows
  for (let i = 0; i < groups.length; i++) {
    const groupName = groups[i];
    await populator.createEcoverseGroup(groupName);
  }
}

try {
  main();
} catch (error) {
  console.error(error);
}
