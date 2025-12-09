from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import Resume, JobPosting, Application
from database import get_db
from ai_service import generate_tailored_resume, get_available_models
from ats_service import get_ats_score
from pdf_generator import generate_resume_pdf
from typing import Optional
import os
import uuid
import json

class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: int
    tailored_content: str
    status: str = "Generated"

router = APIRouter(
    prefix="/applications",
    tags=["applications"],
)

@router.post("/generate", response_model=dict)
async def generate_application(
    resume_id: int,
    job_id: int,
    model: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generate a tailored resume for a specific job posting using AI.
    
    Args:
        resume_id: ID of the base resume to use
        job_id: ID of the job posting to target
        model: Optional AI model to use (defaults to llama3)
        db: Database session
    """
    # Fetch the base resume
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Fetch the job posting
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    # Extract resume text (in a real scenario, you'd parse the PDF/DOCX)
    # For now, we'll use a placeholder
    resume_text = resume.content_text or "Professional with experience in software development"
    
    # Generate tailored resume using AI
    try:
        tailored_content, metadata = generate_tailored_resume(
            resume_text, 
            job.description,
            model_name=model
        )
        
        # Create or update application record
        existing_app = db.query(Application).filter(
            Application.job_id == job_id,
            Application.resume_id == resume_id
        ).first()
        
        if existing_app:
            existing_app.generated_content = tailored_content
            existing_app.status = "Generated"
            existing_app.model_used = metadata["model_used"]
            existing_app.model_generation_time = int(metadata["generation_time"])
            existing_app.model_tokens_used = metadata["tokens_used"]
        else:
            new_app = Application(
                job_id=job_id,
                resume_id=resume_id,
                generated_content=tailored_content,
                status="Generated",
                model_used=metadata["model_used"],
                model_generation_time=int(metadata["generation_time"]),
                model_tokens_used=metadata["tokens_used"]
            )
            db.add(new_app)
        
        db.commit()
        
        # Auto-run ATS analysis on generated content
        try:
            ats_result = get_ats_score(tailored_content)
            app_to_update = existing_app if existing_app else new_app
            app_to_update.ats_score = ats_result['score']
            app_to_update.ats_grade = ats_result['grade']
            app_to_update.ats_feedback = json.dumps({
                'suggestions': ats_result.get('suggestions', []),
                'strengths': ats_result.get('strengths', []),
                'missing_keywords': ats_result.get('missing_keywords', [])
            })
            app_to_update.ats_analyzed_at = db.func.now()
            db.commit()
        except Exception as e:
            print(f"Warning: ATS analysis failed: {e}")
            # Continue even if ATS analysis fails
        
        return {
            "status": "success",
            "message": f"Resume tailored successfully using {metadata['model_used']}",
            "tailored_resume": tailored_content[:500] + "...",  # Preview
            "metadata": metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")


@router.post("/", response_model=dict)
def create_application(
    app_data: ApplicationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new application with pre-generated content (e.g., from N8N workflow).
    """
    # Check if application already exists
    existing_app = db.query(Application).filter(
        Application.job_id == app_data.job_id,
        Application.resume_id == app_data.resume_id
    ).first()
    
    if existing_app:
        # Update existing
        existing_app.generated_content = app_data.tailored_content
        existing_app.status = app_data.status
        db.commit()
        db.refresh(existing_app)
        return {"id": existing_app.id, "status": "updated", "message": "Application updated"}
    else:
        # Create new
        new_app = Application(
            job_id=app_data.job_id,
            resume_id=app_data.resume_id,
            generated_content=app_data.tailored_content,
            status=app_data.status
        )
        db.add(new_app)
        db.commit()
        db.refresh(new_app)
        return {"id": new_app.id, "status": "created", "message": "Application created"}



@router.get("/", response_model=list)
def list_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all applications with model and ATS metadata.
    """
    apps = db.query(Application).offset(skip).limit(limit).all()
    return [
        {
            "id": app.id,
            "job_id": app.job_id,
            "resume_id": app.resume_id,
            "status": app.status,
            "created_at": app.created_at,
            "generated_content": app.generated_content,
            "model_used": app.model_used,
            "model_generation_time": app.model_generation_time,
            "model_tokens_used": app.model_tokens_used,
            "ats_score": app.ats_score,
            "ats_grade": app.ats_grade,
            "ats_feedback": app.ats_feedback,
            "ats_analyzed_at": app.ats_analyzed_at
        }
        for app in apps
    ]


@router.post("/{application_id}/generate-pdf", response_model=dict)
def generate_application_pdf(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate a PDF for an existing application.
    """
    # Get the application
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if not app.generated_content:
        raise HTTPException(status_code=400, detail="No resume content to generate PDF from")
    
    try:
        # Create PDFs directory if it doesn't exist
        pdf_dir = "/app/data/pdfs"
        os.makedirs(pdf_dir, exist_ok=True)
        
        # Generate unique filename
        filename = f"resume_{app.id}_{uuid.uuid4().hex[:8]}.pdf"
        pdf_path = os.path.join(pdf_dir, filename)
        
        # Generate the PDF
        generate_resume_pdf(app.generated_content, pdf_path)
        
        # Update application with PDF path
        app.pdf_path = pdf_path
        db.commit()
        
        return {
            "status": "success",
            "message": "PDF generated successfully",
            "pdf_path": pdf_path,
            "application_id": app.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")


@router.get("/{application_id}/download-pdf")
def download_application_pdf(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Download the PDF for an application.
    """
    # Get the application
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if not app.pdf_path or not os.path.exists(app.pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found. Generate it first.")
    
    # Return the PDF file
    return FileResponse(
        app.pdf_path,
        media_type="application/pdf",
        filename=f"resume_application_{app.id}.pdf"
    )


@router.get("/models", response_model=dict)
def get_models():
    """
    Get list of available AI models for resume generation.
    """
    return {
        "status": "success",
        "models": get_available_models()
    }


@router.post("/{application_id}/analyze-ats", response_model=dict)
def analyze_ats_score(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Manually trigger ATS analysis for an existing application.
    """
    from datetime import datetime
    
    # Get the application
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if not app.generated_content:
        raise HTTPException(status_code=400, detail="No resume content to analyze")
    
    try:
        # Run ATS analysis
        ats_result = get_ats_score(app.generated_content)
        
        # Update application with ATS data
        app.ats_score = ats_result['score']
        app.ats_grade = ats_result['grade']
        app.ats_feedback = json.dumps({
            'suggestions': ats_result.get('suggestions', []),
            'strengths': ats_result.get('strengths', []),
            'missing_keywords': ats_result.get('missing_keywords', [])
        })
        app.ats_analyzed_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": "success",
            "ats_score": ats_result['score'],
            "ats_grade": ats_result['grade'],
            "suggestions": ats_result.get('suggestions', []),
            "strengths": ats_result.get('strengths', []),
            "missing_keywords": ats_result.get('missing_keywords', []),
            "analyzed_at": ats_result['analyzed_at']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze ATS score: {str(e)}")

