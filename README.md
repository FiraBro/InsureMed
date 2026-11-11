# InsureMed — Online Health Insurance Management System

InsureMed is a web application for managing health insurance plans, applications, policies, claims, users, and support requests. It includes an admin interface and AI-assisted chat features.

## Project structure

```text
InsureMed/
├── Clients/        React 19 + Vite frontend
├── Server/         Express 5 API and MongoDB models
└── docker-compose.yml
```

## Requirements

For the recommended Docker setup, install:

- Git
- Docker Engine or Docker Desktop
- Docker Compose v2 (`docker compose`)

For running without Docker, install Node.js 20 or newer and npm, plus MongoDB and Redis.

## Run the project with Docker

These steps start MongoDB, Redis, the API, and the frontend together.

1. **Clone the repository and enter the project folder.**

   ```bash
   git clone <repository-url>
   cd InsureMed
   ```

   Replace `<repository-url>` with the URL of your fork or the repository you have access to.

2. **Create the server environment file.**

   ```bash
   cp Server/.env.example Server/.env
   ```

   Edit `Server/.env` and add the settings below. The MongoDB address uses the Compose service name, so keep `mongodb_health` when running with Docker.

   ```dotenv
   PORT=3001
   MONGODB_URI=mongodb://admin:admin123@mongodb_health:27017/health_insurance?authSource=admin
   REDIS_URL=redis://redis:6379
   JWT_SECRET=replace-with-a-long-random-secret
   CLIENT_URL=http://localhost:3000

   # Needed for AI chat and document embeddings
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_GENERATION_MODEL=gemini-2.5-flash
   GEMINI_EMBEDDING_MODEL=gemini-embedding-001
   GEMINI_EMBEDDING_DIMENSIONS=768

   # Needed only for email delivery (verification and password reset)
   SMTP_HOST=your-smtp-host
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   SMTP_FROM=your-sender-address
   ```

   `Server/.env.example` contains the AI model defaults. Keep credentials private; do not commit `Server/.env` or real API keys.

3. **Build and start the services.**

   ```bash
   docker compose up --build
   ```

   The first build can take a few minutes. Leave this terminal running to see service logs. To run in the background, add `-d`.

4. **Open the app and API documentation.**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API status: [http://localhost:3001](http://localhost:3001)
   - Swagger API docs: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

5. **Stop the services when finished.**

   In the terminal running Compose, press `Ctrl+C`, then run:

   ```bash
   docker compose down
   ```

   To also remove the local MongoDB data volumes and start with an empty database, run `docker compose down -v`. This permanently deletes that local database data.

## Run services without Docker

Use this option if you already have MongoDB and Redis running locally. Open a separate terminal for each service.

1. Create `Server/.env` as above, but set the local service URLs:

   ```dotenv
   MONGODB_URI=mongodb://admin:admin123@localhost:27019/health_insurance?authSource=admin
   REDIS_URL=redis://localhost:6379
   CLIENT_URL=http://localhost:3000
   ```

   The MongoDB port shown matches the port mapping in `docker-compose.yml`. If MongoDB is installed another way, use its URI and credentials instead.

2. Install and start the API:

   ```bash
   cd Server
   npm install
   npm run dev
   ```

3. In another terminal, install and start the frontend:

   ```bash
   cd Clients
   npm install
   ```

   Create `Clients/.env` with the API URL:

   ```dotenv
   VITE_API_URL=http://localhost:3001/api/v1
   ```

   Then start Vite:

   ```bash
   npm start
   ```

   Open [http://localhost:5173](http://localhost:5173). Vite prints the local URL when it starts.

## Useful commands

Run these from the relevant project directory:

| Directory  | Command                             | Purpose                                                    |
| ---------- | ----------------------------------- | ---------------------------------------------------------- |
| `Server/`  | `npm run dev`                       | Start the API with automatic restart                       |
| `Server/`  | `npm start`                         | Start the API without automatic restart                    |
| `Server/`  | `npm run seed`                      | Run the FAQ/Gemini seed script (requires a Gemini API key) |
| `Server/`  | `npm run ingest:document -- <path>` | Ingest a document for AI search                            |
| `Clients/` | `npm start`                         | Start the Vite development server                          |
| `Clients/` | `npm run build`                     | Build frontend files for production                        |
| `Clients/` | `npm run lint`                      | Check frontend code with ESLint                            |

## Configuration notes

- The Compose setup maps the frontend to port `3000`, API to `3001`, MongoDB to `27019`, and Redis to `6379` on your computer.
- Inside Docker, services connect to MongoDB at `mongodb_health:27017` and Redis at `redis:6379`.
- The frontend defaults to `http://localhost:3001/api/v1` if `VITE_API_URL` is not set. Its Compose container is intended for local browser use.
- AI features require a valid `GEMINI_API_KEY`. Email verification and password reset require working SMTP settings.
- `Server/.env.example` currently documents the Gemini model settings; add the other variables shown above to your private `Server/.env` file.

## Troubleshooting

- **The server cannot connect to MongoDB:** Check that MongoDB is running and that `MONGODB_URI` uses the correct hostname. Use `mongodb_health` from a Compose container and `localhost:27019` when connecting from your computer.
- **The frontend cannot reach the API:** Confirm the server is running on port `3001`. For local frontend development, check `Clients/.env` has `VITE_API_URL=http://localhost:3001/api/v1`.
- **AI features report a missing key:** Set `GEMINI_API_KEY` in `Server/.env`, then restart the server.
- **Ports are already in use:** Stop the process using the port or change the host-side port mapping in `docker-compose.yml`.

## Contributing

1. Fork the repository and create a branch for your change.
2. Follow the setup steps above and make your change in `Clients/` or `Server/`.
3. Before opening a pull request, run `npm run lint` in `Clients/` and `npm run build` in `Clients/` when your change affects the frontend.
4. Describe what changed and how you verified it in your pull request.
