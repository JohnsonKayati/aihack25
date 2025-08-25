import sqlite3

conn = sqlite3.connect('example.db')
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_history (
        user_id INT,
        log_time TIMESTAMP,
        medicine_name VARCHAR,
        medicine_dosage VARCHAR,
        day DATE,
        time_of_day VARCHAR
    )
""")
conn = sqlite3.connect('example.db')
cursor = conn.cursor()

# Get the table structure
cursor.execute("PRAGMA table_info(user_history)")
columns = cursor.fetchall()

# Print each column's details
for col in columns:
    print(col)

# Save (commit) the changes
conn.commit()

# Close the connection
conn.close()
