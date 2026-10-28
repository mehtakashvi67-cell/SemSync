# SemSync Viva Notes

## Simple technology explanations

### React
React builds the interface from reusable components. Components receive data through props and update the screen through state. SemSync uses React for pages such as Dashboard, Tasks and Settings.

### Node.js
Node.js runs JavaScript outside a browser. It allows SemSync's backend and file/database operations to run on the local computer.

### Express
Express is a Node.js framework for creating web routes. Routes such as `GET /api/tasks` receive requests and return JSON responses.

### SQLite
SQLite stores tables in one local file. SemSync's database does not need a separate installed database server.

## Frontend and backend

The frontend is the visible React application. The backend validates requests, runs database operations and returns data. They communicate through HTTP APIs.

## API communication

React calls functions in `src/data/api.js`. `fetch()` sends an HTTP request to an Express endpoint. Express validates the request, accesses SQLite and returns JSON. React stores the returned data in state and updates the UI.

## CRUD

- **Create:** adding a task with `POST /api/tasks`
- **Read:** displaying tasks with `GET /api/tasks`
- **Update:** editing with `PUT /api/tasks/:id`
- **Delete:** removing with `DELETE /api/tasks/:id`

A status checkbox uses the smaller `PATCH /api/tasks/:id/status` operation.

## Tables and foreign keys

A subject is stored once in `subjects`. Every task stores its subject ID in `tasks.subject_id`. This is a foreign key: it links each task to an existing subject. SQLite foreign key enforcement prevents orphaned tasks when subject deletion rules are applied.

## Why SQLite instead of PostgreSQL

PostgreSQL is powerful but requires a separate database server and more setup. SQLite is appropriate for a local, single-user college prototype because its database is one file and requires no cloud account.

## Why JSON instead of a second live database

JSON is easy to read and useful for backups and transfer between computers. Normal application operations still use SQLite, so JSON does not compete with SQLite or create two sources of truth.

## Overdue tasks

The backend compares the task's stored date with today's local `YYYY-MM-DD` value. The task is overdue only when its date is earlier and its status is not Completed. The frontend and backend do not convert date-only values to timezone-dependent timestamps.

## Daily recommendations

The backend groups incomplete tasks into overdue, due today and upcoming. Each group is sorted by High, Medium, then Low priority. The first six are returned for the dashboard recommendation section.

## Ten viva questions

1. **What problem does SemSync solve?**  It gives students one local place to track subjects, assignments and deadlines.

2. **Why is Express used?**  It provides a simple way to define REST API routes and middleware in Node.js.

3. **Where is persistence implemented?**  In SQLite using SQL tables and `better-sqlite3`.

4. **What is state in React?**  Data that controls a component's current screen and changes when the user acts.

5. **What happens when a task is created?**  React sends JSON, Express validates it and SQL inserts it into the tasks table.

6. **Why use parameterized queries?**  Values are passed separately from SQL text, preventing SQL injection and treating user text as data.

7. **How is a task linked to a subject?**  Its `subject_id` is a foreign key referencing `subjects.id`.

8. **What is an HTTP status code?**  A standard response code such as 200 for success, 400 for invalid input and 404 for missing data.

9. **Why are loading and error states needed?**  They tell the user that data is being fetched or that the backend request failed.

10. **How does completion update the dashboard?**  The status PATCH request changes SQLite, React reloads tasks, and the dashboard API recalculates totals from SQLite.
