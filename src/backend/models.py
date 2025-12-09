from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    file_path = Column(String) # Path to encrypted file
    content_text = Column(Text) # Extracted text for AI
    created_at = Column(DateTime, default=datetime.utcnow)
    is_base = Column(Boolean, default=False)

class JobPosting(Base):
    __tablename__ = "job_postings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    company = Column(String)
    description = Column(Text)
    url = Column(String)
    source = Column(String) # e.g., "JobSpy", "Manual"
    fetched_at = Column(DateTime, default=datetime.utcnow)

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_postings.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    status = Column(String, default="Draft") # Draft, Generated, Applied, Rejected
    generated_content = Column(Text) # The tailored resume content
    pdf_path = Column(String, nullable=True) # Path to generated PDF
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Multi-model tracking
    model_used = Column(String, nullable=True, default="llama3")  # AI model name
    model_generation_time = Column(Integer, nullable=True)  # Generation time in seconds
    model_tokens_used = Column(Integer, nullable=True)  # Number of tokens used
    
    # ATS Score tracking
    ats_score = Column(Integer, nullable=True)  # Score 0-100
    ats_grade = Column(String, nullable=True)  # excellent/good/fair/poor
    ats_feedback = Column(Text, nullable=True)  # JSON string with suggestions
    ats_analyzed_at = Column(DateTime, nullable=True)  # When analysis was performed
    
    job = relationship("JobPosting")
    resume = relationship("Resume")
