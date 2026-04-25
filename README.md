# Qurban App

Qurban App is a Laravel + Inertia (React/TypeScript) application for managing qurban events by year.  
It covers participant registration, qurban animal/quota management, procurement spending, transaction tracking, meat-yield tracking, and a public report page.

## Main Features

- Event-year based data separation.
- Submitter management (peserta) with participant detail and payment history.
- Qurban management for cow/sheep with quota and participant linking.
- Participant management with qurban assignment and quota checks.
- Procurement list and payment tracking.
- Transaction ledger (cash in/out), including:
  - general transaction,
  - `submitter_payment` (`Setoran Peserta`),
  - `procurement_payment` (`Pembayaran Pembelanjaan`).
- Meat yield page with configurable distribution settings.
- Public report page with participant/procurement recap and optional meat-yield summary.
- Audit log page with filtering support.

## Tech Stack

- Backend: Laravel
- Frontend: Inertia.js + React + TypeScript
- Build tools: Vite, Tailwind CSS
- Database: MySQL/MariaDB (or any Laravel-supported relational DB)

## Requirements

- PHP 8.2+ (recommended)
- Composer
- Node.js 18+ and npm
- Database server

## Local Setup

1. Clone the repository.
2. Install backend dependencies:

```bash
composer install
```

3. Install frontend dependencies:

```bash
npm install
```

4. Copy environment file:

```bash
cp .env.example .env
```

5. Generate app key:

```bash
php artisan key:generate
```

6. Configure database credentials in `.env`.
7. Run migrations:

```bash
php artisan migrate
```

8. (Optional) Seed initial data:

```bash
php artisan db:seed
```

## Run in Development

Use separate terminals:

```bash
php artisan serve
```

```bash
npm run dev
```

Then open the app URL from Laravel dev server, usually `http://127.0.0.1:8000`.

## Build for Production

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Deployment Steps

1. Provision server with PHP, Composer, Node.js, web server (Nginx/Apache), and database.
2. Clone project to server.
3. Install dependencies:
   - `composer install --no-dev --optimize-autoloader`
   - `npm install`
4. Configure `.env` for production (APP_ENV, APP_DEBUG=false, DB, mail, etc.).
5. Run migrations:
   - `php artisan migrate --force`
6. Build frontend:
   - `npm run build`
7. Cache Laravel configuration/routes/views:
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan view:cache`
8. Configure web server document root to `public/`.
9. Set correct writable permissions for `storage/` and `bootstrap/cache/`.
10. Set up process manager/queue scheduler if used by your environment.

## Useful Commands

- Run tests: `php artisan test`
- Clear caches: `php artisan optimize:clear`
- Re-run migrations fresh (development only): `php artisan migrate:fresh --seed`
