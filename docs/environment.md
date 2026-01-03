# Environment Variables

BiblioPi uses environment variables for build-time configuration and runtime API connectivity.

## Configuration File

Create a `.env` file in the root directory:

```env
# Google Books & Maps API (Optional, for better search results)
VITE_GOOGLE_API_KEY=your_google_key

# Database Configuration (Production only)
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=bibliopi
DB_HOST=localhost

# AI Intelligence (Optional, if using Gemini Cloud)
VITE_GEMINI_API_KEY=your_gemini_key

# Local AI (Ollama)
VITE_OLLAMA_URL=http://localhost:11434
```

## Variable Details

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_GOOGLE_API_KEY` | Used for ISBN lookups and cover art search. | N/A |
| `VITE_GEMINI_API_KEY` | Required for AI-powered summaries and reading recommendations. | N/A |
| `VITE_OLLAMA_URL` | The endpoint for your local Llama instance. | `http://localhost:11434` |
| `DB_TYPE` | Type of database to use (`sqlite` or `postgres`). | `sqlite` |

### Security Note

For security, BiblioPi allows you to configure these keys directly within the UI under **Settings > API Configuration**. Keys entered in the UI are stored in local storage and take precedence over environment variables.

## Recommended AI Models (Ollama)

For the best experience when using BiblioPi with local AI (Ollama), we recommend the following models:

| Usage | Recommended Model | Rationale |
| :--- | :--- | :--- |
| **Fast Summaries** | `llama3.2:1b` | Excellent performance-to-speed ratio for metadata generation. |
| **Deep Insights** | `llama3.8b` | Better for complex cultural analysis and grade-level checking. |
| **Cover Recognition** | `llava` | Required if using the vision feature to identify books by their cover. |
| **Voice Search** | `whisper-base` | Use for high-accuracy Speech-to-Text conversion in the library. |

> **Note**: These models must be pulled in your Ollama instance using `ollama pull [model_name]` before they can be used in BiblioPi.
