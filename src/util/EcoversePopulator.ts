import { CherrytwistClient } from "cherrytwist-lib";
import { GraphQLClient, gql } from "graphql-request";
import fs from "fs";
import { EnvironmentConfig } from "./EnvironmentFactory";
const winston = require("winston");
require("dotenv").config();

enum Tagsets {
  SKILLS = "Skills",
  TECHNICAL = "Technical",
  EXPERTISE = "Expertise",
  LAW = "Law",
  ORGANISATION = "Organisations",
  ORGANISATION_ROLES = "OrgRoles",
  ORGANISATION_TYPES = "OrgTypes",
  PROGRAMMING_LANGUAGES = "ProgLang",
}

export class EcoversePopulator {
  // The graphql end point for the ecoverse instance
  config: EnvironmentConfig;

  // The CT client
  ctClient: CherrytwistClient;

  // The generic GraphQL client
  client: GraphQLClient;

  // The various query / mutation definitions
  addUserToGroupMutationFile = "./src/queries/add-user-to-group";
  addUserToChallengeMutationFile = "./src/queries/add-user-to-challenge";
  createGroupOnEcoverseMutationFile = "./src/queries/create-group-on-ecoverse";
  createChallengeMutationFile = "./src/queries/create/create-challenge";
  createRelationMutationFile = "./src/queries/create/create-relation";
  createOrganisationMutationFile = "./src/queries/create/create-organisation";
  createTagsetOnProfileFile = "./src/queries/create-tagset-on-profile";
  addTagToTagsetFile = "./src/queries/add-tag-to-tagset";
  addChallengeLeadFile = "./src/queries/add-challenge-lead";
  createReferenceOnProfileFile = "./src/queries/create-reference-on-profile";
  createUserMutationFile = "./src/queries/create/create-user";
  createOpportunityMutationFile = "./src/queries/create/create-opportunity";
  createActorGroupMutationFile = "./src/queries/create/create-actor-group";
  createActorMutationFile = "./src/queries/create/create-actor";
  createAspectMutationFile = "./src/queries/create/create-aspect";
  replaceTagsOnTagsetFile = "./src/queries/replace-tags-on-tagset";
  updateEcoverseMutationFile = "./src/queries/update-ecoverse";
  updateOrganisationMutationFile = "./src/queries/update-organisation";
  userQueryFile = "./src/queries/user";
  updateProfileFile = "./src/queries/update-profile";

  // Load in + store some of the mutations / queries
  createChallengeMutationStr: string;
  createUserMutationStr: string;
  createGroupOnEcoverseMutationStr: string;
  addUserToGroupMutationStr: string;
  addTagToTagsetMutationStr: string;
  addUserToChallengeMutationStr: string;
  addChallengeLeadMutationStr: string;
  createTagsetOnProfileMutationStr: string;
  createReferenceOnProfileMutationStr: string;
  createOpportunityMutationStr: string;
  createActorGroupMutationStr: string;
  createActorMutationStr: string;
  createAspectMutationStr: string;
  createOrganisationMutationStr: string;
  createRelationMutationStr: string;
  replaceTagsOnTagsetMutationStr: string;
  userQueryStr: string;
  updateProfileStr: string;

  // Array of challenges info objects
  challengesInfoArray: ChallengeInfo[];

  // Array of challenges info objects
  groupsIdsMap;

  logger;
  profiler;

