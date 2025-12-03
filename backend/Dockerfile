FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /django

# Install build tools and dependencies for scientific packages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    gfortran \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . .

# Normalize line endings & make script executable
RUN dos2unix ./start.sh && chmod +x ./start.sh

EXPOSE 8000