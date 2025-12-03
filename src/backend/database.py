from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

import time
from sqlalchemy.exc import OperationalError

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/job_db")

def get_engine(max_retries=5, delay=2):
    for attempt in range(max_retries):
        try:
            engine = create_engine(DATABASE_URL)
            # Test connection
            with engine.connect() as connection:
                pass
            print("Successfully connected to the database.")
            return engine
        except OperationalError as e:
            print(f"Database connection failed (attempt {attempt + 1}/{max_retries}): {e}")
            time.sleep(delay)
    raise Exception("Could not connect to the database after multiple retries.")

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
