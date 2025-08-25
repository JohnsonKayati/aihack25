import psycopg2
from datetime import datetime
from text_extractor import extract_medication_details
import json
from verification import verify_medication_in_prescription, verify_not_already_taken

class MedicationVerificationError(Exception):
    """Custom exception for medication verification failures"""
    def __init__(self, message, error_type):
        self.message = message
        self.error_type = error_type
        super().__init__(self.message)

def upload_data_to_user_history():
    try:
        json_data = extract_medication_details()
        data = json.loads(json_data)
        
        log_time = data["log_time"]
        medicine_name = data["medicine_name"]
        medicine_dosage = data["medicine_dosage"]
        day = data["day"]
        time_of_day = data["time_of_day"]
        user_id = 123

        # Check if medication is in prescription
        if not verify_medication_in_prescription(data):
            raise MedicationVerificationError(
                f"Medication '{medicine_name}' is not prescribed for {time_of_day}",
                "NOT_PRESCRIBED"
            )
        
        # Check if medication already taken
        if not verify_not_already_taken(data):
            raise MedicationVerificationError(
                f"Medication '{medicine_name}' has already been taken for {time_of_day} on {day}",
                "ALREADY_TAKEN"
            )

        # If both verifications pass, insert into database
        conn = psycopg2.connect(
            host="35.193.11.213",
            port=5432,
            dbname="postgres",
            user="adityaiyer7",
            password="CalHacksAI2025"
        )

        cur = conn.cursor()
        cur.execute("""
                INSERT INTO user_history
                (user_id, log_time, medicine_name, medicine_dosage, day, time_of_day)
                VALUES
                (%s, %s::timestamp, %s, %s, %s::date, %s)""", 
                (user_id, log_time, medicine_name, medicine_dosage, day, time_of_day))
        

        conn.commit()
        cur.close()
        conn.close()
        
        return {"success": True, "message": "Medication logged successfully"}
        
    except MedicationVerificationError as e:
        return {
            "success": False, 
            "error": e.message, 
            "error_type": e.error_type
        }
    except psycopg2.Error as e:
        return {
            "success": False, 
            "error": f"Database error: {str(e)}", 
            "error_type": "DATABASE_ERROR"
        }
    except Exception as e:
        return {
            "success": False, 
            "error": f"Unexpected error: {str(e)}", 
            "error_type": "UNKNOWN_ERROR"
        }



result = upload_data_to_user_history()
print(result)




