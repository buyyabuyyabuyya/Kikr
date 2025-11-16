# FaceFusion backend Dockerfile
FROM python:3.10-slim

# Install system deps for FaceFusion & FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server.py ./

ENV PORT=8080
EXPOSE 8080

CMD ["python", "server.py"]
