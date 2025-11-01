-> System Architecture

-> Overview

The Scalable Job Importer is a MERN stack application designed to efficiently import job data from multiple external XML APIs using queue-based processing for scalability and reliability.

-> System Components

-> Backend (Express.js)

- API Layer: RESTful endpoints for triggering imports and retrieving import history
- Queue System: BullMQ with Redis for background job processing
- Data Layer: MongoDB with Mongoose for data persistence
- Scheduler: Node-cron for automated hourly imports

-> Frontend (Next.js)

- Admin Dashboard: Interface for viewing import history and details
- Data Visualization: Tables displaying import statistics and failure information

-> Data Flow

External APIs → Fetch Service → Queue → Worker → MongoDB
↓
Import Logs
↓
Admin UI

-> Detailed Flow:

1. Cron Job triggers `fetchService.fetchAllFeeds()` every hour
2. Fetch Service retrieves XML data from configured API endpoints
3. XML Parser converts XML to JSON format
4. Import Service creates an ImportLog entry and queues individual jobs
5. BullMQ Queue manages job processing asynchronously
6. Job Worker processes each job:
   - Validates data
   - Inserts/updates Job documents in MongoDB
   - Updates ImportLog counters
   - Logs failures with reasons
7. Admin UI displays import history and allows viewing detailed logs

Data Models

Job Schema
-> javascript
{
externalId: String, // Unique identifier from external API
title: String, // Job title
description: String, // Job description
company: String, // Company name
location: String, // Job location
type: String, // Job type (full-time, part-time, etc.)
url: String, // Job posting URL
raw: Object, // Original raw data
lastImportedAt: Date // Last import timestamp
}

-> ImportLog Schema
javascript
{
feedUrl: String, // API feed URL
importDateTime: Date, // Import start time
totalFetched: Number, // Total jobs fetched from API
totalImported: Number, // Total successfully imported
newJobs: Number, // New jobs added
updatedJobs: Number, // Existing jobs updated
failedJobs: Number, // Jobs that failed to import
failures: [{ // Array of failure details
jobKey: String, // Job identifier
reason: String, // Failure reason
ts: Date // Failure timestamp
}],
status: String // queued, processing, completed, failed
}

```

-> Queue Architecture

=> BullMQ Configuration
- Connection: Redis instance
- Queues: Separate queues for different job types if needed
- Workers: Dedicated worker processes for job processing
- Concurrency: Configurable concurrent job processing

=> Job Processing Flow
1. Jobs added to queue with job data
2. Worker picks up job from queue
3. Worker validates and processes job
4. Worker updates ImportLog counters
5. Job marked as completed or failed

-> API Endpoints

- `POST /api/imports/trigger` - Manually trigger import process
- `GET /api/imports` - Retrieve list of import logs
- `GET /api/imports/:id` - Get detailed import log with failures

-> Scalability Considerations

=> Horizontal Scaling
- Multiple worker instances can process queue jobs concurrently
- Redis clustering for queue persistence and high availability
- MongoDB sharding for database scaling

=> Performance Optimizations
- Batch processing for bulk operations
- Connection pooling for database operations
- Caching strategies for frequently accessed data

-> Error Handling

=> Failure Scenarios
- Network failures during API fetching
- Invalid XML data from external sources
- Database connection issues
- Queue processing failures

=> Recovery Mechanisms
- Retry logic for transient failures
- Dead letter queues for persistent failures
- Comprehensive logging for debugging
- Manual re-trigger capabilities

-> Security Considerations

- Input validation for all external data
- Rate limiting for API endpoints
- Secure environment variable management
- CORS configuration for frontend access

-> Monitoring & Logging

- Import statistics tracking
- Failure reason logging
- Performance metrics collection
- Admin dashboard for oversight

-> Assumptions

- External APIs return consistent XML format
- Job uniqueness determined by `externalId` field
- MongoDB and Redis are available and accessible
- System runs in a Node.js compatible environment

-> Future Improvements

- Implement job deduplication strategies
- Add support for additional data sources
- Implement real-time notifications for import completion
- Add data validation schemas for different API formats
- Implement rate limiting for external API calls
- Add comprehensive test coverage
- Implement health check endpoints
- Add metrics and monitoring dashboards
```
