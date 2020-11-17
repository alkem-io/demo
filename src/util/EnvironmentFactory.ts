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
    const environment = this.getEnvironment(environmentsJson, environmentVar); 

    return environment;
  }

  static getEnvironment(environments: any, env: string): EnvironmentConfig
  {
    const targetEnv = environments[env];
    if(targetEnv) 
      return targetEnv as EnvironmentConfig;

    throw new Error("Not supported environment encountered");
  }
}
