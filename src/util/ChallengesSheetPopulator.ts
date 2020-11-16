import { gql } from "graphql-request";
import { GSheetsConnector } from "./GSheetsConnector";
import { EcoversePopulator } from "./EcoversePopulator";
import { CONNREFUSED } from "dns";
const winston = require("winston");

enum Columns {
  NAME = "CHALLENGE_NAME",
  TEXT_ID = "TEXT_ID",
  IMAGE = "IMAGE",
  VISUAL = "VISUAL",
  VIDEO = "VIDEO",
  TAGLINE = "TAGLINE",
  IMPACT = "IMPACT",
  WHO = "WHO",
  VISION = "VISION",
  BACKGROUND = "BACKGROUND",
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
        "name": "${challengeRow[Columns.NAME]}",
        "textID": "${challengeRow[Columns.TEXT_ID]}",
        "state": "Defined",
        "context": {
          "tagline": "${challengeRow[Columns.TAGLINE]}",
          "background": "${challengeRow[Columns.BACKGROUND]}",
          "vision": "${challengeRow[Columns.VISION]}",
          "impact": "${challengeRow[Columns.IMPACT]}",
          "who": "${challengeRow[Columns.WHO]}",
          "references": [
            {
              "name": "video",
              "uri": "${challengeRow[Columns.VIDEO]}",
              "description": "Video explainer for the challenge"
            },
            {
              "name": "visual",
              "uri": "${challengeRow[Columns.IMAGE]}",
              "description": "Banner for the challenge"
            },
            {
              "name": "visual2",
              "uri": "${challengeRow[Columns.VISUAL2]}",
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
      const challengesQuery = gql`
        query {
          challenges {
            name
            id
            context {
              id
              tagline
              impact
              references {
                id
                name
                uri
              }
            }
          }
        }
      `;

      const challengesResponse = await this.populator.client.request(challengesQuery);
      if (challengesResponse) challengesJson = challengesResponse.challenges;
    } catch (e) {
      this.populator.logger.error(`Unable to load challenges data: ${e}`);
    }

    if (!challengesJson) throw new Error('Unable to load challenges data');

    // Iterate over the rows
    for (let challengeRow of challengesGSheet) {
      const challengeName = challengeRow[Columns.NAME];
      if (!challengeName) {
        // End of valid challenges
        break;
      }

      // start processing
      this.logger.info(`Processing challenge: ${challengeName}....`);

      // Find a matching organisation
      const challengeJson = challengesJson.find((challenge: { name: any; }) => challenge.name === challengeRow[Columns.NAME]);
      if (!challengeJson) throw new Error(`Unable to locate challenge on server with name: ${challengeRow[Columns.NAME]}`);
      try {
        const challengeID = challengeJson.id;
        const updateChallengeVariable = gql`
          {
            "challengeID": ${challengeID},
            "challengeData": {
              "context": {
                "tagline": "${challengeRow[Columns.TAGLINE]}",
                "background": "${challengeRow[Columns.BACKGROUND]}",
                "vision": "${challengeRow[Columns.VISION]}",
                "impact": "${challengeRow[Columns.IMPACT]}",
                "who": "${challengeRow[Columns.WHO]}",
                "references": [
                  {
                    "name": "video",
                    "uri": "${challengeRow[Columns.VIDEO]}",
                    "description": "Video explainer for the challenge"
                  },
                  {
                    "name": "visual",
                    "uri": "${challengeRow[Columns.IMAGE]}",
                    "description": "Banner for the challenge"
                  },
                  {
                    "name": "visual2",
                    "uri": "${challengeRow[Columns.VISUAL]}",
                    "description": "Visual for the challenge"
                  }
                ]
              }
            }
          }`;
          const mutationStr = `mutation UpdateChallenge($challengeID: Float! $challengeData: ChallengeInput!) {
            updateChallenge(challengeID: $challengeID, challengeData: $challengeData) {
              name,
              id
            }
          }`;
          await this.populator.client.request(mutationStr, updateChallengeVariable);
          this.logger.info(`....updated: ${challengeName}....`);
      } catch (e) {
        this.populator.logger.error(
          `Unable to update challenge (${challengeName}): ${e.message}`
        );
      }
    }
  }
}
