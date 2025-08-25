import psycopg2
from datetime import datetime, timezone
import pytz

def get_current_pst_time():
    """Get current time in PST"""
    pst = pytz.timezone('America/Los_Angeles')
    return datetime.now(pst)

def set_server_timezone_to_pst():
    """Set the PostgreSQL server timezone to PST"""
    conn = psycopg2.connect(
        host="35.193.11.213",
        port=5432,
        dbname="postgres",
        user="adityaiyer7",
        password="CalHacksAI2025"
    )

    cur = conn.cursor()
    
    # Set timezone to PST
    cur.execute("SET timezone = 'America/Los_Angeles'")
    conn.commit()
    
    # Verify the change
    cur.execute("SHOW timezone")
    result = cur.fetchone()
    print(f"Server timezone set to: {result[0]}")
    
    cur.close()
    conn.close()

def get_active_prescriptions(user_id):
    conn = psycopg2.connect(
    host="35.193.11.213",
    port=5432,
    dbname="postgres",
    user="adityaiyer7",
    password="CalHacksAI2025"
    )

    cur = conn.cursor()
    cur.execute("""
                SELECT COUNT(DISTINCT medicine_name) 
                FROM prescription 
                WHERE user_id = %s""", (user_id,))
    num_of_meds = cur.fetchall()[0]
    cur.close()
    conn.close()
    return num_of_meds


def get_todays_medication(user_id):
    conn = psycopg2.connect(
    host="35.193.11.213",
    port=5432,
    dbname="postgres",
    user="adityaiyer7",
    password="CalHacksAI2025"
    )

    cur = conn.cursor()
    
    # Set session timezone to PST for this connection
    cur.execute("SET timezone = 'America/Los_Angeles'")
    
    # Now use PST-aware date comparison
    cur.execute("""
                SELECT COUNT(DISTINCT medicine_name) 
                FROM user_history 
                WHERE user_id = %s 
                AND DATE(log_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles') = CURRENT_DATE""", (user_id,))
    
    num_of_meds_taken_today = cur.fetchall()[0]
    cur.close()
    conn.close()
    return num_of_meds_taken_today[0]


def get_compliance_rate(user_id):
    conn = psycopg2.connect(
    host="35.193.11.213",
    port=5432,
    dbname="postgres",
    user="adityaiyer7",
    password="CalHacksAI2025"
    )

    cur = conn.cursor()
    
    total_medicines = get_active_prescriptions(user_id)
 
    cur.execute("""
                WITH date_grouped_table AS (
                    SELECT day, COUNT(medicine_name) AS medicines_taken
                    FROM user_history
                    WHERE user_id = %s
                    GROUP BY day
                ),
                expected_count_table AS (
                    SELECT *, %s::int AS expected_medicine_count
                    FROM date_grouped_table)
                
                SELECT  SUM(medicines_taken)::numeric/NULLIF(SUM(expected_medicine_count),0)
                FROM expected_count_table;
                """, (user_id, total_medicines))
    
    compliance_rate = cur.fetchall()[0]
    cur.close()
    conn.close()
    result = cur.fetchone()[0]        
    if result is None:
        return 0.0
    return float(result)              


def get_alerts(user_id):
    pass


print(get_compliance_rate(123))