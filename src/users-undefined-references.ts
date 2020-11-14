import { EcoversePopulator } from "./util/EcoversePopulator";
import generator from "generate-password";
import { EnvironmentFactory } from "./util/EnvironmentFactory";
import { env } from "process";
import { GSheetsConnector } from "./util/GSheetsConnector";

const main = async () => {
  require("dotenv").config();
  const fs = require("fs");

  ////////// First connect to the ecoverse //////////////////
  const environmentConfig = EnvironmentFactory.getEnvironmentConfig();
  const populator = new EcoversePopulator(environmentConfig);
  populator.loadAdminToken();

  // Get all the users from the server
  let users = [];
  try {
    const usersQuery = `query { 
      users { 
        name, id, email, firstName, lastName, accountUpn, profile { 
          references {
            name, uri, id
          }
        }
      }
    }`;
    const usersResponse = await populator.client.request(usersQuery);
    if (!usersResponse.users) throw new Error("Unable to load users");
    users = usersResponse.users;
    const usersCount = users.length;
    populator.logger.info(`....downloaded ${usersCount} users`);
  } catch (e) {
    populator.logger.error(`Unable to obtain users: ${e}`);
  }

  const accountsInfoArray = [];
  let matches = 0;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    try {
      // check if default avatar, in which case do nothing
      const references = user.profile.references;
      const referenceUndefinedLinkedIn = references.find((reference: { name: string; uri: string; }) => (reference.name === "LinkedIn" && reference.uri === "undefined"));
      if (referenceUndefinedLinkedIn) {
        populator.logger.info(`Found an undefined ref: ${referenceUndefinedLinkedIn.name} - ${referenceUndefinedLinkedIn.uri} - ${referenceUndefinedLinkedIn.id}`);
        const removeRefQuery = `mutation { 
          removeReference(ID: ${referenceUndefinedLinkedIn.id}) 
        }`;
        const usersResponse = await populator.client.request(removeRefQuery); 
      }

    } catch (e) {
      populator.logger.error(`Unable to process user (${i}): ${e}`);
    }
  }
};

try {
  main();
} catch (error) {
  console.error(error);
}
