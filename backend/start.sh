#!/bin/sh

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start the application
honcho start -f Procfile