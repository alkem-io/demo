import { createLogger } from './util/create-logger';
import { EnvironmentFactory } from "./util/EnvironmentFactory";

const main = async () => {
  const logger = createLogger();

  ////////// First connect to the ecoverse //////////////////
  const environmentConfig = EnvironmentFactory.getEnvironmentConfig();
  const client = new EcoversePopulator(environmentConfig);
  // client.loadAdminToken();

  // Get all the users from the server
  let users = [];
  try {
    const usersQuery = `query {
      users {
        name, id, email, firstName, lastName, accountUpn, profile {
          avatar,
          description,
          references {
            name, uri, id
          }
        }
      }
    }`;
    const usersResponse = await client.client.request(usersQuery);
    if (!usersResponse.users) throw new Error("Unable to load users");
    users = usersResponse.users;
    const usersCount = users.length;
    logger.info(`....downloaded ${usersCount} users`);
  } catch (e) {
    logger.error(`Unable to obtain users: ${e}`);
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
        logger.info(`Found an undefined ref: ${referenceUndefinedLinkedIn.name} - ${referenceUndefinedLinkedIn.uri} - ${referenceUndefinedLinkedIn.id}`);
        const removeRefQuery = `mutation {
          removeReference(ID: ${referenceUndefinedLinkedIn.id})
        }`;
        const usersResponse = await client.client.request(removeRefQuery);
      }

    } catch (e) {
      logger.error(`Unable to process user (${i}): ${e}`);
    }
  }
};

try {
  main();
} catch (error) {
  console.error(error);
}
