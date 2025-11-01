-> Scalable Job Importer

A production-quality MERN stack application for importing job data from external XML APIs with queue processing and history tracking.

-> Features

- Pulls job data from multiple external XML APIs
- Converts XML to JSON and imports into MongoDB
- Uses Redis + BullMQ for queue-based background processing
- Tracks import history in MongoDB
- Provides an Admin UI (Next.js) to view import history

-> Tech Stack

- _Frontend_: Next.js (React 18+)
- _Backend_: Node.js with Express.js
- _Database_: MongoDB (via Mongoose)
- _Queue_: BullMQ
- _Queue Store_: Redis
- _Language_: JavaScript (ES Modules)

-> Installation & Setup

-> Prerequisites

- Node.js (v18+)
- MongoDB ( cloud instance)
- Redis ( cloud instance)

-> Backend Setup

1. Navigate to the server directory:
   bash
   cd server

2. Install dependencies:
   bash
   npm install

3. Create a `.env` file in the server directory with the following variables:
   MONGO_URI=MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/mydatabase

   REDIS_URL=REDIS_URL=REDIS_URL=redis://default:password@redis-12345.c15.us-east-1-2.ec2.cloud.redislabs.com:12345

PORT=5000

4. Start the server:
   bash
   npm start

-> Frontend Setup

1. Navigate to the client directory:
   bash
   npm install

2. Start the development server:
   bash
   npm run dev

-> Usage

-> Manual Import Trigger

You can trigger a manual import by calling the API endpoint:

bash
curl http://localhost:5000/api/imports/trigger

-> Scheduled Imports

The system automatically runs imports every hour using a cron job.

-> Admin UI

Access the admin interface at `http://localhost:3000` to view import history and details.

-> API Endpoints

- `GET /api/imports` - Get list of past import logs (paginated)
- `GET /api/imports/stats` - Get import statistics
- `GET /api/imports/:id` - Get detailed import log with failures
- `POST /api/imports/trigger` - Trigger manual import from all feeds

-> Data Flow

1. _Cron Job_ runs every hour, calling `fetchAllFeeds()`
2. _Fetch Service_ retrieves XML data from configured API endpoints
3. _XML Parser_ converts XML to JSON job objects
4. _Import Service_ creates ImportLog and queues jobs via BullMQ
5. _Job Worker_ processes queued jobs, validates, and imports to MongoDB
6. _Import Log_ tracks counters and failures throughout the process
7. _Admin UI_ displays import history and allows viewing details

-> Environment Variables

-> Backend (.env in /server)

MONGO_URI=mongodb+srv://user123:EHc0dB43WpqycSvE@cluster0.7lhwy.mongodb.net/mern_task_manager?retryWrites=true&w=majority
REDIS_URL=redis://default:lBk7E7npW4Nsj83IFCxCTEm05mbTRDN2@redis-17695.c301.ap-south-1-1.ec2.redns.redis-cloud.com:17695

PORT=5000

-> Frontend (.env.local in /client) - Optional
NEXT_PUBLIC_API_URL=http://localhost:5000/api

-> Assumptions & Notes

- Job uniqueness is determined by the `externalId` field
- External APIs return consistent XML/RSS format
- MongoDB and Redis services are available and accessible
- System runs in a Node.js 18+ compatible environment
- Default cron schedule runs imports every hour (0 \* \* \* \*)
- Job data includes: title, description, company, location, type, url
- Failed jobs are logged with reasons for debugging

-> Development

-> Running in Development Mode

bash
-> Terminal 1: Start backend
cd server && npm run dev

-> Terminal 2: Start frontend
cd client && npm run dev

-> Manual Testing

bash
-> Trigger import manually
curl -X POST http://localhost:5000/api/imports/trigger

-> Get import logs
curl http://localhost:5000/api/imports

-> Get specific import details
curl http://localhost:5000/api/imports/{import_id}

-> Testing

Run tests for both backend and frontend:

-> Backend tests
cd server && npm test

-> Frontend tests
cd client && npm test

-> Documentation

See [docs/architecture.md](docs/architecture.md) for detailed system design and architecture information.
