# Smart Component Storage — Backend (Python / FastAPI)

Backend for the SIH 2026 "Smart Component Storage" mobile app: sign-in,
inventory tabulation, customisable per-cabinet temperature/humidity
setpoints, and automatic email alerts as components approach their
manufacturer shelf-life limit.

## 1. Setup

```bash
cd smart_storage_backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set SECRET_KEY and SMTP_USERNAME/SMTP_PASSWORD
# (for Gmail, SMTP_PASSWORD must be a 16-character "App Password", not your normal password)
```

## 2. Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000/docs` for interactive Swagger docs — point your
mobile app's HTTP client at `http://<your-machine-ip>:8000` (use your
computer's LAN IP, not `localhost`, when testing from a phone).

## 3. Sign-in flow for the mobile app

1. `POST /auth/signup` — `{full_name, email, password}`. The **email is where
   shelf-life alerts get sent**, so this doubles as alert registration.
2. `POST /auth/login` — OAuth2 form fields `username` (=email) + `password`.
   Returns a JWT `access_token`.
3. Store the token on-device (e.g. secure storage / keychain) and send it as
   `Authorization: Bearer <token>` on every subsequent request.

## 4. Inventory table endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/inventory` | Add a new component/batch row |
| GET | `/inventory` | List inventory (filter by `category`, `cabinet_location`, `search`, or `sort_by_fefo=true`) |
| GET | `/inventory/{id}` | Get one row |
| PATCH | `/inventory/{id}` | Edit any field (e.g. update quantity, min/max temp, humidity, shelf life) |
| POST | `/inventory/{id}/mark-accessed` | Sets `last_accessed_date` to today |
| DELETE | `/inventory/{id}` | Remove a row |

Each returned row includes the raw tabulated fields **plus** computed
`days_in_storage`, `days_until_shelf_life`, and `status`
(`OK` / `APPROACHING_LIMIT` / `EXPIRED`) so the app can colour-code rows
without doing date math client-side.

## 5. Cabinet temperature/humidity customisation

| Method | Path | Purpose |
|---|---|---|
| POST | `/cabinet` | Register a cabinet/location with a target temp & humidity |
| GET | `/cabinet` | List all cabinets + their live status |
| PATCH | `/cabinet/{location}` | User customises the setpoint (e.g. when swapping stored components) |
| POST | `/cabinet/{location}/telemetry` | Called by the ESP32 to push a live sensor reading; auto-emails on violation |

## 6. Automatic shelf-life email alerts

A background job (APScheduler, `app/services/scheduler.py`) runs every
`ALERT_CHECK_INTERVAL_HOURS` (default 12h, configurable in `.env`) and:

1. Computes `days_until_shelf_life` for every component.
2. If it's within `SHELF_LIFE_ALERT_THRESHOLD_DAYS` (default 7) of the
   limit, or already past it, emails the component owner's registered
   address with the batch details and a "prioritize for use/inspection"
   recommendation.
3. Logs every alert sent (`AlertLog` table) so the same component isn't
   emailed twice in one day.

No cron job or external scheduler needed — it starts automatically with the
FastAPI app (`@app.on_event("startup")`).

## 7. Project structure

```
smart_storage_backend/
├── app/
│   ├── main.py            # FastAPI app, CORS, router wiring, scheduler startup
│   ├── config.py          # settings loaded from .env
│   ├── database.py        # SQLAlchemy engine/session
│   ├── models.py          # User, Component, CabinetSetting, AlertLog
│   ├── schemas.py         # Pydantic request/response models
│   ├── auth.py            # password hashing + JWT
│   ├── routes/
│   │   ├── auth.py        # /auth/signup, /auth/login, /auth/me
│   │   ├── inventory.py   # /inventory CRUD
│   │   └── cabinet.py     # /cabinet setpoints + telemetry
│   └── services/
│       ├── email_service.py   # SMTP sending + HTML email templates
│       └── scheduler.py       # background shelf-life checker
├── requirements.txt
└── .env.example
```

## 8. Notes for your SIH demo

- **Database**: ships with SQLite (zero setup) via `DATABASE_URL` in `.env`.
  Swap to Postgres/MySQL for a more "production" demo by changing that one
  URL — no code changes needed.
- **ESP32 integration**: point your ESP32 firmware's HTTP POST at
  `/cabinet/{location}/telemetry` with JSON `{"temperature_c": .., "humidity_percent": ..}`.
- **Security for production**: the telemetry endpoint currently has no auth
  (so the ESP32 doesn't need to manage a user login) — before a real
  deployment, add a device API key header check to that route.
- **Mobile networking**: any framework (Flutter, React Native, Kotlin,
  Swift) can call this API over plain HTTP/JSON — it's not tied to a
  specific mobile stack.
