"""
Database migration to add model tracking columns to Application table.

Run this script to add multi-model support columns:
- model_used: Name of the AI model used to generate the resume
- model_generation_time: Time taken to generate (in seconds)
- model_tokens_used: Number of tokens used in generation
"""

from sqlalchemy import create_engine, text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/job_db")

def run_migration():
    """Add model tracking columns to applications table."""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if columns already exist
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='applications' AND column_name='model_used'
        """)
        
        result = conn.execute(check_query).fetchone()
        
        if result:
            print("✓ Columns already exist. Migration not needed.")
            return
        
        print("Adding model tracking columns to applications table...")
        
        # Add columns
        migration_sql = text("""
            ALTER TABLE applications 
            ADD COLUMN IF NOT EXISTS model_used VARCHAR DEFAULT 'llama3',
            ADD COLUMN IF NOT EXISTS model_generation_time INTEGER,
            ADD COLUMN IF NOT EXISTS model_tokens_used INTEGER;
            
            -- Set default value for existing records
            UPDATE applications 
            SET model_used = 'llama3' 
            WHERE model_used IS NULL;
        """)
        
        conn.execute(migration_sql)
        conn.commit()
        
        print("✓ Migration completed successfully!")
        print("  - Added model_used column (default: 'llama3')")
        print("  - Added model_generation_time column")
        print("  - Added model_tokens_used column")

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise
