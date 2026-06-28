# Helth Service

Fitness tracking aggregation service that collects data from Fitbit and Whoop, then publishes updates to Discord.

## Architecture

**Microservices (3 services):**
- `api/` - REST API (Express/TypeScript) - OAuth, webhooks, data aggregation
- `discord-client/` - Discord bot (Discord.js) - Notification delivery
- `fe-auth/` - Frontend (SvelteKit) - User authentication UI

**Data Flow:**
```
Fitbit/Whoop Webhooks → API → Redis PubSub → Discord Client → Discord #fitness channel
```

**Stack:**
- Database: PostgreSQL 17.2 with Drizzle ORM
- Cache/PubSub: Redis 7.4
- Deployment: Docker Compose (local)

## Development

### Local Setup
```bash
# Start infrastructure
docker-compose up postgres redis -d

# Start all services
docker-compose up --build

# Or individual services
cd api && npm run dev              # Port 3000
cd discord-client && npm run dev   # Port 3001  
cd fe-auth && npm run dev          # Port 3002
```

### Service Ports
- API: `http://localhost:3000`
- Discord Client: `http://localhost:3001`
- Frontend: `http://localhost:3002`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Environment Variables
Each service has `.env` files. **Note:** `.env` files are committed (security issue - contains secrets).

## Providers

### Fitbit
- OAuth2 with PKCE flow
- Tracks: sleep, HRV, heart rate, activity logs
- Webhooks: `/webhooks/fitbit` (GET for validation, POST for events)
- Subscriptions created on user signup for: `activities`, `sleep`
- Files: `api/src/lib/oauth/FitbitOauthClient.ts`, `api/src/lib/services/fitbit.ts`

### Whoop  
- OAuth2 flow
- Tracks: recovery score, sleep, workouts (strain), HRV, resting HR
- Webhooks: `/webhooks/whoop` with HMAC-SHA256 signature validation
- Implemented: `recovery.updated`, `workout.updated`
- **Not implemented:** sleep webhooks, deletion handlers
- Files: `api/src/lib/oauth/WhoopOauthClient.ts`, `api/src/lib/services/whoop.ts`

## Database Schema

**Table: `users`**
```typescript
{
  id: integer (auto-increment primary key)
  email: varchar(255) unique
  provider: varchar(255) // "fitbit" | "whoop"
  access_token: varchar
  refresh_token: varchar
  provider_data: jsonb // stores provider-specific user data
  seen_activities: jsonb // array of activity IDs to prevent duplicates
  created_at: timestamp
  updated_at: timestamp
}
```

Location: `api/src/lib/db/postgres/schema.ts`

## API Routes

### `/oauth`
- `GET /oauth/fitbit?email=` - Get Fitbit auth URL
- `POST /oauth/fitbit/auth` - Exchange code for tokens, create user
- `GET /oauth/whoop` - Get Whoop auth URL  
- `POST /oauth/whoop/auth` - Exchange code for tokens, create user

### `/webhooks`
- `GET /webhooks/fitbit?verify=` - Webhook validation (returns 204)
- `POST /webhooks/fitbit` - Receive activity/sleep updates
- `POST /webhooks/whoop` - Receive recovery/workout updates (HMAC validated)

### `/users`
- `GET /users/:email` - Get user by email
- `DELETE /users/:email` - Delete user and cleanup subscriptions
- `POST /users` - Create user (internal)

### `/summary`
- `GET /summary?date=YYYY-MM-DD` - Get all users' summaries for date
- `GET /summary/:email` - Get user summary

## Message Format

**Recovery Message (PubSubRecoveryMessage):**
```typescript
{
  type: "recovery"
  email: string
  provider: "fitbit" | "whoop"
  date: string (ISO 8601)
  aggregatedScore: string
  restingHr: string
  hrv: string
  sleepTime: string (hours)
}
```

**Activity Message (PubSubActivityMessage):**
```typescript
{
  type: "workout"
  email: string
  provider: "fitbit" | "whoop"
  date: string (ISO 8601)
  activity: string
  duration: string (e.g. "1h 30m")
  calories: string
  avgHr: string
  maxHr: string
  distance: string (miles)
  strain?: string (Whoop only, 0-21)
}
```

Redis channel: `pubsub:message`

## Discord Integration

- Bot requires channel named `"fitness"` (case-sensitive)
- Publishes embeds for recovery and workout updates
- Color-coded by recovery score: red (<33), yellow (33-67), green (>67)
- Files: `discord-client/src/embeds/recovery-updated.ts`, `discord-client/src/embeds/workout-updated.ts`

## Git Conventions

**Commits:** Lowercase, imperative mood, concise
```
remove legacy cloud infrastructure
add seen activities to user schema
fix typo
```

**PRs:** Descriptive title, tight description
```
Example: "The Un-cloudening. (#63)"
```

## Known Issues

1. **Security:** `.env` files committed with secrets
2. **No tests:** Test scripts are placeholder
3. **Redis inefficiency:** New client created per message publish (api/src/lib/services/publish.ts:8-17)
4. **Missing handlers:** Whoop sleep/deletion webhooks not implemented
5. **No database migrations:** Schema changes not tracked
6. **Webhook bypass:** Can skip signature validation with `x-ignore-signature: true` header

## Testing E2E

1. Start all services: `docker-compose up --build`
2. Navigate to `http://localhost:3002/app`
3. Enter email and authenticate with Fitbit/Whoop
4. Trigger webhook manually or wait for device activity
5. Check Discord #fitness channel for embedded message

**Manual webhook trigger:**
```bash
# Fitbit sleep update
curl -X POST http://localhost:3000/webhooks/fitbit \
  -H "Content-Type: application/json" \
  -d '[{"collectionType":"sleep","date":"2026-06-28","ownerId":"<FITBIT_ID>"}]'

# Whoop workout (bypass signature)
curl -X POST http://localhost:3000/webhooks/whoop \
  -H "Content-Type: application/json" \
  -H "x-ignore-signature: true" \
  -d '{"type":"workout.updated","id":12345,"user_id":67890}'
```
