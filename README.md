## This is the Hobby Hub Development Repository for CS 3560 at Ohio University

Hobby Hub is a welcoming online space for hobbyists. Content is promoted on popularity and user interests, driven via tags.

# Contributors:

- Collin Blumenauer
- James Sparks

## Getting Started
### PROJECT SETUP / UPDATING
Run ```npm start``` in the repository root to install/update any dependencies.

Create a .env file (and make sure it is NEVER included in commits)

### OPENAI MODERATION
Go to platform.openai.com, and create a new API key with Moderation privileges.

Then, paste this key into your .env file as: 

```OPENAI_API_KEY="<api-key-here"```

### NEONDB
Go to neondb, and create an account.

Create a new project with postgresql, and click "Connect".

Then, paste the connections tring into your .env file as 

```DATABASE_URL="<connection-string>"```

## STARTING A DEVELOPMENT SERVER

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see results.

## RUNNING TESTS

Make sure API keys are valid, then run ```npx jest```
