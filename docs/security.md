# BiblioPi Security Hardening Guide

This document outlines the recommended security practices for deploying BiblioPi in production environments.

## 1. Network Security

### Port Segregation

BiblioPi uses a dual-port architecture:

- **Port 9090**: Onboarding Wizard. **Should be blocked by firewall** after initial setup is complete.
- **Port 9091**: Main Application. This is the primary entry point for users.

### Tailscale ACLs

If using Tailscale, restrict access to the library to specific users or devices:

```json
{
  "acls": [
    { "action": "accept", "src": ["group:family"], "dst": ["bibliopi:9091"] },
    { "action": "accept", "src": ["akshat@example.com"], "dst": ["bibliopi:9090"] }
  ]
}
```

## 2. Database Security

### PostgreSQL

- **SSL Connections**: Always use `sslmode=require` in your connection string if the database is not on the same host.
- **Password Rotation**: Change the database password every 90 days. Update the `.env` file and restart the container:

  ```bash
  DB_PASSWORD=new_secure_password_123!
  ```

- **Volume Encryption**: Ensure the host filesystem where `./data` or Docker volumes are stored is encrypted (e.g., using LUKS on Linux or BitLocker on Windows).

### SQLite

- **Permissions**: Restrict access to the `library.db` file to the user running the Docker container.
- **Backup Encryption**: When exporting JSON backups, store them in an encrypted vault or encrypted Drive folder.

## 3. SSL/TLS Provisioning

Provision certificates using Tailscale:

```bash
tailscale cert bibliopi.your-tailnet.ts.net
```

Mount these certificates into your Nginx container for full end-to-end encryption.

## 4. Environment Variables

Never commit your `.env` file to version control. Use a secret manager if deploying to a cloud cluster.
