import os
import uuid
from facefusionlib import swapper
from facefusionlib.swapper import DeviceProvider
import tempfile
import shutil
from flask import Flask, request, jsonify, send_from_directory, abort
import requests

app = Flask(__name__, static_folder="static")

# Ensure static directory exists for serving results
os.makedirs(app.static_folder, exist_ok=True)

def download_to_temp(url: str) -> str:
    """Download image from URL to a temporary file and return its path."""
    response = requests.get(url, timeout=30)
    if response.status_code != 200:
        raise ValueError(f"Failed to download {url}: {response.status_code}")
    suffix = os.path.splitext(url.split("?")[0])[1] or ".jpg"
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(tmp_fd, "wb") as tmp_file:
        tmp_file.write(response.content)
    return tmp_path

@app.route("/swap", methods=["POST"])
def swap_faces():
    data = request.get_json(force=True, silent=True)
    if not data or "target_url" not in data or "face_url" not in data:
        return jsonify({"error": "target_url and face_url required"}), 400

    target_url = data["target_url"]
    face_url = data["face_url"]

    try:
        source_path = download_to_temp(target_url)
        face_path = download_to_temp(face_url)

        output_filename = f"swap_{uuid.uuid4().hex}.png"
        output_path = os.path.join(app.static_folder, output_filename)

        try:
            swapper.swap_face(
                source_paths=[source_path],
                target_path=face_path,
                output_path=output_path,
                provider=DeviceProvider.CPU,
                skip_nsfw=True,
            )
        except Exception as e:
            return jsonify({"error": "FaceFusion failed", "details": str(e)}), 500

        public_url = request.host_url.rstrip("/") + "/static/" + output_filename
        return jsonify({"result_url": public_url})

    finally:
        # Clean up temp files
        for path in [locals().get("source_path"), locals().get("face_path")]:
            if path and os.path.exists(path):
                os.unlink(path)

@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

@app.route("/")
def index():
    return "FaceFusion backend is running!", 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
