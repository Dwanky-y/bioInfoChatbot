#!/bin/bash
# Run this script to start all services, but run at your own risk. 
# 
# Exiting the terminal does not automatically stop the services, 
# so be ready to kill them manually if needed.  For example:
# lsof -i :5001 //  Get the process ID (PID) using the port number
# kill <PID> // Kill the process using the PID


PROJECT_DIR="$(pwd)"

# Run Chroma
# Quote the volume path so spaces in $PROJECT_DIR don't break the docker args.
docker run -p 8000:8000 -v "$PROJECT_DIR"/backend/chroma_data:/data ghcr.io/chroma-core/chroma:latest &

# Run Ollama
ollama serve &

# Run Backend
# Change into backend using a quoted path; fail fast if cd doesn't work.
cd "$PROJECT_DIR/backend" || { echo "Failed to cd to $PROJECT_DIR/backend"; exit 1; }
node server.js &

# Run Frontend
# Return to project root explicitly and start the frontend.
cd "$PROJECT_DIR" || { echo "Failed to cd to $PROJECT_DIR"; exit 1; }
npm run dev &