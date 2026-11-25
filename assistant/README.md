# Assistant backend

A single AWS Lambda behind a Function URL. The site posts a short conversation to it; it adds a system prompt
built from `profile.md`, calls OpenAI, and returns the reply. The browser never sees the API key.

```
Browser ──POST {messages}──▶ Lambda Function URL ──▶ OpenAI
                                   │
                                   └─ reads the API key from SSM Parameter Store (SecureString)
```

## Guard rails

- **Grounding.** The model is told to answer only from `profile.md` and to say when it doesn't know. Nothing in the
  prompt is secret: it contains the same facts as the public resume.
- **Input limits.** At most 12 messages of 600 characters each. Only `role` and `content` are forwarded; the model
  and token cap are set server-side.
- **Origin check and CORS.** Only the origins in `AllowedOrigins` are served.
- **Rate limit.** 12 requests per IP per 5 minutes, held in memory per Lambda instance. It slows casual abuse; it
  is not a hard guarantee.
- **Cost ceiling.** Reserved concurrency of 2 and an 800-token output cap. Set a monthly budget on the OpenAI
  project as the real backstop.

## Deploy

Needs the AWS CLI and the SAM CLI, with credentials for the target account.

1. Store the OpenAI key (create a dedicated project key with a spending limit):

   ```sh
   aws ssm put-parameter \
     --name /portfolio-assistant/openai-api-key \
     --type SecureString \
     --value "<your key>"
   ```

2. Build and deploy:

   ```sh
   cd assistant
   sam build
   sam deploy --guided --stack-name portfolio-assistant
   ```

   Accept the defaults, or override `OpenAiModel` with a current small model. SAM will ask you to confirm that the
   Function URL has no authentication; that is intended, since browsers call it directly.

3. Copy the `AssistantUrl` output. On GitHub: Settings → Secrets and variables → Actions → Variables → add
   `ASSISTANT_URL` with that value. Re-run the deploy workflow.

For local development, deploy with `AllowedOrigins=https://ktodoran.github.io,http://localhost:5173` and start Vite
with `VITE_ASSISTANT_URL=<url> npm run dev`.

## Test

```sh
npm test    # from the repository root
```

`core.mjs` holds all request handling and has no AWS imports, so the tests run with plain Node. `handler.mjs` only
wires it to SSM.

## Remove

```sh
sam delete --stack-name portfolio-assistant
aws ssm delete-parameter --name /portfolio-assistant/openai-api-key
```
