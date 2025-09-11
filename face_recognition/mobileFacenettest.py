import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from scipy.spatial.distance import cosine

# Load MobileFaceNet TFLite model
interpreter = tf.lite.Interpreter(model_path="output_model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Mediapipe Face Detector
mp_face_detection = mp.solutions.face_detection

def get_face_embedding(face_img):
    # Preprocess image
    face_img = cv2.resize(face_img, (112, 112))
    face_img = face_img.astype(np.float32) / 255.0
    face_img = np.expand_dims(face_img, axis=0)

    # Run inference
    interpreter.set_tensor(input_details[0]['index'], face_img)
    interpreter.invoke()
    embedding = interpreter.get_tensor(output_details[0]['index'])[0]

    # Normalize embedding
    return embedding / np.linalg.norm(embedding)

# Open webcam
cap = cv2.VideoCapture(0)

stored_embedding = None
print("Press 'r' to register your face, 'q' to quit.")

with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.7) as face_detection:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_detection.process(rgb_frame)

        if results.detections:
            for detection in results.detections:
                bboxC = detection.location_data.relative_bounding_box
                h, w, _ = frame.shape
                x, y, w_box, h_box = int(bboxC.xmin * w), int(bboxC.ymin * h), int(bboxC.width * w), int(bboxC.height * h)
                face_crop = frame[y:y+h_box, x:x+w_box]

                if face_crop.size > 0:
                    cv2.rectangle(frame, (x, y), (x+w_box, y+h_box), (0, 255, 0), 2)

                    key = cv2.waitKey(1) & 0xFF
                    if key == ord('r'):  # Register face
                        stored_embedding = get_face_embedding(face_crop)
                        print("✅ Face registered.")
                    elif stored_embedding is not None:
                        current_embedding = get_face_embedding(face_crop)
                        similarity = 1 - cosine(stored_embedding, current_embedding)
                        if similarity > 0.9:
                            cv2.putText(frame, "Login Success ✅", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
                        else:
                            cv2.putText(frame, "Login Failed ❌", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

        cv2.imshow("Face Authentication", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
