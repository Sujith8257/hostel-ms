def detect_missing_person(image_path):
    unknown_image = face_recognition.load_image_file(image_path)
    unknown_encodings = face_recognition.face_encodings(unknown_image)

    for unknown_encoding in unknown_encodings:
        results = face_recognition.compare_faces(known_encodings, unknown_encoding)
        for i, match in enumerate(results):
            if match:
                return f"Match found: {known_names[i]}"
    return "No match found"
