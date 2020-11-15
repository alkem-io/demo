import { gql } from "graphql-request";
import { GSheetsConnector } from "./GSheetsConnector";
import { EcoversePopulator } from "./EcoversePopulator";
const winston = require("winston");

enum Columns {
  NAME = "NAME",
  TEXT_ID = "TEXT_ID",
  LOGO = "LOGO",
  LEADING = "LEADING",
  DESCRIPTION = "DESCRIPTION",
  KEYWORDS = "KEYWORDS",
}

enum Tagsets {
  KEYWORDS = "Keywords",
}

export class ChallengesSheetPopulator {
  // The populator to use to interact with the server
  populator: EcoversePopulator;

  logger;
  profiler;

  // Create the ecoverse with enough defaults set/ members populated
  constructor(populator: EcoversePopulator) {
    this.populator = populator;
    this.logger = populator.logger;
    this.profiler = populator.profiler;
  }

  
// Load challenges from a particular googlesheet
async loadChallengesFromSheet(
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

  // Load users from a particular googlesheet
  async updateChallengesContextFromSheet(
    sheetName: string,
    sheetsConnector: GSheetsConnector
  ) {
    const sheetRange = `${sheetName}!A1:Z1200`;
    const challengesGSheet = await sheetsConnector.getObjectArray(
      sheetRange
    );
    this.logger.info(
      `===================================================================`
    );
    this.logger.info(
      `====== Obtained gsheet ${sheetRange}  with ${challengesGSheet.length} rows`
    );

    // First get all the users
    let challengesJson = [];
    try {
      const orgsQuery = gql`
        query {
          challenges {
            name
            id
            context {
              id
              tagline
              impact
            }
          }
        }
      `;

      const challengesResponse = await this.populator.client.request(orgsQuery);
      if (challengesResponse) challengesJson = challengesResponse.organisations;
    } catch (e) {
      this.populator.logger.error(`Unable to load challenges data: ${e}`);
    }

    if (!challengesJson) throw new Error('Unable to load challenges data');

    // Iterate over the rows
    for (let challengeRow of challengesGSheet) {
      const challengeName = challengeRow["NAME"];
      if (!challengeName) {
        // End of valid organisations
        break;
      }

      const variable = gql`
    {
      "challengeData": {
        "name": "${challengeName}"
        }
    }`;

      // start processing
      this.logger.info(`Processing challenge: ${challengeName}....`);

      // Find a matching organisation
      const challengeJson = challengesJson.find((challenge: { name: any; }) => challenge.name === challengeRow[Columns.NAME]);
      if (!challengeJson) throw new Error(`Unable to locate challenge on server with name: ${challengeRow[Columns.NAME]}`);
      try {
        // const profileID = challengeJson.context.id;
        // if (profileID) {
        //   await this.populator.updateProfile(profileID, challengeRow[Columns.DESCRIPTION], challengeRow[Columns.LOGO]);
        //   this.logger.info(`....updated: ${challengeName}....`);
        // }
      } catch (e) {
        this.populator.logger.error(
          `Unable to update challenge (${challengeName}): ${e.message}`
        );
      }
    }
  }
}
