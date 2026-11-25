// Lambda entry point. Wires the tested core to its AWS dependencies.
import { readFileSync } from 'node:fs';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { createHandler } from './core.mjs';

const ssm = new SSMClient({});
let apiKey;

// The OpenAI key lives in SSM Parameter Store as a SecureString. It is fetched
// once per container and cached; a failed lookup is not cached.
function getApiKey() {
  apiKey ??= ssm
    .send(new GetParameterCommand({ Name: process.env.OPENAI_KEY_PARAMETER, WithDecryption: true }))
    .then((result) => result.Parameter.Value)
    .catch((error) => {
      apiKey = undefined;
      throw error;
    });
  return apiKey;
}

export const handler = createHandler({
  getApiKey,
  profile: readFileSync(new URL('./profile.md', import.meta.url), 'utf8'),
  model: process.env.OPENAI_MODEL,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean),
});
