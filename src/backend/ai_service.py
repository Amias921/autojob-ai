import requests
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL_NAME = "llama3" # Or mistral, phi3

def generate_tailored_resume(base_resume_text: str, job_description: str) -> str:
    """
    Generates a tailored resume using Ollama.
    """
    prompt = f"""
    You are an expert resume writer. 
    
    JOB DESCRIPTION:
    {job_description}
    
    CANDIDATE RESUME:
    {base_resume_text}
    
    TASK:
    Rewrite the candidate's resume to specifically target the job description above.
    - Highlight relevant skills and experience.
    - Use keywords from the job description.
    - Maintain a professional tone.
    - Do not invent false information.
    
    OUTPUT:
    Provide ONLY the markdown content of the new resume.
    """
    
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload)
        response.raise_for_status()
        return response.json().get("response", "")
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama: {e}")
        return ""
