# Installation Guide

BiblioPi can be installed locally for development or deployed using Docker for production use.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Docker** (Optional, for containerized deployment)

## Local Development Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-repo/BiblioPi.git
   cd BiblioPi
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Copy the example environment file and fill in your details:

   ```bash
   cp .env.example .env
   ```

   *See [Environment Variables](./environment.md) for more details.*

4. **Launch the Application**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:9090`.

## First Run (Onboarding)

When you launch BiblioPi for the first time, you will be greeted by the **Onboarding Wizard**. This multi-step guide will help you:

- Create your first user profiles (Admin, Parents, Kids).
- Setup your 3-level Location Hierarchy.
- Configure AI (Ollama or Gemini).
- Generate starter books to test the library.

## Docker Deployment (Recommended)

BiblioPi is designed to be easily self-hosted.

1. **Build and Run**

   ```bash
   docker compose up -d
   ```

2. **Accessing the App**
   - **Onboarding Wizard**: `http://localhost:9090` (Configure profiles, AI, and DB)
   - **Main Application**: `http://localhost:9091` (Daily library management)

> **Security Tip**: Once setup is complete, you can safely block port `9090` at your firewall to lock down the initialization endpoint.

## 🗄️ Data Storage Architecture

### Understanding BiblioPi's Data Model

BiblioPi uses a **hybrid storage approach** that gives you flexibility in how you store your library data:

#### Current Architecture (v1.0)

- **Primary Storage**: Browser `localStorage` (client-side JSON storage)
- **Data Location**: Stored in your browser at `home_librarian_v5` key
- **Capacity**: ~5-10MB (suitable for 1000-5000 books)
- **Backup**: Manual JSON export/import via Settings → Backup tab

This approach provides:
✅ **Zero configuration** - Works immediately  
✅ **Privacy-first** - No server required, all data stays on your device  
✅ **Portable** - Export/import your entire library as JSON  

#### Future Server-Side Support (Roadmap)

The Docker configuration includes infrastructure for optional server-side database support:

- **SQLite**: File-based, serverless SQL database
- **PostgreSQL**: Production-grade relational database

> **Note**: Server-side database integration requires a backend API (planned for v2.0). Current configuration prepares the infrastructure for this future enhancement.

---

## Database Configuration (Infrastructure)

While the app currently uses localStorage, the Docker environment is configured to support future database backends.

### Option 1: SQLite (Default - Ready for Future Backend)

**Current State**: Infrastructure prepared, not yet utilized by the app.

**Configuration**:

```bash
# No configuration needed - runs by default
docker compose up -d
```

**Data Storage**:

- Location: `./data/library.db` (created when backend is implemented)
- Persistence: Host-mounted volume ensures data survives container restarts
- Backups: File-based, easy to copy/restore

**Best For**:

- Single-user or small family libraries
- Simple deployment without external dependencies
- Raspberry Pi or low-resource environments

---

### Option 2: PostgreSQL (Optional - Production Ready)

**Current State**: Container configured and ready, awaiting backend integration.

**When to Use**:

- Planning for large libraries (10,000+ books)
- Multi-user concurrent access
- Advanced querying and reporting
- Integration with other tools

#### Setup Steps

1. **Create Environment File**:

   ```bash
   cp .env.example .env
   ```

2. **Configure PostgreSQL Settings**:

   Edit `.env`:

   ```bash
   # Database Configuration
   DB_TYPE=postgres
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=bibliopi
   DB_USER=bibliopi
   DB_PASSWORD=SuperSecurePassword123!  # ⚠️ CHANGE THIS!
   ```

3. **Start with PostgreSQL Profile**:

   ```bash
   # Starts both the app and PostgreSQL containers
   docker compose --profile postgres up -d
   ```

4. **Verify Deployment**:

   ```bash
   docker compose ps
   ```

   Expected output:

   ```text
   NAME                 STATUS    PORTS
   bibliopi_app         Up        0.0.0.0:9090-9091->80/tcp
   bibliopi_postgres    Up        0.0.0.0:5432->5432/tcp
   ```

5. **Check PostgreSQL Health**:

   ```bash
   docker compose logs postgres
   # Should show "database system is ready to accept connections"
   ```

#### PostgreSQL Data Persistence

- **Volume**: Named Docker volume `postgres_data`
- **Backup Location**: `./backups` (mounted in both containers)
- **Data Retention**: Persists across container restarts and rebuilds

#### PostgreSQL Security Best Practices

1. **Change Default Password**: Never use the example password in production
2. **Firewall Rules**: PostgreSQL port (5432) is exposed by default - restrict access via firewall
3. **Encryption**: Enable SSL/TLS for PostgreSQL connections (see `pg_hba.conf` configuration)
4. **Regular Backups**: Use `pg_dump` for backups:

   ```bash
   docker compose exec postgres pg_dump -U bibliopi bibliopi > ./backups/bibliopi_$(date +%Y%m%d).sql
   ```

---

## Switching Databases

### Important Considerations

1. **Current App Uses localStorage**: Database containers are infrastructure-only until backend is implemented
2. **Data Migration**: Use the app's built-in **Backup & Restore** feature:
   - Go to Settings → Backup & Sync
   - Click "Full Backup" to download JSON
   - Switch database configuration
   - Click "Restore DB" and upload your backup

