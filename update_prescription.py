import psycopg2
from datetime import datetime
from text_extractor import extract_prescription
import json
import os

def upload_data_to_prescription():
    # 1) Call your OCR/extraction and parse it:
    json_data = extract_prescription()
    medications = json.loads(json_data)   # → a Python list of dicts

    # 2) Prepare your metadata:
    user_id    = 123
    upload_time = datetime.now()

    # 3) Open your connection (fill in your real creds or use env vars)
    conn = psycopg2.connect(
        host="35.193.11.213",
        port=5432,
        dbname="postgres",
        user="adityaiyer7",
        password="CalHacksAI2025"
    )
    cur = conn.cursor()

    # 4) Loop & insert each medication
    for med in medications:
        medicine_name         = med["medication_name"]
        medicine_dosage       = med["dosage"]
        num_of_times_per_day  = med["frequency_per_day"]
        time_of_day_str       = ", ".join(med["times_of_day"])

        cur.execute("""
            INSERT INTO prescription
              (user_id, upload_time,
               medicine_name, medicine_dosage,
               num_of_times_per_day, time_of_day)
            VALUES
              (%s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            upload_time,
            medicine_name,
            medicine_dosage,
            num_of_times_per_day,
            time_of_day_str
        ))

    # 5) Commit & clean up
    conn.commit()
    cur.close()
    conn.close()

    return {"success": True, "message": "Prescription data logged successfully"}

print(upload_data_to_prescription())