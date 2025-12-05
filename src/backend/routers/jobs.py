from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from models import JobPosting
from database import get_db
from job_search import search_jobs, deduplicate_jobs, format_job_description

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"],
)

@router.post("/", response_model=dict)
def create_job(title: str, company: str, description: str, url: str, db: Session = Depends(get_db)):
    db_job = JobPosting(
        title=title,
        company=company,
        description=description,
        url=url,
        source="Manual"
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return {"id": db_job.id, "title": db_job.title}

@router.get("/", response_model=List[dict])
def read_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    jobs = db.query(JobPosting).offset(skip).limit(limit).all()
    return [{"id": j.id, "title": j.title, "company": j.company, "fetched_at": j.fetched_at} for j in jobs]

@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a single job by ID"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "description": job.description,
        "url": job.url,
        "source": job.source,
        "fetched_at": job.fetched_at
    }


class JobSearchRequest(BaseModel):
    search_term: str
    location: str = "Remote"
    results_wanted: int = 10


@router.post("/search", response_model=dict)
def search_and_store_jobs(
    request: JobSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Search for jobs using JobSpy and store them in the database
    """
    try:
        # Search for jobs
        jobs = search_jobs(
            search_term=request.search_term,
            location=request.location,
            results_wanted=request.results_wanted
        )
        
        if not jobs:
            return {
                "status": "success",
                "message": "No jobs found",
                "jobs_added": 0,
                "jobs": []
            }
        
        # Deduplicate
        unique_jobs = deduplicate_jobs(jobs)
        
        # Store in database
        stored_jobs = []
        for job_data in unique_jobs:
            # Check if job already exists (by title and company)
            existing = db.query(JobPosting).filter(
                JobPosting.title == job_data["title"],
                JobPosting.company == job_data["company"]
            ).first()
            
            if not existing:
                # Create new job posting
                new_job = JobPosting(
                    title=job_data["title"],
                    company=job_data["company"],
                    description=format_job_description(job_data["description"]),
                    url=job_data["url"],
                    source=job_data["source"]
                )
                db.add(new_job)
                db.commit()
                db.refresh(new_job)
                stored_jobs.append({
                    "id": new_job.id,
                    "title": new_job.title,
                    "company": new_job.company
                })
        
        return {
            "status": "success",
            "message": f"Found {len(unique_jobs)} jobs, added {len(stored_jobs)} new jobs",
            "jobs_added": len(stored_jobs),
            "jobs": stored_jobs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job search failed: {str(e)}")

