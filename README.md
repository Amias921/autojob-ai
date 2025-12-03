# AutoJobAI - Automated Job Application System

**AI-powered job application automation with resume tailoring**

## Features

- 📄 **Resume Management** - Upload and manage base resumes (PDF, DOCX, TXT)
- 🤖 **AI Resume Tailoring** - Uses Ollama (TinyLlama) to customize resumes for specific jobs
- 🔄 **N8N Automation** - Workflow automation for resume generation
- 💼 **Application Tracking** - Track generated applications with status
- 🎯 **Job Management** - Store and manage job postings

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **AI**: Ollama (TinyLlama model)
- **Automation**: N8N
- **Containerization**: Docker Compose

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- Python 3.10+

### Installation

1. **Clone the repository**
```bash
cd "auto job resume project"
```

2. **Start all services**
```bash
cd container
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3005
- Backend API: http://localhost:8005
- N8N: http://localhost:5679
- Ollama: http://localhost:11435

## Usage

### 1. Upload Resume
- Go to http://localhost:3005/resumes
- Click "Upload New Resume"
- Upload your PDF, DOCX, or TXT resume

### 2. Add Jobs
- Go to http://localhost:3005/jobs
- Add job postings manually

### 3. Generate Tailored Resume (via N8N)
- Access N8N at http://localhost:5679
- Import the workflow from `/brain/resume_generation_workflow.json`
- Trigger via webhook or manually
- AI generates personalized resume for the job

### 4. View Applications
- Go to http://localhost:3005/applications
- See all generated applications
- View tailored resume content

## API Endpoints

### Resumes
- `GET /resumes/` - List all resumes
- `POST /resumes/upload` - Upload resume
- `GET /resumes/{id}` - Get resume details
- `DELETE /resumes/{id}` - Delete resume

### Jobs
- `GET /jobs/` - List jobs
- `POST /jobs/` - Create job
- `GET /jobs/{id}` - Get job details

### Applications
- `GET /applications/` - List applications
- `POST /applications/` - Create application

## Project Structure

```
.
├── src/
│   ├── frontend/          # Next.js application
│   ├── backend/           # FastAPI application
│   └── brain/             # N8N workflows & guides
├── container/
│   └── docker-compose.yml # Docker services
└── data/
    └── resumes/           # Uploaded resume files
```

## Database Schema

- **resumes**: Stores resume metadata and extracted text
- **job_postings**: Job listing information
- **applications**: Generated applications with tailored content

## Development

Built for CS class project demonstrating:
- Full-stack development
- AI integration
- Automation workflows
- Docker containerization
- RESTful API design

## License

Educational project - CS Assignment

## Author

Amias Ainsworth
