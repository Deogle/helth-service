import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import * as fs from "fs";

type SecretConfig = {
  [key: string]: {
    labels: {
      [key: string]: string;
    };
    data: string;
  };
};

async function createSecretVersion(
  client: SecretManagerServiceClient,
  secretName: string,
  payload: string
) {
  return client.addSecretVersion({
    parent: secretName,
    payload: {
      data: Buffer.from(payload, "utf8"),
    },
  });
}

async function loadSecrets() {
  const [, , projectId, secretsFile] = process.argv;
  try {
    // Load the secrets from the JSON file
    const secrets: SecretConfig = JSON.parse(
      fs.readFileSync(secretsFile, "utf8")
    );

    if (!projectId) {
      console.error("Project id is required");
      return;
    }

    // Create a Secret Manager client
    const client = new SecretManagerServiceClient();

    // Iterate over the secrets and create or update them in Secret Manager
    for (const [key, value] of Object.entries(secrets)) {
      console.log(`Creating secret '${key}' in project '${projectId}'`);
      try {
        await client.createSecret({
          parent: `projects/${projectId}`,
          secretId: key,
          secret: {
            replication: {
              automatic: {},
            },
            labels: value.labels,
          },
        });
      } catch (error: any) {
        if (error.code !== 6) {
          throw error;
        }
        console.log(`Secret already exists. Creating a new version...`, {
          key,
        });
      }
      createSecretVersion(
        client,
        `projects/${projectId}/secrets/${key}`,
        value.data
      );
      console.log(`Secret '${key}' created or updated.`);
    }

    console.log("All secrets loaded successfully.");
  } catch (error) {
    console.error("Error loading secrets:", error);
  }
}

loadSecrets();
