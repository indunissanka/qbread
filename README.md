# Sweet Delights Bakery

An e-commerce platform for a bakery offering online ordering with LINE authentication.

## Features
- Online ordering system
- LINE authentication integration
- Shopping cart functionality
- Admin dashboard for product management
- Delivery scheduling and tracking
- Responsive design

## Tech Stack
- Frontend: React + TypeScript
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- Authentication: LINE Login
- UI Components: shadcn/ui
- State Management: TanStack Query + Zustand

## Prerequisites
- Node.js 20+
- PostgreSQL
- LINE Login Channel (from LINE Developers Console)

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sweet-delights-bakery.git
cd sweet-delights-bakery
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
DATABASE_URL=postgresql://user:password@localhost:5432/bakerydb
```

4. Start the development server:
```bash
npm run dev
```

## Docker Deployment

### Prerequisites
- Docker
- Docker Compose
- LINE Login Channel (from LINE Developers Console)

### Environment Variables
Create a `.env` file in the root directory with:
```
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
```

### Running with Docker
1. Build the containers:
```bash
docker-compose build
```

2. Start the services:
```bash
docker-compose up -d
```

The application will be available at `http://your-server:5000`

### Important Notes
- Make sure to register your callback URL in LINE Developers Console:
  `http://your-server:5000/api/auth/line/callback`
- The PostgreSQL database data is persisted in a Docker volume
- The application runs on port 5000 by default

## License
MIT