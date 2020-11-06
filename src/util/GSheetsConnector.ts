import fs from "fs";
import readline from "readline";
import { google, sheets_v4 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

export class GSheetsConnector {
  sheetsObj?: sheets_v4.Sheets;
  credentialPath = "";
  tokenPath = "";
  spreadsheetID: string = "";

  constructor(credentialPath: string, tokenPath: string, spreadsheetID: string) {
    this.spreadsheetID = spreadsheetID;
    this.credentialPath = credentialPath;
    this.tokenPath = tokenPath;
  }

  async getSheetsObj() {
    const cred = JSON.parse(fs.readFileSync(this.credentialPath, "utf8"));
    const auth = await this.authorize(cred);
    this.sheetsObj = google.sheets({ version: "v4", auth });
    return this.sheetsObj;
  }

  async getArray(spreadsheetId: string, range: string): Promise<any[][]> {
    return (await new Promise((resolve, reject) => {
      this.sheetsObj?.spreadsheets.values.get(
        { spreadsheetId, range },
        (err: any, res: any) => (err ? reject(err) : resolve(res.data.values))
      );
    })) as any[][];
  }

  async getObjectArray(range: string): Promise<any[]> {
    return GSheetsConnector.toObjectArray(
      await this.getArray(this.spreadsheetID, range)
    );
  }

  static toObjectArray(array: any[][]): any[] {
    const header = array.splice(0, 1)[0];
    const output = [] as any[];

    array.forEach((el) => {
      const entry = {} as any;
      header.forEach((h, i) => {
        entry[h] = el[i] ? el[i] : undefined;
      });
      output.push(entry);
    });

    return output;
  }

  async authorize(cred: any): Promise<OAuth2Client> {
    const { client_secret, client_id, redirect_uris } = cred.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    try {
      const token = JSON.parse(fs.readFileSync(this.tokenPath, "utf8"));
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    } catch (e) {
      return await this.getNewToken(oAuth2Client);
    }
  }

  async getNewToken(oAuth2Client: OAuth2Client): Promise<OAuth2Client> {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    console.log("Authorize this app by visiting this url: ", authUrl);

    return (await new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("Enter the code from that page here: ", (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          reject(err);
          if (!token) {
            reject();
          }
          oAuth2Client.setCredentials(token!);

          fs.writeFileSync(this.tokenPath, JSON.stringify(token));

          resolve(oAuth2Client);
        });
      });
    })) as OAuth2Client;
  }
}
