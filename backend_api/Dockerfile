FROM python:3.9-slim
# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Set the working directory
WORKDIR /app            
# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libpq-dev \
    fonts-liberation \
    fonts-dejavu \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*
# Install Python dependencies
COPY requirement.txt /app/
RUN pip install --no-cache-dir -r requirement.txt
# Copy the application code
COPY . /app/
# Expose the port the app runs on
EXPOSE 8000
# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
