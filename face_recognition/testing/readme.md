Here teh differnet testing  for each of the server and API will be done;

# 📖 Documentation: Face Recognition Backend with FastAPI

## 1. Project Structure

```
Missing_Person_Detection/
│── main.py                  # FastAPI app
│── models/                  # Store user images
│   └── hit.jpg
│── requirements.txt         # Dependencies
```

---

## 2. Install Dependencies

```bash
pip install fastapi uvicorn face-recognition python-multipart
```

---

## 3. main.py (Backend Code)

```python
from fastapi import FastAPI, UploadFile, Form
import face_recognition
import numpy as np
import shutil
import os

app = FastAPI()

REGISTERED_USERS = "models"

# Ensure folder exists
os.makedirs(REGISTERED_USERS, exist_ok=True)


@app.post("/register/")
async def register_user(user_id: str = Form(...), file: UploadFile = None):
    file_path = os.path.join(REGISTERED_USERS, f"{user_id}.jpg")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"success": True, "message": f"User {user_id} registered successfully"}


@app.post("/authenticate/")
async def authenticate(user_id: str = Form(...), file: UploadFile = None):
    # Load registered image
    reg_path = os.path.join(REGISTERED_USERS, f"{user_id}.jpg")
    if not os.path.exists(reg_path):
        return {"success": False, "message": "User not registered"}

    registered_image = face_recognition.load_image_file(reg_path)
    registered_encoding = face_recognition.face_encodings(registered_image)[0]

    # Load uploaded image
    temp_path = f"temp_{user_id}.jpg"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    unknown_image = face_recognition.load_image_file(temp_path)
    unknown_encoding = face_recognition.face_encodings(unknown_image)[0]

    # Compare faces
    similarity = np.dot(registered_encoding, unknown_encoding) / (
        np.linalg.norm(registered_encoding) * np.linalg.norm(unknown_encoding)
    )

    os.remove(temp_path)

    return {"success": True, "similarity": float(similarity)}
```

---

## 4. Run the Server

```bash
uvicorn main:app --reload
```

It will start at:
👉 `http://127.0.0.1:8000`

---

## 5. Swagger UI (Built-in API Testing)

Go to:
👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

There you can **upload an image and user\_id** directly from the browser to test `/register/` and `/authenticate/`.

---

## 6. Testing with cURL in Windows PowerShell

⚠️ PowerShell doesn’t interpret `\` like Linux. Also, its `curl` is actually `Invoke-WebRequest`.
Use \**backticks (\`) instead of \** or split commands into one line.

### ✅ Register User

```powershell
curl -Method POST "http://127.0.0.1:8000/register/" -Form user_id=hit -Form file="@hitesh1.jpg"
```

### ✅ Authenticate

```powershell
curl -Method POST "http://127.0.0.1:8000/authenticate/" -Form user_id=hit -Form file="@hitesh2.jpg"
```

### Expected Response

```json
{"success": true, "similarity": 0.60}
```

---

## 7. Alternative: Use `httpie` (Easier than PowerShell curl)

If PowerShell curl still gives errors, install [httpie](https://httpie.io/cli):

```bash
pip install httpie
```

Then run:

```bash
http -f POST http://127.0.0.1:8000/register/ user_id=hit file@hitesh1.jpg
http -f POST http://127.0.0.1:8000/authenticate/ user_id=hit file@hitesh2.jpg
```

---

✅ That covers:

* FastAPI backend
* Swagger UI testing
* Windows PowerShell cURL testing
