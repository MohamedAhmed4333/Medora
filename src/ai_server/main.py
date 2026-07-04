from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib  
import numpy as np

app = FastAPI()


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