const fs = require("fs");

export class EnvironmentConfig {
  name = "";
  server = "";
  gsheet = "";
  users_sheet = "";
  admin_token = "";
  populate_structure = false;
  google_credentials = "secrets/credentials.json";
  google_token = "secrets/token.json";
}

export class EnvironmentFactory {
  static getEnvironmentConfig(): EnvironmentConfig {
    require("dotenv").config();
    const environmentsFile = process.env.CT_ENVIRONMENT_DEFINITIONS;
    if (!environmentsFile)
      throw new Error("CT_ENVIRONMENT_DEFINTIONS enironment variable not set");

    const environmentVar = process.env.CT_ENVIRONMENT;
    if (!environmentVar)
      throw new Error("CT_ENVIRONMENT enironment variable not set");

    // get the server endpoint
    const environmentsStr = fs.readFileSync(environmentsFile).toString();
    const environmentsJson = JSON.parse(environmentsStr);
    let environmentJson = undefined;
    if (environmentVar === "local") {
      environmentJson = environmentsJson.local;
    } else if (environmentVar === "local_odyssey") {
      environmentJson = environmentsJson.local_odyssey;
    } else if (environmentVar === "acc_odyssey") {
      environmentJson = environmentsJson.acc_odyssey;
    } else {
      throw new Error("Not supported environment encountered");
    }
    const environment = new EnvironmentConfig();
    environmentJson.name = environmentVar;
    environment.server = environmentJson.server;
    environment.gsheet = environmentJson.gsheet;
    environment.users_sheet = environmentJson.users_sheet;
    environment.admin_token = environmentJson.admin_token;
    environment.populate_structure = environmentJson.populate_structure;
    return environment;
  }
}
