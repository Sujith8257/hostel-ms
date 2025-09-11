import cv2
import numpy as np
import tensorflow as tf
from scipy.spatial.distance import cosine
import mediapipe as mp

# Load MobileFaceNet TFLite model
interpreter = tf.lite.Interpreter(model_path="C:\\Users\\navad\\Missing_Person_Detection\\output_model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

mp_face_detection = mp.solutions.face_detection

def get_face_embedding(image_path):
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    h, w, _ = img.shape

    # Run Mediapipe face detection
    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.7) as face_detection:
        results = face_detection.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

        if not results.detections:
            raise ValueError(f"No face detected in {image_path}")

        # Take first detected face
        bboxC = results.detections[0].location_data.relative_bounding_box
        x, y, w_box, h_box = int(bboxC.xmin * w), int(bboxC.ymin * h), int(bboxC.width * w), int(bboxC.height * h)

        # Crop face (with safety check)
        x, y = max(0, x), max(0, y)
        face_crop = img[y:y+h_box, x:x+w_box]
        if face_crop.size == 0:
            raise ValueError(f"Face crop invalid in {image_path}")

        # Preprocess for MobileFaceNet
        face_crop = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
        face_crop = cv2.resize(face_crop, (112, 112))
        face_crop = face_crop.astype(np.float32) / 255.0
        face_crop = np.expand_dims(face_crop, axis=0)

        # Run TFLite inference
        interpreter.set_tensor(input_details[0]['index'], face_crop)
        interpreter.invoke()
        embedding = interpreter.get_tensor(output_details[0]['index'])[0]

        return embedding / np.linalg.norm(embedding)

# Test images
face1 = r"C:\Users\navad\Missing_Person_Detection\known_faces\s.jpg"
face2 = r"C:\Users\navad\Missing_Person_Detection\known_faces\aaditya.jpg"

emb1 = get_face_embedding(face1)
emb2 = get_face_embedding(face2)

# Cosine similarity
similarity = 1 - cosine(emb1, emb2)
print("🔍 Cosine Similarity:", similarity)

if similarity > 0.9:
    print("✅ Likely same person")
else:
    print("❌ Different person")
