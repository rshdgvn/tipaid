# Use lightweight Python image
FROM python:3.12-alpine

# Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /django

# Copy requirements and install
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code
COPY . .

# Expose the port the Django app will run on
EXPOSE 8000

# Run database migrations and start the server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver"]
