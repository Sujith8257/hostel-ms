import importlib, importlib.metadata

try:
    ver = importlib.metadata.version('mediapipe')
    print('mediapipe version:', ver)
except Exception as e:
    print('cannot read mediapipe version:', e)

try:
    import mediapipe.solutions.face_detection as fd
    print('Imported mediapipe.solutions.face_detection OK:', fd)
except Exception as e:
    print('Error importing mediapipe.solutions.face_detection:', repr(e))

try:
    import mediapipe as mp
    print('Imported mediapipe as mp OK')
except Exception as e:
    print('Importing mediapipe as mp error:', repr(e))
