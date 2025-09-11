import dlib, numpy as np

img = np.zeros((100, 100, 3), dtype=np.uint8)

print("Type:", type(img), "dtype:", img.dtype, "shape:", img.shape)
detector = dlib.get_frontal_face_detector()
faces = detector(img, 1)
print("Faces found:", len(faces))
