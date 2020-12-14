import { CherrytwistClient } from 'cherrytwist-lib';
import { createLogger } from 'cherrytwist-populator';
import { EnvironmentFactory } from '../util/EnvironmentFactory';
import { MomentumApi } from '../util/http/momentum.api';

const main = async () => {
  const logger = createLogger();

  const config = EnvironmentFactory.getEnvironmentConfig();
  const client = new CherrytwistClient({
    graphqlEndpoint: config.server,
  });

  logger.info(`Cherrytwist server: ${config.server}`);

  // Get the momentum teams


};

try {
  main();
} catch (error) {
  console.error(error);
}