3. **Database-Specific Data**:
   - **SQLite**: Single file at `./data/library.db`
   - **PostgreSQL**: Docker volume `postgres_data`

### Migration Workflow

```bash
# 1. Backup current data via the app UI (Settings → Backup)

# 2. Stop containers
docker compose down

# 3. Update .env with new database configuration
nano .env  # or your preferred editor

# 4. Start with new configuration
docker compose up -d
# OR for PostgreSQL:
docker compose --profile postgres up -d

# 5. Restore data via the app UI (Settings → Restore)
```

---

## Port Segregation for Security

BiblioPi exposes two ports for organizational purposes:

### Port 9090: Onboarding Wizard Entry Point

- **Purpose**: Suggested entry point for first-time setup
- **Usage**: Access during initial setup, then optionally block
- **Note**: Both ports serve the same application - the separation is for firewall convenience
- **Security**: Can be blocked after onboarding complete for reduced attack surface

### Port 9091: Main Application Entry Point

- **Purpose**: Suggested entry point for daily use
- **Usage**: Daily library management
- **Note**: Same application as port 9090
- **Firewall**: Expose to your network (or Tailscale for remote access)

### Firewall Configuration Example

**Using UFW (Ubuntu/Debian)**:

```bash
# Block wizard port from external access
sudo ufw deny 9090/tcp

# Allow app port from local network only
sudo ufw allow from 192.168.1.0/24 to any port 9091

# Or allow from anywhere (if using Tailscale)
sudo ufw allow 9091/tcp
```

**Using firewalld (RHEL/CentOS)**:

```bash
# Allow app port only
sudo firewall-cmd --permanent --add-port=9091/tcp
sudo firewall-cmd --reload
```

---

## Environment Variables Reference

All configuration is managed via the `.env` file. See `.env.example` for the complete template.

### Core Database Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DB_TYPE` | `sqlite` | Database type: `sqlite` or `postgres` |
| `DATABASE_URL` | `sqlite:///app/data/library.db` | Full database connection string |
| `DB_HOST` | `postgres` | PostgreSQL hostname |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `bibliopi` | PostgreSQL database name |
| `DB_USER` | `bibliopi` | PostgreSQL username |
| `DB_PASSWORD` | `changeme` | PostgreSQL password ⚠️ CHANGE THIS! |

### Application Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Application environment mode |
| `WIZARD_PORT` | `9090` | Onboarding wizard port |
| `APP_PORT` | `9091` | Main application port |
| `API_KEY` | - | Google Gemini API key (configured in UI) |
| `OLLAMA_HOST` | `http://host.docker.internal:11434` | Ollama AI endpoint |

---

## Backup & Restore

### Built-in Backup System (Available Now)

1. **Navigate to Settings → Backup & Sync**
2. **Download Full Backup**:
   - Click "Full Backup" button
   - Saves complete application state as JSON
   - Filename format: `bibliopi_backup_YYYY-MM-DD.json`

3. **Restore from Backup**:
   - Click "Restore DB" button
   - Select your backup JSON file
   - App reloads with restored data

### Automated Backup (Future Enhancement)

When backend is implemented, automated backups will support:

- Daily/Weekly/Monthly schedules
- Google Drive integration
- NAS/WebDAV sync
- Versioned backups with retention policies

---

## Troubleshooting

### Database Connection Issues

**Problem**: PostgreSQL container fails to start

**Solution**:

```bash
# Check logs
docker compose logs postgres

# Common issues:
# 1. Port 5432 already in use
sudo lsof -i :5432  # Find conflicting process

# 2. Volume permissions
sudo chown -R 999:999 ./data  # PostgreSQL UID

# 3. Corrupted volume
docker volume rm bibliopi_postgres_data
docker compose --profile postgres up -d
```

### Data Not Persisting

**Problem**: Data resets after browser refresh

**Cause**: localStorage quota exceeded or browser privacy mode

**Solution**:

1. Export backup via Settings
2. Clear browser cache
3. Disable privacy/incognito mode
4. Restore from backup

### Port Already in Use

**Problem**: Cannot bind to port 9090 or 9091

**Solution**:

```bash
# Find process using the port
sudo lsof -i :9090
sudo lsof -i :9091

# Kill the process or change ports in docker-compose.yml
# Change ports:
#   ports:
#     - "8090:80"  # New wizard port
#     - "8091:80"  # New app port
```

### Cannot Access from Other Devices

**Problem**: Can access locally but not from other devices on network

**Solution**:

1. **Check Firewall**: Ensure ports 9090 and 9091 are open
2. **Use Host IP**: Access via `http://192.168.1.x:9091` instead of `localhost`
3. **Docker Network**: Ensure Docker is bound to `0.0.0.0`, not `127.0.0.1`

---

## Tailscale Integration (SSL & Remote Access)

To access your home library from anywhere securely without opening ports and with full SSL (HTTPS) encryption:

1. **Install Tailscale**: Setup Tailscale on your host machine.
2. **Assign a Name**: Give your machine a clear name like `bibliopi`.
3. **Provision SSL Certificates**:

   ```bash
   # On your host machine
   tailscale cert bibliopi.your-tailnet.ts.net
   ```

4. **HTTPS Setup**: BiblioPi's production Nginx container is pre-configured to look for certs in `/etc/ssl/certs/tailscale`. Mount them in your `docker compose` file to enable secure browsing.
