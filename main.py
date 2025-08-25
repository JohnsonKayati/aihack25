import cv2
import google.generativeai as genai
from dotenv import load_dotenv
import os
from datetime import datetime
import re
import json
from text_extractor import get_time_of_day
from sqlalchemy import create_engine, text


file_path = '/Users/isha/Downloads/IMG_1071.jpg'

load_dotenv()
genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

img = cv2.imread(file_path)

success, encoded_image = cv2.imencode('.jpg', img)
if not success:
    print("Failed to encode image.")
    exit()

image_bytes = encoded_image.tobytes()

prompt = (
    "Extract all the text from this image as accurately as possible.\n\n"
    "Then, separately:\n\n"
    "1. Count only the number of pills that are physically visible and outside of the bottle or packaging. "
    "Do not use numbers written on the label or packaging to estimate this. Only count what is actually visible in the image.\n\n"
    "2. Clearly separate the extracted text and the visual pill count. Format the output like this:\n\n"
    "---\n"
    "Extracted Text:\n"
    "[text here]\n\n"
    "Visible Pills Count:\n"
    "[number]"
)

response = model.generate_content([
    {"mime_type": "image/jpeg", "data": image_bytes},
    prompt
])

pill_count_match = re.search(r"Visible Pills Count:\s*(\d+)", response.text)
visible_pills = pill_count_match.group(1) if pill_count_match else "unknown"

text_match = re.search(r"Extracted Text:\s*(.*?)\n\nVisible Pills Count:", response.text, re.DOTALL)
ocr_text = text_match.group(1).strip() if text_match else ""

final_prompt = (
    "You will be given:\n"
    "- Text extracted from a medication label\n"
    "- The number of pills physically counted outside the bottle\n\n"
    "Your task is to extract:\n"
    "1. The name of the medication (from text)\n"
    "2. The number of visible pills (from pill count)\n"
    "3. The total dosage (number of pills × dosage per pill)\n\n"
    "Rules:\n"
    "- Use only the provided pill count. Do not estimate from the label.\n"
    "- If dosage per pill is not in the text, use 'unknown' for total dosage.\n"
    "- Format: medication_name, number_of_pills, total_dosage_in_mg\n\n"
    f"Extracted Text:\n{ocr_text}\n\n"
    f"Visible Pill Count: {visible_pills}"
)

final_response = model.generate_content(final_prompt)

timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

parts = [p.strip() for p in final_response.text.split(",")]

<<<<<<< HEAD
medication_name = parts[0].lower()
number_of_pills = parts[1]
total_dosage = parts[2]

medication_data = {
    "medication": medication_name,
    "pills": number_of_pills,
    "total_dosage_mg": total_dosage,
    "timestamp": timestamp
}

timestamp_dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")

time_of_day = get_time_of_day(timestamp_dt)
print("Time of day:", time_of_day)

json_output = json.dumps(medication_data, indent=4)

print("Final Output:\n", json_output)

load_dotenv()

genai.configure(api_key=os.getenv("API_KEY"))

newString = ""

engine = create_engine(
    "postgresql+psycopg2://adityaiyer7:CalHacksAI2025@35.193.11.213:5432/postgres"
)

print('hi')
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema');
    """))
    tables = result.fetchall()
    for schema, table in tables:
        print(f"{schema}.{table}")

    result = conn.execute(text("SELECT * FROM public.prescription LIMIT 10;"))
    rows = result.fetchall()  # fetch all rows at once
    
for row in rows:
    db_med_name = row[2].lower()
    db_time_of_day = row[5].lower()
    print(f"DB Medication: '{db_med_name}', Timezone: '{db_time_of_day}'")
    print(f"Detected Medication: '{medication_name}', Detected Timezone: '{time_of_day}'")
    if db_med_name == medication_name:
        if db_time_of_day != time_of_day:
            print(f"Minor: {medication_name} taken at wrong time. Expected: {db_time_of_day}, but got: {time_of_day}")
        else:
            print(f"{medication_name} taken at correct time: {db_time_of_day}")
=======
@app.get("/active-prescriptions", response_model=MedicationResponse)
async def active_prescriptions_get():
    """
    Get the number of active prescriptions for the hardcoded user
    """
    user_id = 123  # Hardcoded user ID
    try:
        count = get_active_prescriptions(user_id)
        return MedicationResponse(
            user_id=user_id,
            count=count[0] if count else 0,
            message="Active prescriptions retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving active prescriptions: {str(e)}")

@app.get("/todays-medication", response_model=MedicationResponse)
async def todays_medication_get():
    """
    Get the number of medications taken today by the hardcoded user
    """
    user_id = 123  # Hardcoded user ID
    try:
        count = get_todays_medication(user_id)
        return MedicationResponse(
            user_id=user_id,
            count=count,
            message="Today's medication count retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving today's medication: {str(e)}")

@app.get("/update-dashboard", response_model=DashboardUpdateResponse)
async def update_dashboard():
    """
    Update dashboard by calling both active prescriptions and today's medication endpoints
    """
    user_id = 123  # Hardcoded user ID
    try:
        # Get active prescriptions
        active_count = get_active_prescriptions(user_id)
        active_prescriptions = active_count[0] if active_count else 0
        
        # Get today's medication
        todays_medication = get_todays_medication(user_id)
        
        return DashboardUpdateResponse(
            user_id=user_id,
            active_prescriptions=active_prescriptions,
            todays_medication=todays_medication,
            message="Dashboard updated successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating dashboard: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
>>>>>>> 1c34bd4f588c0473a0a4a924ef7fb1b3d8fa64fa
