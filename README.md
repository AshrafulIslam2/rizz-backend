# Rizz Backend API

A modern backend API built with NestJS, Prisma, and PostgreSQL.

## Features

- 🔐 JWT Authentication (login/register)
- 👤 User management
- 📝 Post management
- 🔍 Query filtering and relationships
- ✅ Input validation
- 🛡️ Type-safe database operations with Prisma
- 🐘 PostgreSQL database

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Validation**: class-validator
- **Password Hashing**: bcrypt

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Update the `.env` file with your database connection and JWT secrets

4. Run database migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Posts

- `GET /posts` - Get all posts
- `GET /posts?published=true` - Get published posts only
- `GET /posts?authorId=1` - Get posts by author
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create new post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

## Database Schema

### User

- `id` - Auto-increment primary key
- `email` - Unique user email
- `name` - User's display name
- `password` - Hashed password
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Post

- `id` - Auto-increment primary key
- `title` - Post title
- `content` - Post content (optional)
- `published` - Publication status
- `authorId` - Foreign key to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Development

### Available Scripts

- `npm run start` - Start the production server
- `npm run start:dev` - Start the development server with hot reload
- `npm run start:debug` - Start the server with debugging
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Database Management

- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply a new migration
- `npx prisma migrate reset` - Reset the database
- `npx prisma generate` - Regenerate Prisma client

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"
```

## Project Structure

```
src/
├── auth/           # Authentication module
│   ├── dto/        # Data transfer objects
│   ├── guards/     # Auth guards
│   ├── strategies/ # Passport strategies
│   └── ...
├── users/          # User management module
├── posts/          # Post management module
├── prisma/         # Prisma service and module
└── main.ts         # Application entry point

prisma/
├── schema.prisma   # Database schema
└── migrations/     # Database migrations
```

## License

This project is licensed under the MIT License.
