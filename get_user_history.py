import psycopg2



def user_history_to_json(user_data):
    """Convert raw DB tuples into a serialisable list of dictionaries.

    The list is returned directly (rather than json.dumps) so that FastAPI can
    handle the JSON serialisation automatically.  We also expose the field
    name as `log_time` to match what the front-end expects.
    """

    user_data_list = []

    for data_point in user_data:
        user_data_list.append({
            'log_time': data_point[0],
            'medicine_name': data_point[1],
            'medicine_dosage': data_point[2],
            'day': data_point[3],
            'time_of_day': data_point[4]
        })

    return user_data_list



def get_raw_user_histroy():
    conn = psycopg2.connect(
        host="35.193.11.213",
        port=5432,
        dbname="postgres",
        user="adityaiyer7",
        password="CalHacksAI2025"
    )
    
    cur = conn.cursor()
    cur.execute("""
                SELECT log_time::text AS log_time, medicine_name, medicine_dosage, day::text as day, time_of_day
                FROM user_history """, )
    user_data = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()
        
    return user_data


def get_user_history_json(user_data):
    """Compatibility wrapper used by main.py.

    Internally we just forward to `user_history_to_json`, so downstream callers
    receive the already-structured list that FastAPI will serialise to JSON.
    """
    return user_history_to_json(user_data)
