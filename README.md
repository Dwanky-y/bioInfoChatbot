# Bioinformatics Chatbot -- made with React.js

## Installation (2025-02-12 version)

1. Clone the git repository

```
git clone https://github.com/Dwanky-y/bioInfoChatbot.git
```

2. Install `Node.js` and `npm`

Follow instructions here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

3. Install package requirements from `package-lock.json`

```
cd bioInfoChatbot
npm install
cd backend
npm install
```

4. Make an `.env` file containing `GROQ_API_KEY = "gsk_..."` in the backend folder.

5. Have two tabs open in the terminal.

```
// tab 1 to run backend
bioInfoChatbot/backend % node server.js
```

```
// tab 2 to run frontend; with npm run dev, the web app should be viewed on the browser at 'http://localhost:5173/'
bioInfoChatbot % npm run dev
```
