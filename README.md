# AutoJobAI - Automated Job Application System

**AI-powered job application automation with resume tailoring**

## Features

- 📄 **Resume Management** - Upload and manage base resumes (PDF, DOCX, TXT)
- 🤖 **AI Resume Tailoring** - Uses Ollama with multiple models to customize resumes for specific jobs
- 📊 **ATS Score Analysis** - Automatic scoring and feedback to optimize resumes for Applicant Tracking Systems
- 🔄 **N8N Automation** - Workflow automation for resume generation
- 💼 **Application Tracking** - Track generated applications with status, model used, and ATS scores
- 🎯 **Job Management** - Store and manage job postings

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **AI**: Ollama with Multi-Model Support (Llama3, Mistral, Phi-3, Qwen, TinyLlama)
- **Automation**: N8N
- **Containerization**: Docker Compose

## 🆕 Multi-Model AI Support

Choose from multiple AI models to generate resumes with different characteristics:

- **Llama 3**: Meta's flagship model - best overall quality
- **Mistral 7B**: Excellent for professional writing and structured content
- **Phi-3**: Small but capable - very fast generation
- **Qwen 2.5**: Strong reasoning and multilingual support
- **TinyLlama**: Lightweight for testing and resource-constrained environments

### Benefits
- **A/B Testing**: Compare resume quality across different AI models
- **Performance Optimization**: Choose between speed (Phi-3) and quality (Llama 3)
- **Model Tracking**: See which model generated each resume with performance metrics
- **Flexibility**: Switch models based on job requirements

## 🆕 ATS Score Analysis

Automatic resume scoring powered by HuggingFace AI to optimize for Applicant Tracking Systems.

**Powered by:** [KarthikeyanDev/ATS_RESUME_CHECKER](https://huggingface.co/KarthikeyanDev/ATS_RESUME_CHECKER)

### Features
- **Automatic Analysis**: Every generated resume gets an ATS compatibility score (0-100)
- **Color-Coded Badges**: 
  - 🟢 90-100 (Excellent) - Ready to submit
  - 🟡 75-89 (Good) - Minor improvements
  - 🟠 60-74 (Fair) - Several improvements needed
  - 🔴 0-59 (Poor) - Major revisions required
- **Actionable Feedback**:
  - ✓ Strengths: What your resume does well
  - ⚠ Improvements: Specific suggestions
  - 🔍 Keywords: Missing terms to consider adding
- **Smart Fallback**: Uses rule-based analysis if ML model unavailable

### How It Works
1. Generate a tailored resume with any AI model
2. ATS analysis runs automatically
3. View score and detailed feedback in Applications page
4. Improve resume based on suggestions
5. Re-analyze to see score improvement


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

4. **Pull AI Models** (Important!)
```bash
# Access the Ollama container
docker exec -it container-ollama-1 /bin/bash

# Pull models (choose based on your needs)
ollama pull llama3      # Recommended - best quality (4.7GB)
ollama pull mistral     # Great for professional content (4.1GB)
ollama pull phi3        # Fast and lightweight (2.3GB)
ollama pull tinyllama   # Very lightweight for testing (637MB)

# List installed models
ollama list

# Exit container
exit
```

5. **Install ATS Dependencies** (For Resume Scoring)
```bash
cd src/backend
pip install transformers torch sentencepiece

# Run database migration to add ATS columns
python migrations/add_ats_columns.py
```

**Note**: The ATS feature will download ~400MB model on first use. It includes a rule-based fallback if the model fails.

## Usage

### 1. Upload Resume
- Go to http://localhost:3005/resumes
- Click "Upload New Resume"
- Upload your PDF, DOCX, or TXT resume

### 2. Add Jobs
- Go to http://localhost:3005/jobs
- Add job postings manually or search for jobs

### 3. Select AI Model & Generate Resume
- Go to http://localhost:3005/jobs
- **Select your base resume** from dropdown
- **Choose AI model** (Llama3, Mistral, Phi-3, etc.)
- Click "Generate Resume" on a job posting
- AI tailors your resume for that specific job

### 4. View Applications & ATS Scores
- Go to http://localhost:3005/applications
- See all generated applications with ATS scores
- Expand an application to view:
  - **ATS Score** (0-100) with color-coded badge
  - **ATS Feedback** - Strengths, improvements, missing keywords
  - AI model used
  - Generation time
  - Tokens consumed
  - Tailored resume content

### 5. A/B Test Different Models
- Generate multiple resumes for the same job using different models
- Compare quality, speed, keyword matching, and ATS scores
- Choose the best version for your application

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
- `GET /applications/` - List applications (with model and ATS metadata)
- `POST /applications/` - Create application
- `POST /applications/generate?resume_id=X&job_id=Y&model=llama3` - Generate tailored resume (auto-runs ATS analysis)
- `POST /applications/{id}/analyze-ats` - Manually trigger ATS analysis
- `GET /applications/models` - Get available AI models

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
- AI integration with multiple models
- Machine learning for resume optimization
- Automation workflows
- Docker containerization
- RESTful API design

## Credits \& Acknowledgments

### AI Models & Technologies

**Resume Generation Models (via Ollama):**
- **Llama 3** by Meta
- **Mistral 7B** by Mistral AI
- **Phi-3** by Microsoft
- **Qwen 2.5** by Alibaba Cloud
- **TinyLlama** by TinyLlama Team

**ATS Resume Scoring:**
- **[KarthikeyanDev/ATS_RESUME_CHECKER](https://huggingface.co/KarthikeyanDev/ATS_RESUME_CHECKER)** by Karthikeyan M C
  - HuggingFace model for ATS compatibility analysis
  - Provides resume PII masking and ATS optimization
  - Licensed under MIT License

**Frameworks \& Libraries:**
- HuggingFace Transformers
- PyTorch
- FastAPI
- Next.js / React
- Ollama

## License

Educational project - CS Assignment

## Author

Amias Ainsworth

