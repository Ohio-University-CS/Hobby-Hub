## This is the Hobby Hub Development Repository for CS 3560 at Ohio University

### Contributors/Roles:
- Collin Blumenauer - Development, Database Management, Deployment
- James Sparks - Design, Testing, Hosting

## [Hobby Hub](https://hobbyhub.24sparja.com/) is a welcoming online space for hobbyists. Content is promoted on popularity and user interests.

## Walkthrough:

On page open, you will be sent to a landing page with the option to login or explore.
Exploring, let's you search for interests and content you want, without an account.

If you create an account, you can save your interests and choose them from your profile.
Then, there will be an "interests" tab at the top of the screen, which will show relevant posts from your profile's interests.

If you have an account, you can also manage posts and create new ones!

Post body can be created with markdown, and you assign relevant interests based on the content you wish to publish.
Posts can have media attachments and will be displayed as a zoomable carousel.

Moderation of post content is done through OpenAI.

### Features:
- Post Creation / Editing
- Post Media and Markdown Body
- Post Interactions - Likes / Views
- Profile Management - Delete Account, Profile Picture, User Body, Interests
- Interest-based feed filtering for user interests discoverability.
- Markdown Sanitization to prevent HTML exploits.
- AI-based moderation for recognizing sexual and discriminatory content in images and content.
- Account Login / Register / Delete

### Coming soon:
- Nightshade integration to prevent AI theft.
- AI defense robots.txt and cloudflare zero-trust, maze.
- Communities
- Comments

### Known Issues:
- Post thumbnails are not downscaled, meaning bandwidth is high. - Will be fixed sooon.
- No Reset Password, 2FA, or Email Verification - Will be fixed soon.

## Demonstration:

### Examples:
### [Demonstration on Youtube, Quick Rundown](https://youtu.be/1FKUi9XvZ80)

[Cat Post on HobbyHub](https://hobbyhub.24sparja.com/posts/789c1f4f-0fde-4349-bf52-8d05dc1432cc?url=1)

[Technical Post on HobbyHub](https://hobbyhub.24sparja.com/posts/cf9fd323-4581-4e86-8961-020e998763c3?url=4)

<img width="920" height="605" alt="ProfilePanel" src="https://github.com/user-attachments/assets/0cec0801-f052-48a2-9832-3701ce59803e" />
<img width="940" height="614" alt="InterestsPanel" src="https://github.com/user-attachments/assets/0d86730c-cc88-4520-8bd7-481649ad0315" />
<img width="925" height="635" alt="ExplorePanel" src="https://github.com/user-attachments/assets/8ccc4155-ad34-473a-9473-34eebecf96c2" />
<img width="916" height="622" alt="ScreenshotExample-Post" src="https://github.com/user-attachments/assets/5e20bacf-dcc8-4bd0-b893-f47841d19b13" />
<img width="919" height="643" alt="PostManagementPanel" src="https://github.com/user-attachments/assets/8009f2ee-aaae-4e5c-a084-9d7b69d580b6" />

## Development: Getting Started
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

### STARTING A DEVELOPMENT SERVER

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see results.

### RUNNING TESTS

Make sure API keys are valid, then run ```npx jest```
