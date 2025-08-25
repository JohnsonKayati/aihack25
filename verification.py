import psycopg2
from datetime import datetime
from text_extractor import extract_medication_details
import json

def get_unique_prescriptions():
    # returns a dict of {medicine_name: [time1, time2, ...]}
    conn = psycopg2.connect(
        host="35.193.11.213",
        port=5432,
        dbname="postgres",
        user="adityaiyer7",
        password="CalHacksAI2025"
    )

    cur = conn.cursor()
    cur.execute("""
                SELECT medicine_name, time_of_day
                FROM prescription
                ORDER BY medicine_name, time_of_day
                """)
    
    results = cur.fetchall()
    
    # Close database connection
    cur.close()
    conn.close()
    
    # Create dictionary with medicine_name as key and list of times as value
    unique_med_dict = {}
    for medicine_name, time_of_day in results:
        # time_of_day from DB is a comma-separated string, e.g., "morning, afternoon"
        # We split it into a list of individual times.
        times = [t.strip() for t in time_of_day.split(',')]
        if medicine_name not in unique_med_dict:
            unique_med_dict[medicine_name] = []
        unique_med_dict[medicine_name].extend(times)
    
    return unique_med_dict


def verify_medication_in_prescription(json_data):
    medicine_name = json_data["medicine_name"]
    time_of_day = json_data["time_of_day"]
    user_id = 123


    unique_med_dict = get_unique_prescriptions()

    if medicine_name in unique_med_dict:
        if time_of_day in unique_med_dict[medicine_name]:
            return True
    
    return False

def verify_not_already_taken(json_data):
    medicine_name = json_data["medicine_name"]
    medicine_dosage = json_data["medicine_dosage"]
    curr_day = json_data["day"]
    curr_time_of_day = json_data["time_of_day"]


    conn = psycopg2.connect(
        host="35.193.11.213",
        port=5432,
        dbname="postgres",
        user="adityaiyer7",
        password="CalHacksAI2025"
    )

    cur = conn.cursor()
    cur.execute("""
                SELECT * 
                FROM medication_logs
                WHERE day = %s AND time_of_day = %s AND medicine_name = %s
                """, 
            (curr_day, curr_time_of_day, medicine_name))
    
    result = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return len(result) == 0