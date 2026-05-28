# Daily Goal Dashboard — Project Overview

## What this is

A full-stack personal daily tracking dashboard built with Next.js 14. The app lets a user log and review their fitness, health, productivity, and learning habits each day. Data persists locally via SQLite and historical trends are visualized with interactive charts.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Slate theme) |
| Database | SQLite via better-sqlite3 |
| Charts | Recharts |
| Icons | lucide-react |
| Date utilities | date-fns |

---

## Project structure

```
daily-dashboard/
├── app/
│   ├── page.tsx               # Main dashboard (today view)
│   ├── history/
│   │   └── page.tsx           # Historical charts page
│   └── api/
│       ├── logs/route.ts      # Generic key-value logs (steps, sleep, learning)
│       ├── habits/route.ts    # Daily habit completion tracking
│       ├── workouts/route.ts  # Workout sets/reps/weight logger
│       ├── food/route.ts      # Food and calorie logger
│       └── history/route.ts   # Aggregated data for charts
├── components/
│   ├── DateNav.tsx            # Prev/next day navigation bar
│   └── sections/
│       ├── FitnessSection.tsx
│       ├── HealthSection.tsx
│       ├── ProductivitySection.tsx
│       └── LearningSection.tsx
├── lib/
│   └── db.ts                  # SQLite connection and table initialization
└── data/
    └── dashboard.db           # SQLite database file (auto-created on first run)
```

---

## Database schema

### `logs`
General-purpose key-value log for numeric and text entries.
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
date TEXT NOT NULL              -- YYYY-MM-DD
category TEXT NOT NULL          -- fitness | health | productivity | learning
key TEXT NOT NULL               -- e.g. steps, learning_minutes, wakeup_time
value TEXT NOT NULL
created_at TEXT DEFAULT (datetime('now'))
```

### `habits`
Binary daily habit completion.
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
date TEXT NOT NULL
habit TEXT NOT NULL
completed INTEGER DEFAULT 0     -- 0 or 1
```

### `workouts`
Individual exercise sets.
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
date TEXT NOT NULL
exercise TEXT NOT NULL
sets INTEGER
reps INTEGER
weight_lbs REAL
notes TEXT
```

### `food_log`
Meals and calorie entries.
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
date TEXT NOT NULL
meal TEXT                        -- breakfast | lunch | dinner | snack
description TEXT NOT NULL
calories INTEGER
```

---

## Pages

### `/` — Main dashboard
- Date navigation bar at the top (prev/next day, jump to today)
- Four tabbed sections: Fitness, Health, Productivity, Learning
- Each section has input forms and displays today's saved entries below
- Streak counters per habit (consecutive days logged)

### `/history` — Historical view
- Line chart: daily steps over 30 days
- Bar chart: daily calories over 30 days
- Area chart: daily learning minutes over 30 days
- Monthly summary cards showing averages for all tracked metrics

---

## Sections

### Fitness
- **Step tracker** — numeric input saved to `logs` (key: `steps`)
- **Workout logger** — exercise name, sets, reps, weight saved to `workouts`

### Health
- **Food logger** — meal type (dropdown), description, calories saved to `food_log`
- Running calorie total displayed per day, grouped by meal

### Productivity
- **Wake up time** and **bedtime** inputs saved to `logs` (keys: `wakeup_time`, `bedtime`)
- Auto-calculates and displays total sleep hours

### Learning
- **Minutes logged** with a topic/task name saved to `logs` (key: `learning_minutes`)
- Shows all learning sessions for the selected day

---

## Key behaviors

- Default date is always today; user can navigate to any past or future date
- All data is scoped by date — each API route accepts a `?date=YYYY-MM-DD` query param
- SQLite database is created automatically on first run at `data/dashboard.db`
- Streaks are calculated server-side by querying consecutive days with entries
- Dark mode is the default theme

---

## Running the project

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`. The SQLite database file is created automatically on first request.
