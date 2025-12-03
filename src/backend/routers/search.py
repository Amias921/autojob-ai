from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import JobPosting
from database import get_db
from typing import List, Optional
import logging

router = APIRouter(
    prefix="/search",
    tags=["search"],
)

@router.post("/jobs", response_model=dict)
async def search_jobs(
    query: str = "software engineer",
    location: str = "remote",
    results_wanted: int = 10,
    db: Session = Depends(get_db)
):
    """
    Search for jobs using JobSpy and save to database.
    """
    try:
        from jobspy import scrape_jobs
        
        # Scrape jobs
        jobs_df = scrape_jobs(
            site_name=["indeed", "linkedin", "glassdoor"],
            search_term=query,
            location=location,
            results_wanted=results_wanted,
            country_indeed='USA'
        )
        
        if jobs_df is None or jobs_df.empty:
            return {"status": "success", "message": "No jobs found", "count": 0}
        
        # Save jobs to database
        saved_count = 0
        for _, row in jobs_df.iterrows():
            # Check if job already exists
            existing = db.query(JobPosting).filter(JobPosting.url == str(row.get('job_url', ''))).first()
            if not existing:
                db_job = JobPosting(
                    title=str(row.get('title', 'N/A')),
                    company=str(row.get('company', 'N/A')),
                    description=str(row.get('description', 'N/A')),
                    url=str(row.get('job_url', '')),
                    source="JobSpy"
                )
                db.add(db_job)
                saved_count += 1
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Found {len(jobs_df)} jobs, saved {saved_count} new jobs",
            "count": saved_count
        }
        
    except Exception as e:
        logging.error(f"Error searching jobs: {e}")
        return {"status": "error", "message": str(e), "count": 0}
