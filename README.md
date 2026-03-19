# Autonomous Agent
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/surajit20107/Autonomous-Agent/blob/main/LICENSE) [![Language: TypeScript](https://img.shields.io/badge/Language-TypeScript-blueviolet)](https://www.typescriptlang.org/) [🌐 Website](https://zevinagent.vercel.app)

A modern, full‑stack autonomous AI assistant built with TypeScript, LangChain integrations and a clean Next.js client. This project demonstrates an extensible agent architecture that connects a web UI to a language model (Gemini) with safe tool usage (web search, controlled code execution) and memory persistence.

---

✨ Highlights
- Clean, responsive chat UI (Next.js / React) that talks to a backend agent.
- Robust server agent built with LangChain primitives:
  - Gemini (Google Generative AI) model integration
  - Internet search via Tavily
  - Sandboxed code execution using vm2
  - Memory checkpointing
  - API key rotation support
- MIT licensed and ready for local development or deployment to Vercel / Node hosts.

---

Table of contents
- Features
- Quick start
- Environment variables
- Architecture & how it works
- Key files / project structure
- Usage
- Deployment
- Contributing
- License

---

Features
- Real-time conversational UI supporting markdown and syntax highlighting.
- Threaded chat support (each chat has a thread_id).
- Agent with controlled tool usage and safety rules (decides when to call tools).
- Multi-key rotation for Gemini API keys to improve uptime/availability.
- Internet search tool (Tavily) for up-to-date results when required.
- Sandboxed code execution for safe computations (vm2).

---

Quick start (local)
1. Clone
   git clone https://github.com/surajit20107/Autonomous-Agent.git
2. Install
   - Client:
     cd client
     npm install
   - Server:
     cd ../server
     npm install
3. Configure env files (see Environment variables below).
4. Run
   - Start server (example):
     npm run dev
   - Start client (Next.js):
     cd client
     npm run dev
5. Open the client in the browser (usually http://localhost:3000) and interact with the assistant.

Note: exact npm scripts may vary — check each package.json in the client and server directories.

---

Environment variables
The project includes sample env files. Configure real values before running.

Client (.env)
- NEXT_PUBLIC_API="http://localhost:PORT"  # URL of the backend service

Server (examples derived from code)
- GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3, ... — Gemini / Google generative model keys (used with rotation)
- TAVILY_API_KEY — API key for Tavily internet search
- Any other standard variables (PORT, NODE_ENV) as needed

Important: Keep keys secret. Do not commit .env with secrets to the repo.

---

Architecture & how it works (brief)
1. User interacts with the frontend (client/app/page.tsx) — chat UI sends POST requests to the backend endpoint:
   POST ${NEXT_PUBLIC_API}/api/v1/agent
   Body: { message, thread_id }
2. The server agent (server/agent/agent.ts) receives the request and calls the LangChain-based agent:
   - The agent has a model instance (ChatGoogleGenerativeAI).
   - Tools available:
     - internet_search (Tavily)
     - code_execution (vm2 sandbox)
   - MemorySaver checkpointer persists the agent's memory.
   - API key rotation is supported to cycle through multiple Gemini keys.
3. The agent chooses whether to answer directly or call tools per its system prompt rules, then returns the response to the client.

---

Key files (overview)
- client/
  - app/page.tsx — main chat UI and message flow logic
  - app/style.css — UI styling
  - next.config.ts — Next.js configuration
  - .env.sample — example client env (NEXT_PUBLIC_API)
  - package.json, tsconfig.json
- server/
  - index.ts — server entry (HTTP handlers / API)
  - agent/agent.ts — core LangChain agent, tools, sandbox, key rotation
  - .env.sample — example server env
  - package.json, tsconfig.json
- LICENSE — MIT License
- .gitignore

---

Usage tips & troubleshooting
- If you receive API errors, check the backend URL in client/.env and ensure the server is up.
- Ensure Gemini and Tavily keys are valid and have required access.
- Sandboxed code execution has a timeout and disabled unsafe operations for safety.
- Logs on the server output key rotation notices and agent activity for debugging.

---

Deployment
- Frontend: deploy client to Vercel (recommended for Next.js), or any static/SSR host.
- Backend: deploy server to a Node environment (Heroku, DigitalOcean, Fly, Vercel Serverless / Edge functions with adjustments).
- Set environment variables in your chosen hosting provider's dashboard.

Live demo / homepage
- https://zevinagent.vercel.app

---

Contributing
Thank you for considering a contribution! Please:
1. Open an issue to propose major changes or discuss features.
2. Fork the repo, create a feature branch, and open a pull request.
3. Keep sensitive keys out of commits and provide reproducible steps for bugs/features.

---

License
This project is licensed under the MIT License — see LICENSE for details.

---

Credits & acknowledgements
- Built with LangChain, vm2, Next.js, TypeScript and many OSS libraries.
- Project author: @surajit20107

If you want, I can also generate templates for CONTRIBUTING.md, a more detailed developer setup, or update README sections with command specifics from package.json files.
