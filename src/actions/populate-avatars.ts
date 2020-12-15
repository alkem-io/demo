import { CherrytwistClient } from 'cherrytwist-lib';
import { createLogger } from 'cherrytwist-populator';
import { assert } from 'console';
import { AvatarPopulator } from '../populators/avatar-populator';

export const populateAvatars = async (server: string) => {
  assert(server, 'Server url not provided!');

  const logger = createLogger();

  const client = new CherrytwistClient({
    graphqlEndpoint: server,
  });

  logger.info(`Cherrytwist server: ${server}`);

  const populator = new AvatarPopulator(client);
  populator.populate();
};
