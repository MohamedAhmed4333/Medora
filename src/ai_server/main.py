from fastapi import FastAPI, UploadFile, File,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib  
import numpy as np
import tensorflow as tf
from PIL import Image
import cv2
import io
import threading
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import os
import sys
from dotenv import load_dotenv
from typing import List, Dict


current_dir = os.path.dirname(os.path.abspath(__file__))      
src_dir = os.path.dirname(current_dir)                         
project_root = os.path.dirname(src_dir)                         
env_path = os.path.join(project_root, '.env')                   
load_dotenv(dotenv_path=env_path)

if not os.getenv("GOOGLE_API_KEY"):
    raise RuntimeError(f"GOOGLE_API_KEY not found — checked path: {env_path}")

from agent import agent_executor




app = FastAPI()
IMAGE_SIZE = (224, 224)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = joblib.load("gaussian_model.pkl")
le = joblib.load("label_encoder.pkl")

class DiagnosisRequest(BaseModel):
    symptoms: list[int]

@app.post("/predict")
def predict(data: DiagnosisRequest):
    try:
        input_data = np.array([data.symptoms])
        
        probabilities = model.predict_proba(input_data)[0]
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        
        top_3_results = []
        for idx in top_3_indices:
            disease_name = le.inverse_transform([idx])[0]
            confidence = probabilities[idx] * 100
            top_3_results.append({
                "disease": str(disease_name),
                "confidence": f"{confidence:.2f}%"
            })
            
        return {
            "status": "success",
            "predictions": top_3_results
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    

lock = threading.Lock()
XRAY_MODEL_PATH = "X_RAY_MOBILENET.keras"
xray_model = tf.keras.models.load_model(XRAY_MODEL_PATH)

@app.post("/predict-xray")
async def predict_xray(file: UploadFile = File(...)):
    try:
        request_object_content = await file.read()
        nparr = np.frombuffer(request_object_content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, IMAGE_SIZE)
        image = image.astype("float32")
        image = preprocess_input(image)
       
        image = np.expand_dims(image, axis=0)

        with lock:
            prediction = xray_model.predict(image, verbose=0)[0][0]
        detected_disease = "pneumonia" if prediction > 0.5 else "normal"

        return {"status": "success", "results": [detected_disease]}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    


MRI_model_Path = "brain_tumor_Mobilenet.keras"
MRI_Model = tf.keras.models.load_model(MRI_model_Path)
Class_names=['no_tumor','glioma','meningioma','pituitary']


@app.post("/predict-mri")
async def predict_mri(file: UploadFile = File(...)):
    try:
        request_object_content = await file.read()
        nparr = np.frombuffer(request_object_content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, IMAGE_SIZE)
        image = image.astype("float32")
        image = preprocess_input(image)
        image = np.expand_dims(image, axis=0)
        with lock:
            preds = MRI_Model.predict(image, verbose=0)[0][0]
            print(preds)
        class_index = np.argmax(preds)
        detected_disease = Class_names[class_index]
        confidence = float(preds[class_index])
        return {
            "status": "success",
            "results": [detected_disease],
            "confidence": confidence
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    

class ChatMessage(BaseModel):
    patient_id: str
    user_message: str
    chat_history: List[Dict[str, str]] = []


import traceback

# @app.post("/api/chat")
# async def chat_with_agent(data: ChatMessage):
#     try:
#         print("Chat history received:", data.chat_history)  
#         agent_input = {
#             "input": f"[SYSTEM INFO: Current Patient ID is {data.patient_id}] {data.user_message}",
#             "chat_history": data.chat_history
#         }
#         result = agent_executor.invoke(agent_input)
        
#         output = result.get("output", "")

#         if isinstance(output, list):
#             texts = []
#             for item in output:
#                 if isinstance(item, dict) and item.get("type") == "text":
#                     texts.append(item.get("text", ""))
#                 elif isinstance(item, str):
#                     texts.append(item)
#             output = "".join(texts).strip()
#         elif not isinstance(output, str):
#             output = str(output)

#         return {"reply": output}
#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))

import json

def extract_diagnosis(output: str):
    """يفصل الماركر بتاع التشخيص عن النص العادي"""
    marker = "[[DIAGNOSIS_READY]]"
    if marker not in output:
        return output.strip(), None

    parts = output.split(marker)
    clean_text = parts[0].strip()
    diagnosis_data = None

    try:
        json_part = parts[1].strip()
        diagnosis_data = json.loads(json_part)
    except (IndexError, json.JSONDecodeError):
        diagnosis_data = None

    return clean_text, diagnosis_data


@app.post("/api/chat")
async def chat_with_agent(data: ChatMessage):
    try:
        print("Chat history received:", data.chat_history)  
        agent_input = {
            "input": f"[SYSTEM INFO: Current Patient ID is {data.patient_id}] {data.user_message}",
            "chat_history": data.chat_history
        }
        result = agent_executor.invoke(agent_input)
        output = result.get("output", "")

        if isinstance(output, list):
            texts = [item.get("text", "") if isinstance(item, dict) else str(item) for item in output]
            output = "".join(texts).strip()
        elif not isinstance(output, str):
            output = str(output)

        clean_text, diagnosis_data = extract_diagnosis(output)

        return {
            "reply": clean_text,
            "diagnosis_ready": diagnosis_data is not None,
            "diagnosis_data": diagnosis_data
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
from firebase_admin import auth, firestore

# Initialize Firestore client (requires Firebase app to be initialized elsewhere in the project)
db = firestore.client()

from firebase_admin import auth
import secrets

def create_doctor_account(email: str, fullname: str, specialty: str, slot_duration: str, working_hours: dict) -> dict:
    try:
        # 1. اعمل حساب في Firebase Authentication بباسورد مؤقت عشوائي
        temp_password = secrets.token_urlsafe(12)

        user_record = auth.create_user(
            email=email,
            password=temp_password,
            display_name=fullname,
        )
        
        db.collection("users").document(user_record.uid).set({
            "uid": user_record.uid,
            "fullname": fullname,
            "email": email,
            "role": "doctor",
            "specialty": specialty,
            "slotDuration": slot_duration,
            "workingHours": working_hours,
            "createdAt": firestore.SERVER_TIMESTAMP,
        })
        return {
            "status": "success",
            "uid": user_record.uid,
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
    

from typing import Dict

class WorkingDay(BaseModel):
    start: str
    end: str

class CreateDoctorRequest(BaseModel):
    email: str
    fullname: str
    specialty: str
    slotDuration: str
    workingHours: Dict[str, WorkingDay]

@app.post("/api/admin/create-doctor")
async def create_doctor(data: CreateDoctorRequest):
    working_hours_dict = {
        day: {"start": wh.start, "end": wh.end}
        for day, wh in data.workingHours.items()
    }

    result = create_doctor_account(
        data.email, data.fullname, data.specialty, data.slotDuration, working_hours_dict
    )
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

def delete_doctor_account(doctor_uid: str) -> dict:
    try:
        # هات الحجوزات اللي حالتها "upcoming" أو "cancelled" بس، واسيب "completed" كسجل تاريخي
        appointments_query = db.collection("appointments").where(
            "doctorId", "==", doctor_uid
        ).where("status", "in", ["upcoming", "cancelled"]).stream()

        appointments_list = list(appointments_query)

        batch = db.batch()
        for appt_doc in appointments_list:
            batch.delete(appt_doc.reference)
        batch.commit()

        auth.delete_user(doctor_uid)
        db.collection("users").document(doctor_uid).delete()

        return {
            "status": "success",
            "deleted_appointments_count": len(appointments_list)
        }

    except auth.UserNotFoundError:
        return {"status": "error", "message": "Doctor not found in Authentication"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.delete("/api/admin/delete-doctor/{doctor_uid}")
async def delete_doctor(doctor_uid: str):
    result = delete_doctor_account(doctor_uid)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


# أضف هذه الأسطر في نهاية ملف main.py
if __name__ == "__main__":
    import uvicorn
    # Render يخصص البورت في متغير بيئة اسمه PORT
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
