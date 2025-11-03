# Retrieval-Augmented Bioinformatics Software Tutorial Supporting Chatbot (RA-BSTS Chatbot) with Guardrails

_README Last Updated: 2025-10-08_

_Tested on: Apple M1 Pro 16GB Sequoia 15.7_

## Contributors

- [Hannah Kim](https://github.com/hannahkimincompbio) (maintainer)
- [Minh Doan](https://www.github.com/Dwanky-y)
- [Rahad Arman Nabid](https://github.com/rahadarmannabid)

## Table of Contents

- [**Installation**](#installation)
- [**Run RA-BSTS Chatbot on the Command Line**](#run-ra-bsts-chatbot-on-the-command-line)
- [**References**](#references)

---

## Installation

1. Clone the git repository as below.

```
git clone https://github.com/Interdisciplinary-HCI/RA-BSTS.git
```

(Or download ZIP file and unzip the file.)

![Download ZIP file](./Download%20Zip.png)

2. Install `Node.js` and `npm` (https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

3. Install package requirements from `package-lock.json` as below.

```
cd RA-BSTS
npm install
cd backend
npm install
```

4. Obtain a _free_ API key from `Groq` (https://console.groq.com/keys). Keep this key somewhere safe. Make an `.env` file containing `GROQ_API_KEY = "gsk_<your_api_key>"` in the `/backend` folder as below.

```
echo 'GROQ_API_KEY = "gsk_<your_api_key>"' > ./backend/.env
```

5. Install `ollama` (https://github.com/ollama/ollama?tab=readme-ov-file). Pull the required model (https://ollama.com/library) as below.

```
ollama pull nomic-embed-text //  274 MB
```

6. Install `docker` (https://www.docker.com/get-started/).

## Run RA-BSTS Chatbot on the Command Line

Have FOUR tabs open in the terminal to observe each process. Make sure that `docker` is running in the background.

(Or just simply run `sh run.sh` after `cd RA-BSTS`, but do note that processes need to be manually killed for reruns. Make sure that `docker` is running in the background for this method as well.)

### 1. Chromadb tab

```
docker run -p 8000:8000 -v </absolute/path/on/your/machine>:/data ghcr.io/chroma-core/chroma:latest
```

#### example:

```
docker run -p 8000:8000 -v /Users/Palindrome/Documents/project_gits/RA-BSTS/backend/chroma_data:/data ghcr.io/chroma-core/chroma:latest
```

### 2. Ollama tab

```
ollama serve
```

### 3. Frontend tab

Once you run this line, the web app can be viewed on the browser at http://localhost:5173/.

```
cd RA-BSTS
npm run dev
```

### 4. Backend tab

```
cd backend
node server.js
```

<!-- node server.js > "pid_serverlog.log" -->

## References

- [BioGenie](https://github.com/Capstone-Projects-2025-Spring/project-003-bioinformatics-chatbot): BioInformatics Software Tutorial Chatbot Temple University S2025 Capstone Project
