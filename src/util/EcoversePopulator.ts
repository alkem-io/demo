import { CherrytwistClient } from "cherrytwist-lib";
import { GraphQLClient, gql } from "graphql-request";
import fs from "fs";
const winston = require("winston");

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
  ecoverseEndpoint: string;

  // The CT client
  ctClient: CherrytwistClient;

  // The generic GraphQL client
  client: GraphQLClient;

  // The various query / mutation definitions
  addUserToGroupMutationFile = "./src/queries/add-user-to-group";
  addUserToChallengeMutationFile = "./src/queries/add-user-to-challenge";
  createGroupOnEcoverseMutationFile = "./src/queries/create-group-on-ecoverse";
  createChallengeMutationFile = "./src/queries/create-challenge";
  createOrganisationMutationFile = "./src/queries/create-organisation";
  createTagsetOnProfileFile = "./src/queries/create-tagset-on-profile";
  addTagToTagsetFile = "./src/queries/add-tag-to-tagset";
  createReferenceOnProfileFile = "./src/queries/create-reference-on-profile";
  createUserMutationFile = "./src/queries/create-user";
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
  createTagsetOnProfileMutationStr: string;
  createReferenceOnProfileMutationStr: string;
  createOpportunityMutationStr: string;
  createActorGroupMutationStr: string;
  createActorMutationStr: string;
  createAspectMutationStr: string;
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
  constructor(endPoint: string) {
    this.ecoverseEndpoint = endPoint;

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

    this.ctClient = new CherrytwistClient(this.ecoverseEndpoint, this.logger);
    this.client = new GraphQLClient(this.ecoverseEndpoint);

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

  async updateProfile(
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
    try {
      // hacky: if an empty string is passed in then do not update the description field
      let descToUse = description;
      if (description.length == 0) {
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
      this.logger.warn(
        `Unable to update profile for user: ${userEmail} - ${e}`
      );
      return false;
    }
  }

  async addTagset(
    tagsStr: string,
    tagsetName: string,
    userProfileID: string
  ): Promise<Boolean> {
    if (tagsStr) {
      var tagsArr = tagsStr.split(",");
      if (tagsArr.length == 0) {
        // Empty set of tags, just return
        return true;
      }
      // Add the skills tagset
      const createTagsetVariable = gql`
                  {
                      "profileID": ${userProfileID},
                      "tagsetName": "${tagsetName}"
                  } `;
      const tagsetResponse = await this.client.request(
        this.createTagsetOnProfileMutationStr,
        createTagsetVariable
      );
      this.logger.info(`....created ${tagsetName} tagset`);

      // Now set the tags
      const tagsJSON = JSON.stringify(tagsArr);
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

  async addUserToChallenge(
    challengeName: string,
    userID: string
  ): Promise<Boolean> {
    let challengeInfoMatch: ChallengeInfo = new ChallengeInfo("");
    const challengeNameLC = challengeName.toLowerCase();

    let index = -1;
    for (const challengeInfo of this.challengesInfoArray) {
      const name = challengeInfo.name.toLowerCase();
      if (challengeNameLC === name) {
        // found the match
        challengeInfoMatch = challengeInfo;
        break;
      }
    }
    if (challengeInfoMatch.name === "") {
      // No match found
      this.logger.error(
        `Not able to identify specified challenge: ${challengeName}`
      );
      return false;
    }
    const addUserToChallengeVariable = gql`
              {
                "userID": ${userID},
                "challengeID": ${challengeInfoMatch.challengeID}      
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

  // Create a gouup at the ecoverse level with the given name
  async createOpportuntiy(
    challengeID: number,
    opportunityName: string,
    opportunityTextID: string
  ): Promise<any> {
    // create the variable for the group mutation
    const createOpportunityVariable = gql`
                  {
                    "challengeID": ${challengeID},
                    "opportunityData":
                    {
                        "name": "${opportunityName}",
                        "textID": "${opportunityTextID}"
                    }
          }`;

    const createOpportunityResponse = await this.client.request(
      this.createOpportunityMutationStr,
      createOpportunityVariable
    );
    this.logger.info(
      `...........and added the following opportunity: ${opportunityName}`
    );
    return createOpportunityResponse;
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

    this.logger.info(
      `Loading challenges from server: ${this.ecoverseEndpoint}`
    );
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

    this.logger.info(`Loading groups from server: ${this.ecoverseEndpoint}`);
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
