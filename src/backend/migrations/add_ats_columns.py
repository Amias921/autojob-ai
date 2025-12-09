"""
Database migration to add ATS score tracking columns to Application table.

Run this script to add ATS feature columns:
- ats_score: Score from 0-100
- ats_grade: excellent/good/fair/poor
- ats_feedback: JSON string with suggestions and feedback
- ats_analyzed_at: Timestamp of analysis
"""

from sqlalchemy import create_engine, text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/job_db")

def run_migration():
    """Add ATS tracking columns to applications table."""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if columns already exist
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='applications' AND column_name='ats_score'
        """)
        
        result = conn.execute(check_query).fetchone()
        
        if result:
            print("✓ ATS columns already exist. Migration not needed.")
            return
        
        print("Adding ATS tracking columns to applications table...")
        
        # Add columns
        migration_sql = text("""
            ALTER TABLE applications 
            ADD COLUMN IF NOT EXISTS ats_score INTEGER,
            ADD COLUMN IF NOT EXISTS ats_grade VARCHAR,
            ADD COLUMN IF NOT EXISTS ats_feedback TEXT,
            ADD COLUMN IF NOT EXISTS ats_analyzed_at TIMESTAMP;
        """)
        
        conn.execute(migration_sql)
        conn.commit()
        
        print("✓ Migration completed successfully!")
        print("  - Added ats_score column")
        print("  - Added ats_grade column")
        print("  - Added ats_feedback column")
        print("  - Added ats_analyzed_at column")

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise
