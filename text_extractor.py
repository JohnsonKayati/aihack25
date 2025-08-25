import cv2
import google.generativeai as genai
from dotenv import load_dotenv
import os
from datetime import datetime
import re
import json

load_dotenv()

def get_time_of_day(timestamp):
    """
    Determine time of day based on timestamp.
    Morning: 6am-12pm, Afternoon: 12pm-4pm, Evening: 4pm-10pm, Night: 10pm-6am
    """
    hour = timestamp.hour
    
    if 6 <= hour < 12:
        return "morning"
    elif 12 <= hour < 16:
        return "afternoon"
    elif 16 <= hour < 22:
        return "evening"
    else:
        return "night"

def extract_medication_details():
    file_path = os.getenv("MEDICATION_FILE_PATH")
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

    timestamp = datetime.now()
    
    parts = [p.strip() for p in final_response.text.split(",")]

    medicine_name = parts[0].lower()
    number_of_pills = parts[1]
    medicine_dosage = parts[2]

    medication_data = {
        "log_time": timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        "medicine_name": medicine_name,
        "medicine_dosage": medicine_dosage,
        "day": timestamp.strftime('%Y-%m-%d'),
        "time_of_day": get_time_of_day(timestamp)
    }
    json_output = json.dumps(medication_data, indent=4)

    return json_output

def extract_prescription():

    # file_path = os.getenv("test_images/prescriptions/demo_prescription.png")
    # if not file_path:
    #     raise EnvironmentError("PRESCRIPTION_FILE_PATH is not set in your .env")
    # if not os.path.isfile(file_path):
    #     raise FileNotFoundError(f"No file found at: {file_path}")
    file_path = "test_images/prescriptions/demo_prescription.png"

    

    load_dotenv()
    genai.configure(api_key=os.getenv("API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")

    img = cv2.imread(file_path)
    success, encoded_image = cv2.imencode('.jpg', img)
    if not success:
        print("Failed to encode image.")
        exit()

    image_bytes = encoded_image.tobytes()

    full_prompt = (
        "Step 1: Extract all the text from this image of a prescription as accurately as possible. "
        "This includes medication names, dosages, instructions, and any additional labels or printed notes.\n\n"
        
        "Step 2: Count only the number of pills that are physically visible outside of any bottle or packaging. "
        "Do not estimate based on printed numbers or text—only count the pills actually visible in the image.\n\n"

        "Step 3: From the extracted text, identify and output the following details for each medication:\n"
        "- Medication name\n"
        "- Dosage (e.g., 500mg)\n"
        "- Frequency per day (e.g., 2 times a day)\n"
        "- Specific times of day to take it (e.g., morning, afternoon, night)\n\n"

        "Format the entire response like this:\n"
        "---\n"
        "Medication Details:\n"
        "[\n"
        "  {\n"
        "    \"medication_name\": \"\",\n"
        "    \"dosage\": \"\",\n"
        "    \"frequency_per_day\": 0,\n"
        "    \"times_of_day\": []\n"
        "  },\n"
        "  ...\n"
        "]"
    )

    final_prompt = """Given the medication prescription information, return the information in this format. 
    [Medication_name], [dosage], [frequency_per_day], [times_of_day]. 
    If times_of_day is unavalible, write Anytime"""

    response = model.generate_content([
        {"mime_type": "image/jpeg", "data": image_bytes},
        full_prompt
    ])

    final_response = model.generate_content([
        final_prompt + "Medication Prescription: \n" + response.text
    ])

    raw_output = final_response.text.strip()

    medications = []

    for line in raw_output.splitlines():
        parts = [p.strip() for p in line.split(",")]

        if len(parts) == 4:
            name, dosage, freq, times = parts
            try:
                freq = int(freq)
            except ValueError:
                freq = 0

            medications.append({
                "medication_name": name,
                "dosage": dosage,
                "frequency_per_day": freq,
                "times_of_day": [t.strip() for t in times.split("and") if t.strip()]
            })
    json_output = json.dumps(medications, indent=4)
    return json_output







print(extract_prescription())


