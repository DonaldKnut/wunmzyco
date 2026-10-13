# Admin bootstrap (Wunmzy Co)

The database seed **does not** create admin users or passwords. Use the bootstrap script once per environment.

## Prerequisites

1. Run migrations and seed:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

2. Set a strong one-time token in `.env`:

   ```env
   ADMIN_SETUP_TOKEN=your-long-random-token
   ```

## Create the first super admin

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='YourSecurePass1' npm run admin:bootstrap
```

Or with CLI flags (token still must match `ADMIN_SETUP_TOKEN` in the environment):

```bash
npm run admin:bootstrap -- --email=you@example.com --password='YourSecurePass1'
```

The account is created with `mustChangePassword: true`. Sign in at `/api/auth/login` and change the password before day-to-day use.

## Security notes

- Rotate or remove `ADMIN_SETUP_TOKEN` after bootstrap if the value was ever exposed.
- Never commit `.env` or real credentials.
- In production, prefer a dedicated `CRON_SECRET` for scheduled jobs instead of reusing `ADMIN_SETUP_TOKEN`.
