#!/bin/bash

# SmartNotes Backend Runner Script

echo "Starting SmartNotes FastAPI Server..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Please edit .env file with your configuration before running the server."
        exit 1
    else
        echo "Error: .env.example not found!"
        exit 1
    fi
fi

# Run the server
echo "Starting server on http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
