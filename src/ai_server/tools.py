import firebase_admin
from firebase_admin import credentials, firestore
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(current_dir, "serviceAccountKey.json")

cred = credentials.Certificate(cred_path)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

def fetch_patient_medical_record(patient_id: str) -> dict:
    """
    Fetches the patient's complete profile, including chronic history,
    and queries subcollections for the latest Vitals, Radiology Scans, and Symptoms AI results.
    """
    try:
        user_ref = db.collection("users").document(patient_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return {"error": "Patient record not found."}
            
        user_data = user_doc.to_dict()
        if user_data.get("role") != "patient":
            return {"error": "Access denied. Requested ID is not a patient."}
            
        complete_record = {
            "personal_info": {
                "name": user_data.get("fullname"),
                "age": user_data.get("age"),
                "gender": user_data.get("gender")
            },
            "lifestyle": user_data.get("lifestyle", []),
            "stats": user_data.get("stats", []),
            "latest_vitals": {},
            "latest_radiology_results": [],
            "latest_symptoms_ai_results": []
        }


        vitals_query = user_ref.collection("vitals").order_by("createdAt", direction=firestore.Query.DESCENDING).limit(1).stream()
        for doc in vitals_query:
            complete_record["latest_vitals"] = doc.to_dict()

        return complete_record

    except Exception as e:
        return {"error": str(e)}


def get_all_available_doctors() -> list:
    """
    Fetches the complete list of all registered doctors along with their specialties, 
    experience, and availability. 
    The AI Agent should use this tool to look at all available options and dynamically 
    match the best doctor/specialty to the patient's current symptoms and medical history.
    """
    try:
        users_ref = db.collection("users")
        
        query = users_ref.where("role", "==", "doctor").limit(30)
        results = query.stream()
        
        doctors_list = []
        for doc in results:
            doc_data = doc.to_dict()
            doctors_list.append({
                "id": doc.id,
                "name": doc_data.get("fullname"),
                "specialty": doc_data.get("specialty"),
                "availability": doc_data.get("workingHours")
            })
            
        return doctors_list if doctors_list else [{"message": "No doctors are currently registered in the system."}]
    except Exception as e:
        return {"error": str(e)}
# def search_doctors_by_specialty(specialty: str) -> list:
#     """
#     Finds doctors matching the required specialty inside 'users' collection.
#     """
#     try:
#         users_ref = db.collection("users")
#         query = users_ref.where("role", "==", "doctor").where("specialty", "==", specialty).limit(5)
#         results = query.stream()
        
#         doctors_list = []
#         for doc in results:
#             doc_data = doc.to_dict()
#             doctors_list.append({
#                 "id": doc.id,
#                 "name": doc_data.get("name"),
#                 "specialty": doc_data.get("specialty"),
#                 "experience": doc_data.get("experience"),
#                 "availability": doc_data.get("availability")
#             })
#         return doctors_list if doctors_list else [{"message": f"No doctors found in {specialty}."}]
#     except Exception as e:
#         return {"error": str(e)}
    