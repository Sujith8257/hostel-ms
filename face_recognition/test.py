import face_recognition
import os
from PIL import Image
import numpy as np

known_encodings = []
known_names = []

known_faces_dir = "known_faces"

for filename in os.listdir(known_faces_dir):
    path = os.path.join(known_faces_dir, filename)
    print(f"\n[INFO] Processing: {path}")

    try:
        img = Image.open(path).convert("RGB")
        image = np.array(img)

        # Ensure dtype is uint8
        if image.dtype != np.uint8:
            print(f" - Converting dtype from {image.dtype} to uint8")
            image = image.astype(np.uint8)

        print(f" - Final dtype: {image.dtype}, shape: {image.shape}")

        # Try encoding
        encodings = face_recognition.face_encodings(image)

        if encodings:
            known_encodings.append(encodings[0])
            name = os.path.splitext(filename)[0]
            known_names.append(name)
            print(f" ✅ Face found and encoded for: {name}")
        else:
            print(" ⚠️ No face detected in this image.")

    except Exception as e:
        print(f" ❌ Error processing {filename}: {e}")

print("\n[SUMMARY]")
print(f"Total images processed: {len(os.listdir(known_faces_dir))}")
print(f"Faces encoded: {len(known_encodings)}")
