# # import face_recognition
# # import os

# # known_encodings = []
# # known_names = []

# # for filename in os.listdir("known_faces"):
# #     image = face_recognition.load_image_file(f"known_faces/{filename}")
# #     encodings = face_recognition.face_encodings(image)
# #     if encodings:
# #         known_encodings.append(encodings[0])
# #         known_names.append(os.path.splitext(filename)[0])
# import face_recognition
# import os
# from PIL import Image
# import numpy as np

# known_encodings = []
# known_names = []

# for filename in os.listdir("known_faces"):
#     path = os.path.join("known_faces", filename)

#     # Open and convert image to RGB
#     img = Image.open(path).convert("RGB")
#     image = np.array(img)

#     encodings = face_recognition.face_encodings(image)
#     if encodings:
#         known_encodings.append(encodings[0])
#         known_names.append(os.path.splitext(filename)[0])

# print("Encoding complete!")

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
        # Open image and force convert to RGB
        img = Image.open(path)
        print(f" - Original mode: {img.mode}, size: {img.size}, format: {img.format}")

        img = img.convert("RGB")
        image = np.array(img)

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
