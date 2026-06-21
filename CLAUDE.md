# CLAUDE.md — Project Tracker

Guidance for Claude Code when working in this repository.

## Overview

A project tracking application. Users create **projects**, each with a timeline. Each project has **goals** (with their own deadline), and each goal has **tasks** (with a category and deadline). Task completion drives goal progress %, project progress %, and a dashboard-wide average across all projects.

**Hierarchy:** `User → Project → Goal → Task` (Task belongs to a Category)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Laravel 12 (single app, hosts the SPA) |
| Auth | Laravel Sanctum (SPA cookie auth) |
| Database | MySQL |
| Frontend | React 18 + Vite (inside `resources/js`) |
| Styling | Tailwind CSS |
| State | Zustand |
| HTTP | Axios |
| Routing | React Router v6 |

## Project Structure (Single Laravel App)

One Laravel project. React lives inside `resources/js` and is built by Laravel's bundled Vite. No separate backend/frontend folders. One repo, one deploy to Hostinger.

```
project-tracker/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # Api controllers
│   │   ├── Requests/         # Form Request validation
│   │   └── Resources/        # API Resources (progress/status computed here)
│   ├── Models/               # Project, Goal, Task, Category
│   └── Policies/             # Ownership scoping
├── resources/
│   ├── js/                   # ── React SPA ──
│   │   ├── api/axios.js
│   │   ├── store/            # Zustand stores
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── app.jsx           # React entry (mounts into Blade root)
│   ├── css/
│   │   └── app.css           # Tailwind directives
│   └── views/
│       └── app.blade.php     # SPA shell (single Blade view)
├── routes/
│   ├── api.php               # All API endpoints (auth:sanctum)
│   └── web.php               # SPA catch-all → app.blade.php
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── vite.config.js
├── tailwind.config.js
├── CLAUDE.md
└── TODO.md
```

### How the SPA is served
- `web.php` has a catch-all route returning `app.blade.php` so React Router handles all client routes.
- `app.blade.php` includes `@vite(['resources/css/app.css', 'resources/js/app.jsx'])` and a `<div id="app">` root.
- API lives under `/api/*`, consumed by Axios from the React app.

## Auth Approach (Sanctum SPA)

Because frontend and backend share the same domain/origin, use **Sanctum SPA cookie auth** (not token headers):
- Frontend calls `GET /sanctum/csrf-cookie` before login.
- Axios configured with `withCredentials: true`.
- `auth:sanctum` middleware protects API routes.
- Set `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` in `.env`.

## Data Model

### projects
- `id`, `user_id` (FK), `name`, `description?`, `start_date`, `end_date`, `status` enum(`active`,`completed`,`archived`), timestamps

### goals
- `id`, `project_id` (FK), `title`, `description?`, `start_date`, `deadline`, `status` enum(`not_started`,`in_progress`,`completed`,`overdue`), timestamps

### categories
- `id`, `user_id` (FK), `name`, `color` (hex)

### tasks
- `id`, `goal_id` (FK), `category_id` (FK, nullable), `title`, `description?`, `deadline`, `is_done` (bool), `completed_at?`, `order` (int), timestamps

### Relationships
```
User    hasMany Project
Project belongsTo User,    hasMany Goal
Goal    belongsTo Project, hasMany Task
Task    belongsTo Goal,    belongsTo Category
Category belongsTo User,   hasMany Task
```

## Progress & Status Logic

**Never store progress.** Always derive it so it stays accurate.

- **Goal progress** = `doneTasks / totalTasks * 100` (0 if no tasks)
- **Project progress** = task-count–weighted average of its goals
  - = `total done tasks across all goals / total tasks across all goals * 100`
  - (weighting by task count prevents a 1-task goal counting equal to a 10-task goal)
- **Dashboard average** = mean of all projects' progress

**Goal status (derived on read):**
- `completed` — progress == 100
- `overdue` — past `deadline` and progress < 100
- `not_started` — 0 tasks done and none in progress
- `in_progress` — otherwise

Implement as Eloquent accessors / API Resource fields. Always eager-load (`Project::with('goals.tasks')`) to avoid N+1 queries.

## API Endpoints

All under `/api`, protected by `auth:sanctum` (except auth routes), scoped to the authenticated user via Policies.

```
# Auth
POST   /api/register
POST   /api/login
POST   /api/logout
GET    /api/user

# Dashboard
GET    /api/dashboard                 # avg progress + per-project summary

# Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}             # + nested goals & progress
PUT    /api/projects/{id}
DELETE /api/projects/{id}

# Goals
GET    /api/projects/{id}/goals
POST   /api/projects/{id}/goals
GET    /api/goals/{id}                # + tasks (timeline) & status
PUT    /api/goals/{id}
DELETE /api/goals/{id}

# Tasks
GET    /api/goals/{id}/tasks
POST   /api/goals/{id}/tasks
PUT    /api/tasks/{id}                # toggle is_done / edit
DELETE /api/tasks/{id}

# Categories
GET    /api/categories
POST   /api/categories
```

## Frontend Structure (`resources/js`)

```
resources/js/
├── api/axios.js              # axios instance, withCredentials, csrf
├── store/
│   ├── authStore.js
│   └── projectStore.js
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx         # average ring + project grid
│   ├── Projects.jsx          # list / create projects
│   ├── ProjectDetail.jsx     # goals + progress bars
│   └── GoalDetail.jsx        # task timeline + status badge
├── components/
│   ├── ProgressBar.jsx
│   ├── ProgressRing.jsx      # dashboard average
│   ├── ProjectCard.jsx
│   ├── GoalCard.jsx
│   ├── TaskTimeline.jsx      # vertical timeline, ordered by deadline
│   ├── TaskItem.jsx          # checkbox + category chip + deadline
│   ├── CategoryChip.jsx
│   └── StatusBadge.jsx
├── App.jsx                   # router + protected routes
└── app.jsx                   # entry, mounts <App/> into #app
```

## Conventions

- API returns JSON via Eloquent API Resources. Computed fields (`progress`, `status`) live in Resources.
- Use Form Request classes for validation.
- Keep server data in Zustand; recompute optimistically when a task is toggled, then reconcile with the API response.
- Tailwind only — no extra UI library required. Status colors: green=completed, amber=in_progress, slate=not_started, red=overdue.
- Dates: store as `date`, send/receive ISO strings.
- One Vite build pipeline (Laravel's). `npm run dev` for HMR during development, `npm run build` for production.

## Commands

```bash
composer install
npm install
cp .env.example .env && php artisan key:generate
# configure MySQL in .env
php artisan migrate --seed

# Development (two terminals)
php artisan serve
npm run dev

# Production build (for Hostinger)
npm run build
```

## Build Order

Follow `TODO.md` phases 1→8 in order. Each phase should be runnable before moving on. Commit after each task.