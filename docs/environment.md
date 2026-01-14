# Environment Variables

BiblioPi uses environment variables for runtime configuration and API connectivity.

## Configuration File

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Database Configuration
DB_TYPE=sqlite
DATABASE_URL=sqlite:///app/data/library.db

# PostgreSQL Configuration (Optional - enable with: docker compose --profile postgres up -d)
# DB_HOST=postgres
# DB_PORT=5432
# DB_NAME=bibliopi
# DB_USER=bibliopi
# DB_PASSWORD=your_secure_password_here

# AI Configuration
API_KEY=your_gemini_api_key_here

# Ollama Configuration (Optional - for local/private AI)
OLLAMA_HOST=http://host.docker.internal:11434

# Application Configuration
NODE_ENV=production
WIZARD_PORT=9090
APP_PORT=9091
```

## Variable Details

| Variable | Description | Default |
| :--- | :--- | :--- |
| `API_KEY` | Google Gemini API key for AI-powered summaries and recommendations. | N/A |
| `OLLAMA_HOST` | The endpoint for your local Ollama instance. | `http://host.docker.internal:11434` |
| `DB_TYPE` | Type of database to use (`sqlite` or `postgres`). | `sqlite` |
| `DATABASE_URL` | Full database connection string. | `sqlite:///app/data/library.db` |
| `NODE_ENV` | Application environment mode. | `production` |
| `WIZARD_PORT` | Port for the onboarding wizard. | `9090` |
| `APP_PORT` | Port for the main application. | `9091` |

### Security Note

For security, BiblioPi allows you to configure API keys directly within the UI under **Settings > API Configuration**. Keys entered in the UI are stored in local storage and take precedence over environment variables.

## Recommended AI Models (Ollama)

For the best experience when using BiblioPi with local AI (Ollama), we recommend the following models:

| Usage | Recommended Model | Rationale |
| :--- | :--- | :--- |
| **Fast Summaries** | `llama3.2:1b` | Excellent performance-to-speed ratio for metadata generation. |
| **Deep Insights** | `llama3:8b` | Better for complex cultural analysis and grade-level checking. |
| **Cover Recognition** | `llava` | Required if using the vision feature to identify books by their cover. |

> **Note**: These models must be pulled in your Ollama instance using `ollama pull [model_name]` before they can be used in BiblioPi.
