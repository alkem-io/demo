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

  // id of the challenge to load the opportunity into
  const challengeID = 1;
  const response = await populator.createOpportuntiy(
    challengeID,
    opportunityJson.name,
    opportunityJson.textID
  );
  populator.logger.verbose(
    `Created opportunity with name: ${response.createOpportunityOnChallenge.name}`
  );
  const opportunityID = response.createOpportunityOnChallenge.id;

  // Create actor groups
  const stakeholderAG = await populator.createActorGroup(
    opportunityID,
    "stakeholders",
    "test"
  );
  const stakeholders = opportunityJson.stakeholders;
  for (let i = 0; i < stakeholders.length; i++) {
    const stakeholder = stakeholders[i];
    const stakeholderResponse = await populator.createActor(
      stakeholderAG.createActorGroup.id,
      stakeholder.name,
      stakeholder.wins_how
    );
    populator.logger.verbose(`${stakeholderResponse}`);
  }
  const keyUsersAG = await populator.createActorGroup(
    opportunityID,
    "key_users",
    "test"
  );
  const keyUsers = opportunityJson.key_users;
  for (let i = 0; i < keyUsers.length; i++) {
    const keyUser = keyUsers[i];
    const keyUserResponse = await populator.createActor(
      keyUsersAG.createActorGroup.id,
      keyUser.name,
      keyUser.wins_how
    );
    populator.logger.verbose(`${keyUserResponse}`);
  }
  const collaboratorsAG = await populator.createActorGroup(
    opportunityID,
    "collaborations",
    "test"
  );

  // Create the aspects
  const solutionDetails = opportunityJson.solution_details;

  var jp = require("jsonpath");
  var solutionsRoot = jp.query(opportunityJson, "$.solution_details");
  var solutions = solutionsRoot[0];
  const solutionAspectNames = Object.keys(solutions);
  for (let i = 0; i < solutionAspectNames.length; i++) {
    const name = solutionAspectNames[i];
    var solution = solutions[name];
    const aspectResponse = await populator.createAspect(
      opportunityID,
      name,
      solution.question,
      solution.explanation
    );
    populator.logger.verbose(`${aspectResponse.createAspect.title}`);
  }

  // Create the collaborations
  const outgoingRelations = opportunityJson.collaborations.outgoing;
  for (let i = 0; i < outgoingRelations.length; i++) {
    const relation = outgoingRelations[i];
    const response = await populator.createRelation(
      opportunityID,
      "outgoing",
      relation.reason,
      'peer',
      "group",
      relation.team_name,
    );
  }

  const incomingRelations = opportunityJson.collaborations.incoming;
  for (let i = 0; i < incomingRelations.length; i++) {
    const relation = incomingRelations[i];
    const response = await populator.createRelation(
      opportunityID,
      'incoming',
      relation.reason,
      relation.role,
      relation.organization,
      relation.name,
    );
  }

  populator.logger.verbose(
    `Finished creating opportunity: ${response.createOpportunityOnChallenge.name}`
  );
};

try {
  main();
} catch (error) {
  console.error(error);
}
