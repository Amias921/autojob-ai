from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import JobPosting
from database import get_db

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

