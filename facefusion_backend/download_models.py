# This script is run during the Docker build process to pre-download
# all the necessary models for FaceFusion. This avoids a timeout on the
# first request after a new deploy.

print("Downloading FaceFusion models...")

# Importing the swapper is enough to trigger the model downloads
from facefusionlib import swapper

print("Model download complete.")
