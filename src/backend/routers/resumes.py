from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid
from models import Resume
from database import get_db

router = APIRouter(
    prefix="/resumes",
    tags=["resumes"],
)

UPLOAD_DIR = "data/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text_from_file(file_path: str) -> str:
    """Extract text content from PDF, DOCX, or TXT files."""
    try:
        extension = os.path.splitext(file_path)[1].lower()
        
        if extension == '.txt':
            # Read plain text file
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        
        elif extension == '.docx':
            # Extract text from DOCX
            try:
                from docx import Document
                doc = Document(file_path)
                return '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            except Exception as e:
                print(f"Error extracting DOCX: {e}")
                return ""
        
        elif extension == '.pdf':
            # Extract text from PDF
            try:
                import PyPDF2
                with open(file_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    return text
            except Exception as e:
                print(f"Error extracting PDF: {e}")
                return ""
        
        else:
            return ""
    except Exception as e:
        print(f"Error in extract_text_from_file: {e}")
        return ""

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    name: str = Form(...),
    db: Session = Depends(get_db)
):
    # Generate unique filename
    file_id = str(uuid.uuid4())
    extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{extension}")
    
    # Save file locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text content
    text_content = extract_text_from_file(file_path)
    
    # Create DB entry with extracted text
    db_resume = Resume(
        name=name,
        file_path=file_path,
        content_text=text_content,  # Store extracted text!
        is_base=True
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@router.get("/", response_model=List[dict]) # Simplified response model for now
def read_resumes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    resumes = db.query(Resume).offset(skip).limit(limit).all()
    return [{"id": r.id, "name": r.name, "created_at": r.created_at} for r in resumes]

@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """Get a single resume by ID with extracted text content"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Return the extracted text from database, not the binary file!
    return {
        "id": resume.id,
        "name": resume.name,
        "file_path": resume.file_path,
        "content": resume.content_text or "[No text extracted]",  # Use database field!
        "is_base": resume.is_base,
        "created_at": resume.created_at
    }


@router.get("/{resume_id}/download")
def download_resume(resume_id: int, db: Session = Depends(get_db)):
    """
    Download a resume file by ID.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.file_path or not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="Resume file not found on disk")
    
    # Return the file for download/viewing
    return FileResponse(
        path=resume.file_path,
        filename=resume.name,
        media_type='application/octet-stream'
    )


@router.delete("/{resume_id}", response_model=dict)
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    """
    Delete a resume by ID (removes from database and filesystem).
    Also deletes any applications that reference this resume.
    """
    from models import Application  # Import here to avoid circular import
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete any applications that reference this resume
    applications = db.query(Application).filter(Application.resume_id == resume_id).all()
    for app in applications:
        db.delete(app)
    
    # Delete file from filesystem if it exists
    file_path = resume.file_path
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Warning: Could not delete file {file_path}: {e}")
    
    # Delete from database
    db.delete(resume)
    db.commit()
    
    deleted_apps_count = len(applications)
    return {
        "message": "Resume deleted successfully",
        "id": resume_id,
        "deleted_applications": deleted_apps_count
    }


