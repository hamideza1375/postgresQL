# Next.js User API with PostgreSQL and Sequelize

This project demonstrates how to create a simple user management API using Next.js App Router, PostgreSQL, and Sequelize ORM.

## Setup

1. Create a PostgreSQL database
2. Copy `.env.example` to `.env` and fill in your database credentials:
   ```
   POSTGRES_DB=your_database_name
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   ```

## Running the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## API Endpoints

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users

## Testing the APIs

### Using REST Client (VS Code Extension)

1. Open the `api-tests/users.rest` file
2. Click on the "Send Request" button above each request to test the APIs

### Using curl

Create a user:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john.doe@example.com"}'
```

Get all users:
```bash
curl http://localhost:3000/api/users
```

## Project Structure

- `app/api/users/route.ts` - API routes for user management
- `lib/db.ts` - Database configuration
- `models/User.ts` - User model definition
- `api-tests/users.rest` - REST client test file