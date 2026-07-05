from fastapi import FastAPI, UploadFile, File
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