  // Create the ecoverse with enough defaults set/ members populated
  constructor(environmentConfig: EnvironmentConfig) {
    this.config = environmentConfig;

    // Set up the logging
    const logFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    );
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({ level: "info", format: logFormat }),
        new winston.transports.File({
          filename: "population-info.log",
          level: "warn",
        }),
        new winston.transports.File({
          filename: "population-warnings.log",
          level: "warn",
        }),
      ],
    });

    this.profiler = winston.createLogger({
      transports: [
        new winston.transports.Console({ level: "info", format: logFormat }),
        new winston.transports.File({
          filename: "profile-info.log",
          level: "silly",
        }),
      ],
    });

    this.ctClient = new CherrytwistClient(this.config.server, this.logger);
    this.client = new GraphQLClient(this.config.server);

    this.challengesInfoArray = [];
    this.groupsIdsMap = new Map();

    this.createUserMutationStr = fs
      .readFileSync(this.createUserMutationFile)
      .toString();

    this.createGroupOnEcoverseMutationStr = fs
      .readFileSync(this.createGroupOnEcoverseMutationFile)
      .toString();

    this.addUserToGroupMutationStr = fs
      .readFileSync(this.addUserToGroupMutationFile)
      .toString();

    this.addUserToChallengeMutationStr = fs
      .readFileSync(this.addUserToChallengeMutationFile)
      .toString();

    this.createTagsetOnProfileMutationStr = fs
      .readFileSync(this.createTagsetOnProfileFile)
      .toString();

    this.createReferenceOnProfileMutationStr = fs
      .readFileSync(this.createReferenceOnProfileFile)
      .toString();

    this.replaceTagsOnTagsetMutationStr = fs
      .readFileSync(this.replaceTagsOnTagsetFile)
      .toString();

    this.addTagToTagsetMutationStr = fs
      .readFileSync(this.addTagToTagsetFile)
      .toString();

    this.userQueryStr = fs.readFileSync(this.userQueryFile).toString();

    this.updateProfileStr = fs.readFileSync(this.updateProfileFile).toString();

    this.createChallengeMutationStr = fs
      .readFileSync(this.createChallengeMutationFile)
      .toString();

    this.createOpportunityMutationStr = fs
      .readFileSync(this.createOpportunityMutationFile)
      .toString();

    this.createActorGroupMutationStr = fs
      .readFileSync(this.createActorGroupMutationFile)
      .toString();

    this.createActorMutationStr = fs
      .readFileSync(this.createActorMutationFile)
      .toString();

    this.createAspectMutationStr = fs
      .readFileSync(this.createAspectMutationFile)
      .toString();

    this.createOrganisationMutationStr = fs
      .readFileSync(this.createOrganisationMutationFile)
      .toString();

    this.addChallengeLeadMutationStr = fs
      .readFileSync(this.addChallengeLeadFile)
      .toString();

    this.createRelationMutationStr = fs
      .readFileSync(this.createRelationMutationFile)
      .toString();
  }

  //
  async initialiseEcoverseData(): Promise<boolean> {
    // Get the challengesInfo and store into a dictionary
    this.challengesInfoArray = await this.getChallengesInfo();
    this.groupsIdsMap = await this.getGroupsInfo();
    return true;
  }

  // Populate using the specified json file
  async testConnection(): Promise<Boolean> {
    // Test can connect to the server
    const serverAvailable = await this.ctClient.testConnection();
    if (!serverAvailable) {
      throw new Error("Unable to connect, aborting...");
    }
    return true;
  }

  loadAdminToken() {
    const adminUserToken = fs.readFileSync(this.config.admin_token).toString();
    if (adminUserToken.length == 0)
      throw new Error(
        `Unable to load in admin user token from ${this.config.admin_token}`
      );
    this.logger.info(`Loaded admin user token ok`);
    // Set the auth header
    this.client.setHeader("Authorization", `Bearer ${adminUserToken}`);
    this.logger.info(`Bearer token:  ${adminUserToken}`);
  }

  

  async createOpportunity(challengeID: number, opportunityJson: any) {
    // create the variable for the group mutation
    const createOpportunityVariable = gql`
                  {
                    "challengeID": ${challengeID},
                    "opportunityData":
                    {
                        "name": "${opportunityJson.name}",
                        "textID": "${opportunityJson.textID}",
                        "context": {
                          "background": "${opportunityJson.problem}",
                          "vision": "${opportunityJson.pilot_goal}",
                          "tagline": "${opportunityJson.spotlight}",
                          "who": "${opportunityJson.polaris.un_sdg}",
                          "impact": "${opportunityJson.polaris.long_term_vision}",
                          "references": [
                            {
                              "name": "github",
                              "uri": "${opportunityJson.urls.github}",
                              "description": "make it buildable"
                            },
                            {
                              "name": "demo",
                              "uri": "${opportunityJson.urls.demo}",
                              "description": "make it understandable"
                            },
                            {
                              "name": "poster",
                              "uri": "${opportunityJson.images.poster}",
                              "description": "make it visual"
                            },
                            {
                              "name": "meme",
                              "uri": "${opportunityJson.images.meme}",
                              "description": "make it resonate"
                            }
                          ]
                        }
                    }
          }`;

    const response = await this.client.request(
      this.createOpportunityMutationStr,
      createOpportunityVariable
    );
    this.logger.verbose(
      `Created opportunity with name: ${response.createOpportunityOnChallenge.name}`
    );
    const opportunityID = response.createOpportunityOnChallenge.id;

    // Create actor groups
    const stakeholderAG = await this.createActorGroup(
      opportunityID,
      "stakeholders",
      "test"
    );
    const stakeholders = opportunityJson.stakeholders;
    for (let i = 0; i < stakeholders.length; i++) {
      const stakeholder = stakeholders[i];
      const stakeholderResponse = await this.createActor(
        stakeholderAG.createActorGroup.id,
        stakeholder.name,
        stakeholder.wins_how
      );
      this.logger.verbose(`${stakeholderResponse}`);
    }
    const keyUsersAG = await this.createActorGroup(
      opportunityID,
      "key_users",
      "test"
    );
    const keyUsers = opportunityJson.key_users;
    for (let i = 0; i < keyUsers.length; i++) {
      const keyUser = keyUsers[i];
      const keyUserResponse = await this.createActor(
        keyUsersAG.createActorGroup.id,
        keyUser.name,
        keyUser.wins_how
      );
      this.logger.verbose(`${keyUserResponse}`);
    }
    const collaboratorsAG = await this.createActorGroup(
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
      const aspectResponse = await this.createAspect(
        opportunityID,
        name,
        solution.question,
        solution.explanation
      );
      this.logger.verbose(`${aspectResponse.createAspect.title}`);
    }

    // Create the collaborations
    const outgoingRelations = opportunityJson.collaborations.outgoing;
    for (let i = 0; i < outgoingRelations.length; i++) {
      const relation = outgoingRelations[i];
      const response = await this.createRelation(
        opportunityID,
        "outgoing",
        relation.reason,
        "peer",
        "group",
        relation.team_name
      );
    }

    const incomingRelations = opportunityJson.collaborations.incoming;
    for (let i = 0; i < incomingRelations.length; i++) {
      const relation = incomingRelations[i];
      const response = await this.createRelation(
        opportunityID,
        "incoming",
        relation.reason,
        relation.role,
        relation.organization,
        relation.name
      );
    }

    this.logger.verbose(
      `Finished creating opportunity: ${response.createOpportunityOnChallenge.name}`
    );
  }

  escapeStrings(input: string): string {
    if (!input) return '';
    return input      
          .replace(/[\\]/g, '\\\\')
          .replace(/[\/]/g, '\\/')
          .replace(/[\b]/g, '\\b')
          .replace(/[\f]/g, '\\f')
          .replace(/[\n]/g, '\\n')
          .replace(/[\r]/g, '\\r')
          .replace(/[\t]/g, '\\t')
          .replace(/[\"]/g, '\\"')
          .replace(/\\'/g, "\\'"); 
  }

  async createOpportunity2(
    challengeID: number,
    opportunityJson: any,
    teamJson: any
  ) {
    //this.logger.error(`Impact context length: ${opportunityJson.polaris_long_term_vision.length}`);
    // create the variable for the group mutation
    const createOpportunityVariable = gql`
                  {
                    "challengeID": ${challengeID},
                    "opportunityData":
                    {
                        "name": "${teamJson.name}",
                        "textID": "team_${teamJson.ct_id}",
                        "context": {
                          "background": "${this.escapeStrings(teamJson.problem)}",
                          "vision": "${this.escapeStrings(teamJson.solution)}",
                          "tagline": "${this.escapeStrings(opportunityJson.spotlight)}",
                          "who": "${this.escapeStrings(opportunityJson.polaris_un_sdg)}",
                          "impact": "${this.escapeStrings(opportunityJson.polaris_long_term_vision)}",
                          "references": [
                            {
                              "name": "github",
                              "uri": "${teamJson.githubUrl}",
                              "description": "make it buildable"
                            },
                            {
                              "name": "demo",
                              "uri": "${teamJson.demoUrl}",
                              "description": "make it understandable"
                            },
                            {
                              "name": "poster",
                              "uri": "${teamJson.flagUrl}",
                              "description": "make it visual"
                            },
                            {
                              "name": "meme",
                              "uri": "${teamJson.memeUrl}",
                              "description": "make it resonate"
                            },
                            {
                              "name": "miroboard",
                              "uri": "${teamJson.miroboard}",
                              "description": "make it over seeable"
                            }
                          ]
                        }
                    }
          }`;

    let variableJson = null;
    const escapedStr = this.escapeStrings(createOpportunityVariable);
    try {
      variableJson = JSON.parse(createOpportunityVariable);
    } catch (e) {
      this.logger.error(`${e.message}`);
      this.logger.info(`before: ${createOpportunityVariable}`);
      this.logger.info(`after: ${escapedStr}`);
      return false;
    }
    const response = await this.client.request(
      this.createOpportunityMutationStr,
      JSON.stringify(variableJson)
    );
    this.logger.verbose(
      `Created opportunity with name: ${response.createOpportunityOnChallenge.name}`
    );
    const opportunityID = response.createOpportunityOnChallenge.id;

    // Create actor groups
    const stakeholderAG = await this.createActorGroup(
      opportunityID,
      "stakeholders",
      "test"
    );

    if (
      opportunityJson.stakeholder_1 &&
      opportunityJson.stakeholder_1.name.length > 0
    ) {
      await this.createActor(
        stakeholderAG.createActorGroup.id,
        opportunityJson.stakeholder_1.name,
        opportunityJson.stakeholder_1.wins_how
      );
    }
    if (
      opportunityJson.stakeholder_2 &&
      opportunityJson.stakeholder_2.name.length > 0
    ) {
      await this.createActor(
        stakeholderAG.createActorGroup.id,
        opportunityJson.stakeholder_2.name,
        opportunityJson.stakeholder_2.wins_how
      );
    }
    if (
      opportunityJson.stakeholder_3 &&
      opportunityJson.stakeholder_3.name.length > 0
    ) {
      await this.createActor(
        stakeholderAG.createActorGroup.id,
        opportunityJson.stakeholder_3.name,
        opportunityJson.stakeholder_3.wins_how
      );
    }

    const keyUsersAG = await this.createActorGroup(
      opportunityID,
      "key_users",
      "test"
    );
    const keyUsers = opportunityJson.key_users;
    if (
      opportunityJson.key_user_1 &&
      opportunityJson.key_user_1.name.length > 0
    ) {
      await this.createActor(
        keyUsersAG.createActorGroup.id,
        opportunityJson.key_user_1.name,
        opportunityJson.key_user_1.wins_how
      );
    }
    if (
      opportunityJson.key_user_1 &&
      opportunityJson.key_user_2.name.length > 0
    ) {
      await this.createActor(
        keyUsersAG.createActorGroup.id,
        opportunityJson.key_user_2.name,
        opportunityJson.key_user_2.wins_how
      );
    }
    if (
      opportunityJson.key_user_1 &&
      opportunityJson.key_user_3.name.length > 0
    ) {
      await this.createActor(
        keyUsersAG.createActorGroup.id,
        opportunityJson.key_user_3.name,
        opportunityJson.key_user_3.wins_how
      );
    }

    // const collaboratorsAG = await this.createActorGroup(
    //   opportunityID,
    //   "collaborations",
    //   "test"
    // );

    // Create the aspects
    var jp = require("jsonpath");
    var solutionsRoot = jp.query(opportunityJson, "$.solution_details");
    var solutions = solutionsRoot[0];
    const solutionAspectNames = Object.keys(solutions);
    for (let i = 0; i < solutionAspectNames.length; i++) {
      const name = solutionAspectNames[i];
      var solution = solutions[name];
      if (solution) {
        const aspectResponse = await this.createAspect(
          opportunityID,
          name,
          solution.question,
          solution.explanation
        );

        this.logger.verbose(`${aspectResponse.createAspect.title}`);
      }
    }

    // Create the collaborations
    // const outgoingRelations = opportunityJson.collaborations.outgoing;
    // for (let i = 0; i < outgoingRelations.length; i++) {
    //   const relation = outgoingRelations[i];
    //   const response = await this.createRelation(
    //     opportunityID,
    //     "outgoing",
    //     relation.reason,
    //     "peer",
    //     "group",
    //     relation.team_name
    //   );
    // }

    // const incomingRelations = opportunityJson.collaborations.incoming;
    // for (let i = 0; i < incomingRelations.length; i++) {
    //   const relation = incomingRelations[i];
    //   const response = await this.createRelation(
    //     opportunityID,
    //     "incoming",
    //     relation.reason,
    //     relation.role,
    //     relation.organization,
    //     relation.name
    //   );
    // }

    this.logger.verbose(
      `Finished creating opportunity: ${response.createOpportunityOnChallenge.name}`
    );
  }

  async addReference(
    refName: string,
    refURI: string,
    refDesc: string,
    userProfileID: string
  ): Promise<Boolean> {
    const createReferenceVariable = gql`
              {
    "profileID": ${userProfileID},
    "referenceInput":
                  {
                    "name": "${refName}",
                    "uri": "${refURI}",
                    "description": "${refDesc}"
                  }
    }`;
    const createReferenceResponse = await this.client.request(
      this.createReferenceOnProfileMutationStr,
      createReferenceVariable
    );

    this.logger.info(
      `...........added "${refName}" reference with the following URI: ${refURI}`
    );

    return true;
  }

  async updateUserProfile(
    userEmail: string,
    description: string,
    avatarURI: string
  ): Promise<Boolean> {
    const userVariable = gql`{"ID": "${userEmail}"}`;
    let profileID = "";
    let profileDesc = "";
    try {
      const getUserResponse = await this.client.request(
        this.userQueryStr,
        userVariable
      );
      profileID = getUserResponse.user.profile.id;
      profileDesc = getUserResponse.user.profile.description;
      this.logger.info(
        `...........got user with email "${userEmail}" with the following ID: ${getUserResponse.user.id}`
      );
    } catch (e) {
      this.logger.warn(`Unable to locate user: ${userEmail}`);
      return false;
    }
    await this.updateProfile(profileID, description, avatarURI);
    return true;
  }

  async updateProfile(
    profileID: string,
    description: string,
    avatarURI: string
  ): Promise<Boolean> {
    let profileDesc = "";
    try {
      // hacky: if an empty string is passed in then do not update the description field
      let descToUse = description;
      if (description && description.length == 0) {
        descToUse = profileDesc;
      }
      // get the users id
      const updateProfileVariable = gql`{
        "ID": ${profileID},
        "profileData": {
        "avatar": "${avatarURI}",
        "description": "${description}"
        }
      }`;
      const updateProfileResponse = await this.client.request(
        this.updateProfileStr,
        updateProfileVariable
      );
      this.logger.info(`...........updated avatar to be "${avatarURI}"`);

      return true;
    } catch (e) {
      this.logger.warn(`Unable to update profile: ${profileID} - ${e}`);
      return false;
    }
  }

  async addTagset(
    tagsStr: string,
    tagsetName: string,
    profileID: string
  ): Promise<Boolean> {
    if (tagsStr) {
      // Add the skills tagset
      const createTagsetVariable = gql`
                  {
                      "profileID": ${profileID},
                      "tagsetName": "${tagsetName}"
                  } `;
      const tagsetResponse = await this.client.request(
        this.createTagsetOnProfileMutationStr,
        createTagsetVariable
      );
      this.logger.info(`....created ${tagsetName} tagset`);

      // Now set the tags
      const tagsJSON = this.convertCsvToJson(tagsStr);
      const tagsetID = tagsetResponse.createTagsetOnProfile.id;
      const replaceTagsVariable = gql`
                  {
                      "tagsetID": ${tagsetID},
                       "tags": ${tagsJSON}
                  } `;

      const replaceTagsOnTagsetResponse = await this.client.request(
        this.replaceTagsOnTagsetMutationStr,
        replaceTagsVariable
      );
      this.logger.info(`...........added the following tags: ${tagsStr}`);
    }
    return true;
  }

  convertCsvToJson(tagsCsv: string): string {
    var tagsArr = tagsCsv.split(",");
    const tagsJSON = JSON.stringify(tagsArr);
    return tagsJSON;
  }

  async addUserToGroup(userID: string, groupID: string): Promise<Boolean> {
    let success = false;
    const addUserToGroupVariable = gql`
              {
                "userID": ${userID},
                "groupID": ${groupID}
                  
              }`;
    try {
      success = await this.client.request(
        this.addUserToGroupMutationStr,
        addUserToGroupVariable
      );
      this.logger.info("added user to group");
    } catch (e) {
      this.logger.error(`Unable to add user to group ${groupID}: ${e}`);
    }
    if (!success)
      this.logger.warn(`Unable to add user (${userID} to group (${groupID}))`);
    return success;
  }

  async addUserToTeam(teamName: string, userID: string): Promise<Boolean> {
    const groupID = teamName;
    // Get the right group ID
    const addUserToGroupVariable = gql`
              {
                "userID": ${userID},
                "groupID": ${groupID}
                  
              }`;
    const groupResponse = await this.client.request(
      this.addUserToGroupMutationStr,
      addUserToGroupVariable
    );
    return true;
  }

  lookupChallengeID(challengeName: string): ChallengeInfo | undefined {
    const challengeNameLC = challengeName.toLowerCase();

    const challengeInfo = this.challengesInfoArray.find(
      (challenge) =>
        challenge.name.toLowerCase() === challengeName.toLowerCase()
    );
    if (!challengeInfo) {
      // No match found
      this.logger.error(
        `Not able to identify specified challenge: ${challengeName}`
      );
      return;
    }
    return challengeInfo;
  }

  async addUserToChallenge(
    challengeName: string,
    userID: string
  ): Promise<Boolean> {
    const challengeInfo = this.lookupChallengeID(challengeName);
    if (!challengeInfo) return false;
    const addUserToChallengeVariable = gql`
              {
                "userID": ${userID},
                "challengeID": ${challengeInfo.challengeID}      
              }`;

    const groupResponse = await this.client.request(
      this.addUserToChallengeMutationStr,
      addUserToChallengeVariable
    );

    if (groupResponse) {
      this.logger.info(`....added user to challenge: ${challengeName}`);
    }

    return true;
  }

  async addChallengeLead(
    challengeName: string,
    organisationID: string
  ): Promise<Boolean> {
    const challengeInfo = this.lookupChallengeID(challengeName);
    if (!challengeInfo) return false;
    const variable = gql`
              {
                "organisationID": ${organisationID},
                "challengeID": ${challengeInfo.challengeID}                     
              }`;

    const challengeResponse = await this.client.request(
      this.addChallengeLeadMutationStr,
      variable
    );

    if (challengeResponse) {
      this.logger.info(`....added lead to challenge: ${challengeName}`);
    }

    return true;
  }

  // Set the ecoverse context
  async updateEcoverseContext(variableFile: string): Promise<Boolean> {
    const updateEcoverseMutationStr = fs
      .readFileSync(this.updateEcoverseMutationFile)
      .toString();
    const variable = fs.readFileSync(variableFile).toString();

    try {
      const result = await this.client.request(
        updateEcoverseMutationStr,
        variable
      );
      if (result) {
        this.logger.info(`==> Update of ecoverse data completed successfully!`);
      }
    } catch (e) {
      this.logger.info(`Could not create structure: ${e} `);
      return false;
    }
    return true;
  }

  // Create a gouup at the ecoverse level with the given name
  async addTagToTagset(tagsetID: string, tagName: string): Promise<Boolean> {
    // create the variable for the group mutation
    const addTagToTagsetVariable = gql`
          {
             "tagsetID": ${tagsetID},
            "tag": "${tagName}"
          }`;

    await this.client.request(
      this.addTagToTagsetMutationStr,
      addTagToTagsetVariable
    );
    this.logger.info(`...........and added the "${tagName}" tag`);
    return true;
  }

  // Create a relation for the given opportunity
  async createRelation(
    opportunityID: number,
    type: string,
    description: string,
    actorRole: string,
    actorType: string,
    actorName: string
  ): Promise<any> {
    // create the variable for the group mutation
    const createRelationVariable = gql`
                  {
                    "opportunityID": ${opportunityID},
                    "relationData":
                      {
                        "type": "${type}",
                        "description": "${description}",
                        "actorName": "${actorName}",
                        "actorType": "${actorType}",
                        "actorRole": "${actorRole}"
                      }
          }`;

    const createRelationResponse = await this.client.request(
      this.createRelationMutationStr,
      createRelationVariable
    );
    this.logger.info(
      `...........and added the following relation: ${type} - ${actorName}`
    );
    return createRelationResponse;
  }

  // Create a actorgroup for the given opportunity
  async createActorGroup(
    opportunityID: number,
    actorGroupName: string,
    description: string
  ): Promise<any> {
    // create the variable for the group mutation
    const createActorGroupVariable = gql`
                  {
                    "opportunityID": ${opportunityID},
                    "actorGroupData":
                    {
                        "name": "${actorGroupName}",
                        "description": "${description}"
                    }
          }`;

    const createActorGroupResponse = await this.client.request(
      this.createActorGroupMutationStr,
      createActorGroupVariable
    );
    this.logger.info(
      `...........and added the following actor group: ${actorGroupName}`
    );
    return createActorGroupResponse;
  }

  // Create a actorgroup for the given opportunity
  async createActor(
    actorGroupID: number,
    actorName: string,
    description: string
  ): Promise<any> {
    // create the variable for the group mutation
    const createActorVariable = gql`
                  {
                    "actorGroupID": ${actorGroupID},
                    "actorData":
                    {
                        "name": "${actorName}",
                        "description": "${description}",
                        "value": "Ensuring a robust design",
                        "impact": "Time allocated to work on the solution"
                    }
          }`;

    const createActorResponse = await this.client.request(
      this.createActorMutationStr,
      createActorVariable
    );
    this.logger.info(`...........and added the following actor : ${actorName}`);
    return createActorResponse;
  }

  // Create a aspect for the given opportunity
  async createAspect(
    opportunityID: number,
    title: string,
    framing: string,
    explanation: string
  ): Promise<any> {
    // create the variable for the group mutation
    //this.logger.error(`Framing length: ${framing.length}`);
    const createAspectVariable = gql`
                  {
                    "opportunityID": ${opportunityID},
                    "aspectData":
                    {
                      "title": "${title}",
                      "framing": "${framing}",
                      "explanation": "${explanation}"                    
                    }
          }`;

    const createAspectResponse = await this.client.request(
      this.createAspectMutationStr,
      createAspectVariable
    );
    this.logger.info(`...........and added the following aspect : ${title}`);
    return createAspectResponse;
  }

  // Create a gouup at the ecoverse level with the given name
  async createEcoverseGroup(groupName: string): Promise<any> {
    // create the variable for the group mutation
    const createGroupVariable = gql`
                  {
                    "groupName": "${groupName}"
                  }`;

    const createGroupResponse = await this.client.request(
      this.createGroupOnEcoverseMutationStr,
      createGroupVariable
    );
    this.logger.info(`...........and added the following group: ${groupName}`);
    return createGroupResponse;
  }

  // Load in mutations file
  async createChallenges(variablesDir: string): Promise<Boolean> {
    try {
      const result = await this.ctClient.submitSingleMutations(
        this.createChallengeMutationFile,
        variablesDir,
        "challenge"
      );
      if (result) {
        this.logger.info(`==> Created challenges successfully!`);
      }
    } catch (e) {
      this.logger.error(`Could not create challenges: ${e} `);
      throw new Error("Aborting");
    }
    return true;
  }

  // Load in mutations file
  async createOrganisations(): Promise<Boolean> {
    const variablesDir = "./src/data/organisations";
    try {
      const result = await this.ctClient.submitSingleMutations(
        this.createOrganisationMutationFile,
        variablesDir,
        "organisation"
      );
      if (result) {
        this.logger.info(`==> Created organisations successfully!`);
      }
    } catch (e) {
      this.logger.error(`Could not create organisations: ${e} `);
      return false;
    }
    return true;
  }

  // Load in mutations file
  async updateHostOrganisation(variableFile: string): Promise<Boolean> {
    const variable = fs.readFileSync(variableFile).toString();
    const updateOrganisationMutationStr = fs
      .readFileSync(this.updateOrganisationMutationFile)
      .toString();
    try {
      const result = await this.client.request(
        updateOrganisationMutationStr,
        variable
      );
      if (result) {
        this.logger.info(`==> Updated host organisation successfully!`);
      }
    } catch (e) {
      this.logger.info(`Could not create organisations: ${e} `);
      return false;
    }
    return true;
  }

  // Load in mutations file
  async createUsers(variablesDir: string): Promise<Boolean> {
    try {
      const result = await this.ctClient.submitSingleMutations(
        this.createUserMutationFile,
        variablesDir,
        "user"
      );
      if (result) {
        this.logger.info(`==> Added users successfully!`);
      }
    } catch (e) {
      this.logger.info(`Could not create users: ${e} `);
      return false;
    }
    return true;
  }

  async getChallengesInfo(): Promise<ChallengeInfo[]> {
    ////////////////////////////////////////////////////////
    //
    const challengesInfoArray: ChallengeInfo[] = [];
    const challengesQuery = gql`
      {
        name
        challenges {
          id
          name
          groups {
            id
            name
          }
        }
      }
    `;

    this.logger.info(`Loading challenges from server: ${this.config.server}`);
    const ecoverseIdentifiersData = await this.client.request(challengesQuery);
    var ecoverseName = ecoverseIdentifiersData.name;
    if (!ecoverseName) {
      this.logger.error(`Unable to execute challenges query`);
      throw new Error("Unable to execute challenges query");
    }
    try {
      const challengesCount = ecoverseIdentifiersData.challenges.length;
      this.logger.info(`...loaded challenges ok: ${challengesCount}`);
      for (var i = 0; i < challengesCount; i++) {
        const challenge = ecoverseIdentifiersData.challenges[i];
        const challengeName: string = challenge.name;
        const challengeInfo = new ChallengeInfo(challengeName);
        challengeInfo.challengeID = challenge.id;

        // Save the members group ID
        var challengeGroups = challenge.groups;
        for (var j = 0; j < challengeGroups.length; j++) {
          const group = challengeGroups[j];
          if (group.name === "members") {
            const groupID = group.id;
            //this.logger.info(`...located members group id: ${groupID} `);
            challengeInfo.membersGroupID = groupID;
          }
        }
        challengesInfoArray.push(challengeInfo);

        this.logger.info(
          `...challenge name: ${challengeName} ==> ${challengeInfo.ecoverseID} `
        );
      }
    } catch (e) {
      this.logger.error(
        `Could not convert information from challenges query: ${e} `
      );
      throw new Error("Unable to parse challenges");
    }
    this.logger.info(
      `==================== end ChallengesInfo ====================== `
    );
    this.logger.info(` `);
    return challengesInfoArray;
  }

  async getGroupsInfo(): Promise<Map<any, any>> {
    ////////////////////////////////////////////////////////
    //

    const groupsMap = new Map();
    const groupsQuery = gql`
      {
        name
        groups {
          id
          name
        }
        groupsWithTag(tag: "Team") {
          id
          name
        }
      }
    `;

    this.logger.info(`Loading groups from server: ${this.config.server}`);
    const groupsData = await this.client.request(groupsQuery);
    var ecoverseName = groupsData.name;
    if (!ecoverseName) {
      this.logger.error(`Unable to execute groups query`);
      throw new Error("Unable to execute groups query");
    }
    try {
      const groupsCount = groupsData.groups.length;
      this.logger.info(`...loaded groups ok: ${groupsCount}`);
      for (var i = 0; i < groupsCount; i++) {
        const groupData = groupsData.groups[i];
        groupsMap.set(groupData.name, groupData.id);
        const groupName: string = groupData.name;

        this.logger.info(
          `...group name: ${groupData.name} ==> ${groupData.id} `
        );
      }
      const teamsCount = groupsData.groupsWithTag.length;
      this.logger.info(`...number of teams: ${teamsCount}`);
    } catch (e) {
      this.logger.error(
        `Could not convert information from groups query: ${e} `
      );
      throw new Error("Unable to parse groups");
    }
    this.logger.info(
      `==================== end GroupsInfo ====================== `
    );
    this.logger.info(` `);
    return groupsMap;
  }
}

export class ChallengeInfo {
  ecoverseID: string = "";
  challengeID = "";
  name: string = "";
  membersGroupID = "";

  constructor(challengeName: string) {
    this.name = challengeName;
  }
}
