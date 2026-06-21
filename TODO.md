# Project Tracker — Development TODO

Step-by-step execution guide for building the project tracker with Claude Code.
Single Laravel app with React (Vite) inside `resources/js`.

> **Approach notes (follow throughout):**
> - Commit after each task (`git commit -m "task N: ..."`) so you can roll back cleanly if Claude Code takes a wrong turn.
> - Run **one task per session** and verify before starting the next — errors compound.
> - When a bug appears, paste the **actual console error or `php artisan` output** back to Claude Code rather than describing it. The real output debugs far faster.

---

## Pre-flight (one-time, you do this)

```bash
# Verify versions
php -v          # need PHP 8.2+
composer -V
node -v         # need Node 18+
npm -v

# Create the project
composer create-project laravel/laravel project-tracker
cd project-tracker
git init && git add . && git commit -m "fresh laravel"
```

Put the `CLAUDE.md` in the project root, then open the folder in Claude Code.

---

## Task 1 — Scaffold

**Tell Claude Code:**
> Set up React 18 + Vite + Tailwind inside this Laravel 12 project. Configure the Vite React plugin, create the Tailwind entry in `resources/css/app.css`, build `resources/views/app.blade.php` as the SPA shell with `@vite([...])` and a `<div id="app">` root, and `resources/js/app.jsx` as the React entry that mounts `<App/>`. Set up React Router in `App.jsx`. Add a catch-all route in `web.php` that returns the SPA Blade shell so React Router owns all client routes. Verify the dev server renders a placeholder page.

**Commands you'll run:**
```bash
npm install
composer require laravel/sanctum
php artisan install:api          # publishes Sanctum config + migration, creates routes/api.php

npm install react react-dom
npm install -D @vitejs/plugin-react
npm install axios zustand react-router-dom
npm install -D tailwindcss @tailwindcss/vite

# Configure .env for MySQL, create the database, then:
mysql -u root -e "CREATE DATABASE project_tracker;"
php artisan migrate

# Two terminals:
php artisan serve                # backend — http://localhost:8000
npm run dev                      # Vite HMR
```

**Verify before moving on:** placeholder page loads through Laravel, React Router navigates between two placeholder routes, no console errors.

---

## Task 2 — Database & Models

**Tell Claude Code:**
> Create migrations + Eloquent models for: projects, goals, categories, tasks (per CLAUDE.md schema). Set up all relationships (User→Project→Goal→Task, Task→Category). Add `$fillable` and `$casts` (dates, booleans). Create factories for each model and a seeder with one user, default categories (Design, Dev, Marketing, Research), and a few sample projects/goals/tasks.

**Commands:**
```bash
php artisan migrate:fresh --seed
```

**Verify:** `php artisan tinker` → `App\Models\Project::with('goals.tasks')->first()` returns nested data correctly.

---

## Task 3 — Auth (Sanctum SPA)

**Tell Claude Code:**
> Build Sanctum SPA cookie auth. Create `AuthController` (register, login, logout, user) with Form Request validation. Public auth routes + everything else behind `auth:sanctum` in `api.php`. Configure `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, and CORS `supports_credentials`. On the frontend: `api/axios.js` with `withCredentials: true`, `authStore.js` (Zustand), `Login.jsx`, `Register.jsx`, a protected-route wrapper, and a 401 interceptor that redirects to login. Hit `/sanctum/csrf-cookie` before login.

**Verify:** register → login → session persists on refresh → logout clears it. Hitting a protected route while logged out redirects to login.

---

## Task 4 — Projects CRUD

**Tell Claude Code:**
> Build full Projects CRUD. `ProjectController` (index, store, show, update, destroy), `ProjectPolicy` scoping to the owner, Store/Update Form Requests, and `ProjectResource` exposing a computed `progress`. Frontend: `projectStore.js`, `Projects.jsx` (list + create modal), `ProjectCard.jsx` (name, dates, status, mini progress bar), plus `StatusBadge.jsx` and `ProgressBar.jsx` components.

**Verify:** create/edit/delete a project works, list shows only the logged-in user's projects, progress bar renders (0% with no goals yet).

---

## Task 5 — Goals CRUD

**Tell Claude Code:**
> Build Goals CRUD nested under projects. `GoalController` (store nested under project + show/update/destroy), `GoalPolicy`, Form Requests, `GoalResource` with computed `status`. Frontend: `ProjectDetail.jsx` listing goals with create, `GoalCard.jsx` (title, deadline, progress bar, status badge). Link project cards to the project detail route.

**Verify:** open a project → add a goal → it appears with a deadline and status badge → clicking through to goal detail route works.

---

## Task 6 — Tasks CRUD + Categories

**Tell Claude Code:**
> Build Tasks CRUD and Categories. `CategoryController` (index, store), `TaskController` (index, store, update, destroy), `TaskPolicy`, Form Requests, `TaskResource`. On toggle, set `is_done` + `completed_at`. Frontend: `GoalDetail.jsx` with `TaskTimeline.jsx` (vertical timeline ordered by deadline), `TaskItem.jsx` (checkbox, title, category chip, deadline, overdue highlight), `CategoryChip.jsx`. Add/edit/delete task UI and create-category UI. Toggle optimistically, then reconcile with the API response.

**Verify:** add tasks with categories and deadlines → they render as a timeline → checking a task marks it done and sets completed_at → overdue tasks highlight red.

---

## Task 7 — Progress Engine

**Tell Claude Code:**
> Implement the derived progress/status engine. `Goal::getProgressAttribute()` = done/total tasks %. `Goal::getStatusAttribute()` = completed / overdue / in_progress / not_started. `Project::getProgressAttribute()` = task-count–weighted average across its goals. Surface `progress` and `status` in all Resources and eager-load (`with('goals.tasks')`) to avoid N+1. On the frontend, recalculate progress bars and status badges live after a task toggle.

**Verify:** checking a task immediately updates goal progress %, project progress %, and the status badge color — with no page reload and no N+1 query warnings.

---

## Task 8 — Dashboard & Polish

**Tell Claude Code:**
> Build the dashboard and final polish. `DashboardController` → `GET /api/dashboard` returning the overall average progress across all projects, a per-project summary, and counts (total/completed/overdue goals). Frontend: `Dashboard.jsx` with `ProgressRing.jsx` showing the average, a project grid with progress + status, overdue highlighting throughout, empty states (no projects/goals/tasks), loading skeletons, error toasts, and a responsive pass mobile→desktop.

**Commands:**
```bash
npm run build                    # production build → public/build
php artisan config:cache
php artisan route:cache
```

**Verify:** dashboard average matches a hand-calculated value, project grid links work, production build serves correctly through Laravel.

---

## Deploy prep (Hostinger)

**Tell Claude Code:**
> Produce a `.env.production` template and a Hostinger deployment checklist (document root → /public, HTTPS, build upload, migration commands).

**Commands:**
```bash
npm run build
# Upload to Hostinger, point domain to /public, set production .env, then:
php artisan migrate --force
php artisan db:seed --force      # default categories only in prod
php artisan config:cache
php artisan route:cache
```

**Verify:** app loads on the live domain, register/login works, full create-project→goal→task→progress flow works in production.

---

## Stretch (post-MVP)
- Drag-to-reorder tasks (updates `order`)
- Filter tasks by category on goal detail
- Goal/project timeline (Gantt-style) view
- Activity log of completed tasks
- Charts: progress over time