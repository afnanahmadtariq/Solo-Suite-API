# Solo Suite API

Express + Prisma backend API for Solo Suite.

## Quick Start

### 1. Install Dependencies

```bash
cd solo-suite-api
npm install
```

### 2. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Create/migrate database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

The API will be running at `http://localhost:3000`.

## Demo Credentials

After seeding:
- **Email:** afnan@example.com
- **Password:** password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Clients (requires auth)
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects (requires auth)
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Invoices (requires auth)
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `PATCH /api/invoices/:id/status` - Update invoice status
- `DELETE /api/invoices/:id` - Delete invoice

### Leads (requires auth)
- `GET /api/leads` - List all leads
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `PATCH /api/leads/:id/status` - Update lead status
- `DELETE /api/leads/:id` - Delete lead

### Dashboard (requires auth)
- `GET /api/dashboard/stats` - Get dashboard statistics

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio
