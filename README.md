# SemSync — Student Deadline Manager

SemSync is a local task-management application for organizing subjects, assignments, priorities and deadlines. It uses React for the interface, Express for the API, and SQLite for persistent local storage.

## Objectives and features

- Track subjects and tasks from one dashboard
- Create, edit, complete and delete tasks
- Search tasks and combine subject, priority and status filters
- Show overdue, pending and completed totals
- Recommend overdue work, tasks due today and upcoming work
- Preserve data when the browser or backend restarts
- Export and import JSON backups

## Technology stack

- **React/Vite:** component-based interface and a fast frontend build
- **JavaScript/CSS:** simple UI implementation and responsive layout
- **Node.js:** JavaScript runtime for the local server
- **Express:** REST routing and JSON middleware
- **SQLite/better-sqlite3:** local persistence without a separate database server
- **Lucide React:** lightweight interface icons

## Architecture and request flow

```text
React component → API helper → Express route → validation → SQL service → SQLite
                 JSON response ← Express route ← parameterized query
```

The normal frontend development path `/api` is forwarded by Vite to `http://localhost:3001`.

## Folder structure

```text
src/
  components/   reusable interface components
  pages/        dashboard, tasks, subjects, calendar and settings
  data/api.js   frontend API helper
  data/helpers  date and priority functions
  styles/       CSS
server/
  db/           SQLite initialization and seeds
  routes/       subjects, tasks, dashboard and JSON routes
  services/     database operations and calculations
  data/         sample and exported JSON
  test/         backend integration tests
```

## Database schema

### subjects

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `name TEXT NOT NULL UNIQUE`
- `color TEXT NOT NULL`
- `created_at TEXT NOT NULL`

### tasks

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `title TEXT NOT NULL`
- `description TEXT NOT NULL DEFAULT ''`
- `subject_id INTEGER NOT NULL`, referencing `subjects(id)`
- `due_date TEXT` stored as `YYYY-MM-DD`
- `due_time TEXT` stored as `HH:MM`
- `priority TEXT`: High, Medium or Low
- `status TEXT`: Pending, In Progress or Completed
- `created_at` and `updated_at` timestamps

Foreign key enforcement is enabled with `PRAGMA foreign_keys = ON`.

## REST API

- Health: `GET /api/health`
- Subjects: `GET /api/subjects`, `POST /api/subjects`, `PUT /api/subjects/:id`, `DELETE /api/subjects/:id`
- Tasks: `GET /api/tasks`, `GET /api/tasks/:id`, `POST /api/tasks`, `PUT /api/tasks/:id`, `PATCH /api/tasks/:id/status`, `DELETE /api/tasks/:id`
- Dashboard: `GET /api/dashboard/stats`, `GET /api/dashboard/today`
- Reset/JSON: `POST /api/data/reset`, `GET /api/data/export`, `POST /api/data/import`

## Deploy to Render

SemSync is configured as one Render web service. Express serves both the React production build and the API.

1. Push the project to GitHub.
2. In Render, choose **New > Blueprint**.
3. Select the repository and approve `render.yaml`.
4. After the first deployment, use the generated Render URL.
5. The SQLite database is stored on the `semsync-data` persistent disk at `/var/data/semsync.sqlite`.

A persistent disk may require a paid Render plan. Without a persistent disk, the SQLite file may disappear when Render replaces or redeploys the service, although the application can still run.

Render build command:

```text
npm install && npm run build
```

Render start command:

```text
npm start
```

No separate frontend or backend services are required. Local development still uses Vite on port 5173 and Express on port 3001.

Production request flow:

```text
Render URL -> Express -> React files or /api routes -> SQLite persistent disk
```

## Setup and launch

Requirements: Node.js 18+ and npm.

Install dependencies:

```powershell
cd C:\Users\003\Desktop\SemSync
npm install
cd server
npm install
```

Optional environment configuration:

```powershell
copy .env.example .env
```

Backend:

```powershell
cd C:\Users\003\Desktop\SemSync\server
npm start
```

Frontend, in a second terminal:

```powershell
cd C:\Users\003\Desktop\SemSync
npm run dev
```

Frontend URL: `http://localhost:5173`  
Backend URL: `http://localhost:3001/api`  
SQLite location: `C:\Users\003\Desktop\SemSync\server\semsync.sqlite`

## Verification commands

```powershell
cd C:\Users\003\Desktop\SemSync
npm run build
npm run lint

cd server
npm test
```

## JSON import/export

Open Settings, choose **Export Data** to download a snapshot, or select a JSON file for import. A sample file is available at `server/data/sample-semsync.json`. Imports are validated and append tasks; JSON is used as backup/transfer data, not as the live database.

## Recommendation and overdue rules

A task due before today's local `YYYY-MM-DD` value is overdue unless it is Completed. Due today is not overdue. Recommendations are grouped into overdue, today and upcoming, then High, Medium and Low priority. No timezone conversion is used for stored calendar dates.

## Known limitations and future improvements

- Single-user prototype; authentication is intentionally excluded.
- Profile preferences are demonstration fields.
- Import appends data rather than offering explicit replace/merge modes.
- Possible improvements include import replacement, cloud synchronization, reminders and automated browser tests.
