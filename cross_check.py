import google.generativeai as genai
import pandas as pd 
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import os 
from datetime import datetime, time

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
        print(row)

    medicine_names = [row[2] for row in rows]  # now rows is defined and reusable
    medicine_string = ", ".join(medicine_names)

    print('medicine_string = ' + medicine_string)

    new_med = "Warfarin"       # example new medication string
    model = genai.GenerativeModel("gemini-2.5-flash")
    conflicting_meds = []

    for med in medicine_names:  # assuming medicine_names is a list of existing meds
        prompt = (
            f"I am currently taking {med}. If I now take {new_med}, "
            f"is it safe to take them together? "
            f"Only respond with 'yes' or 'no'. No other text."
        )
        response = model.generate_content(prompt)
        answer = response.text.strip().lower()

        if answer == "no":
            conflicting_meds.append(med)

    if conflicting_meds:
        print(f"⚠️ WARNING: {', '.join(conflicting_meds)} SHOULD NOT be taken with {new_med}")

        ## time mismatch -> mild alert
        ## wrong medication -> alert 

    