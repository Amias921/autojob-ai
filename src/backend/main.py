from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Auto Job Resume API")

# CORS Configuration
origins = ["*"]  # Allow all origins for development

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Auto Job Resume API"}

from routers import resumes, jobs, search, applications
from models import Base
from database import engine

# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(resumes.router)
app.include_router(jobs.router)
app.include_router(search.router)
app.include_router(applications.router)
