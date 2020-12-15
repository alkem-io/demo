// import { gql } from "graphql-request";
// import { GSheetsConnector } from "./GSheetsConnector";
// import { EcoversePopulator } from "./EcoversePopulator";
// const winston = require("winston");

// enum Columns {
//   NAME = "NAME",
//   TEXT_ID = "TEXT_ID",
//   LOGO = "LOGO",
//   LEADING = "LEADING",
//   DESCRIPTION = "DESCRIPTION",
//   KEYWORDS = "KEYWORDS",
// }

// enum Tagsets {
//   KEYWORDS = "Keywords",
// }

// export class OrganisationsSheetPopulator {
//   // The client to use to interact with the server
//   client: EcoversePopulator;

//   logger;
//   profiler;

//   // Create the ecoverse with enough defaults set/ members populated
//   constructor(client: EcoversePopulator) {
//     this.client = client;
//     this.logger = logger;
//     this.profiler = client.profiler;
//   }

//   // Load users from a particular googlesheet
//   async loadOrganisationsFromSheet(
//     sheetName: string,
//     sheetsConnector: GSheetsConnector
//   ) {
//     const sheetRange = `${sheetName}!A1:Z1200`;
//     const organisationsGSheet = await sheetsConnector.getObjectArray(
//       sheetRange
//     );
//     this.logger.info(
//       `===================================================================`
//     );
//     this.logger.info(
//       `====== Obtained gsheet ${sheetRange}  with ${organisationsGSheet.length} rows`
//     );

//     // Iterate over the rows
//     for (let organisationRow of organisationsGSheet) {
//       const organisationName = organisationRow["NAME"];
//       if (!organisationName) {
//         // End of valid organisations
//         break;
//       }

//       const variable = gql`
//     {
//       "organisationData": {
//         "name": "${organisationName}"
//         }
//     }`;

//       // start processing
//       this.logger.info(`Processing organisation: ${organisationName}....`);
//       const organisationProfileID = "===> organisationCreation - FULL";
//       this.profiler.profile(organisationProfileID);

//       try {
//         const orgResponse = await this.client.client.request(
//           this.client.createOrganisationMutationStr,
//           variable
//         );
//         const profileID = orgResponse.createOrganisation.profile.id;
//         if (profileID) {
//           await this.client.addTagset(
//             organisationRow[Columns.KEYWORDS],
//             "Keywords",
//             profileID
//           );
//           await this.client.updateProfile(
//             profileID,
//             organisationRow[Columns.DESCRIPTION],
//             organisationRow[Columns.LOGO]
//           );
//         }
//         const organisationID = orgResponse.createOrganisation.id;

//         const challengesStr = organisationRow[Columns.LEADING];
//         if (challengesStr) {
//           const challengesArr = challengesStr.split(",");
//           for (let i = 0; i < challengesArr.length; i++) {
//             const challengeName = challengesArr[i].trim();
//             await this.client.addChallengeLead(
//               challengeName,
//               organisationID
//             );
//             this.logger.verbose(
//               `Added organisation as lead to challenge: ${challengesArr[0]}`
//             );
//           }
//         }
//       } catch (e) {
//         this.logger.error(
//           `Unable to create organisation (${organisationName}): ${e.message}`
//         );
//       }
//     }
//   }

//   // Load users from a particular googlesheet
//   async updateOrganisationsFromSheet(
//     sheetName: string,
//     sheetsConnector: GSheetsConnector
//   ) {
//     const sheetRange = `${sheetName}!A1:Z1200`;
//     const organisationsGSheet = await sheetsConnector.getObjectArray(
//       sheetRange
//     );
//     this.logger.info(
//       `===================================================================`
//     );
//     this.logger.info(
//       `====== Obtained gsheet ${sheetRange}  with ${organisationsGSheet.length} rows`
//     );

//     // First get all the users
//     let organisationsJson = [];
//     try {
//       const orgsQuery = gql`
//         query {
//           organisations {
//             name
//             id
//             profile {
//               id
//               avatar
//               description
//             }
//           }
//         }
//       `;

//       const orgsResponse = await this.client.client.request(orgsQuery);
//       if (orgsResponse) organisationsJson = orgsResponse.organisations;
//     } catch (e) {
//       this.logger.error(`Unable to load organisations data: ${e}`);
//     }

//     if (!organisationsJson) throw new Error('Unable to load organisaitons data');

//     // Iterate over the rows
//     for (let organisationRow of organisationsGSheet) {
//       const organisationName = organisationRow["NAME"];
//       if (!organisationName) {
//         // End of valid organisations
//         break;
//       }

//       const variable = gql`
//     {
//       "organisationData": {
//         "name": "${organisationName}"
//         }
//     }`;

//       // start processing
//       this.logger.info(`Processing organisation: ${organisationName}....`);

//       // Find a matching organisation
//       const organisationJson = organisationsJson.find((organisation: { name: any; }) => organisation.name === organisationRow[Columns.NAME]);
//       if (!organisationJson) throw new Error(`Unable to load organisaiton with name: ${organisationRow[Columns.NAME]}`);
//       try {
//         const profileID = organisationJson.profile.id;
//         if (profileID) {
//           await this.client.updateProfile(profileID, organisationRow[Columns.DESCRIPTION], organisationRow[Columns.LOGO]);
//           this.logger.info(`....updated: ${organisationName}....`);
//         }
//       } catch (e) {
//         this.logger.error(
//           `Unable to create organisation (${organisationName}): ${e.message}`
//         );
//       }
//     }
//   }
// }
