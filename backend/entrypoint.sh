#!/bin/bash
set -e

mkdir -p /app/data

echo "Running migrations..."
alembic upgrade head
echo "Migrations complete."

echo "Running seed..."
python3 seed.py
echo "Seed complete."

echo "Starting server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
