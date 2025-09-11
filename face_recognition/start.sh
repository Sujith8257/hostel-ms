#!/bin/bash

# Install requirements
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --host 0.0.0.0 --port 8085 --reload