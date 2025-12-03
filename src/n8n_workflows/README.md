# N8N Workflow Export Instructions

Since N8N workflows are stored in the Docker volume, you'll need to export them manually.

## How to Export Your Workflows from N8N

1. **Open N8N**: http://localhost:5679
2. **Go to your workflow** (Resume Generation Automation)
3. **Click the "..." menu** (three dots) in the top right
4. **Select "Download"** or **"Export"**
5. **Save the JSON file** to this folder

## Alternative: Export via N8N UI

1. Open the workflow you want to share
2. Press **Ctrl+A** to select all nodes
3. Press **Ctrl+C** to copy
4. Create a new file `resume_generation_workflow.json`
5. Paste the copied JSON
6. Save the file

## Workflow Configuration Notes

Your current working workflow has these nodes:

1. **Webhook** - Triggers on POST to `/webhook-test/resume-generation`
2. **Get Job Details** - HTTP GET to `http://backend:8000/jobs/1`
3. **Get Resume** - HTTP GET to `http://backend:8000/resumes/4`
4. **Code (Ollama Call)** - Generates tailored resume using TinyLlama
5. **Prepare Payload** - Formats data for save
6. **Save Application** - HTTP POST to `http://backend:8000/applications/`

## Import Instructions (for Others)

When someone clones your repo, they can import the workflow:

1. Start Docker services: `docker-compose up -d`
2. Open N8N: http://localhost:5679
3. Click **"+"** → **"Import from File"**
4. Select the JSON file from this folder
5. Activate the workflow

**Note:** The workflow will work once the backend and Ollama are running!
