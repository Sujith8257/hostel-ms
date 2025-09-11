import face_recognition
import numpy as np

# Create a dummy uint8 RGB image
dummy = np.zeros((100, 100, 3), dtype=np.uint8)

try:
    enc = face_recognition.face_encodings(dummy)
    print("✅ face_recognition accepted dummy image (but no face expected).")
except Exception as e:
    print("❌ Even dummy image failed:", e)
