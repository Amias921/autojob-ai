import requests
import os
import time
from typing import Dict, List, Optional, Tuple

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = "llama3"

# Model configurations with metadata
AVAILABLE_MODELS = {
    "llama3": {
        "display_name": "Llama 3",
        "description": "Meta's flagship model - balanced quality and speed",
        "recommended_tokens": 1000,
        "temperature": 0.7,
        "use_case": "General purpose, best overall quality"
    },
    "mistral": {
        "display_name": "Mistral 7B",
        "description": "Excellent for structured content generation",
        "recommended_tokens": 1200,
        "temperature": 0.7,
        "use_case": "Professional writing, structured output"
    },
    "phi3": {
        "display_name": "Phi-3",
        "description": "Small but capable - very fast",
        "recommended_tokens": 800,
        "temperature": 0.6,
        "use_case": "Quick iterations, speed priority"
    },
    "qwen2.5": {
        "display_name": "Qwen 2.5",
        "description": "Strong reasoning and multilingual support",
        "recommended_tokens": 1000,
        "temperature": 0.7,
        "use_case": "Complex reasoning, multilingual resumes"
    },
    "tinyllama": {
        "display_name": "TinyLlama",
        "description": "Lightweight model for testing",
        "recommended_tokens": 600,
        "temperature": 0.7,
        "use_case": "Resource-constrained environments"
    }
}

def get_available_models() -> List[Dict]:
    """
    Returns list of available models with their metadata.
    """
    models = []
    for model_name, config in AVAILABLE_MODELS.items():
        models.append({
            "name": model_name,
            **config
        })
    return models

def test_model_availability(model_name: str) -> bool:
    """
    Check if a model is available in Ollama.
    """
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            available = response.json().get("models", [])
            return any(model_name in m.get("name", "") for m in available)
        return False
    except requests.exceptions.RequestException as e:
        print(f"Error checking model availability: {e}")
        return False

def generate_tailored_resume(
    base_resume_text: str, 
    job_description: str,
    model_name: Optional[str] = None
) -> Tuple[str, Dict]:
    """
    Generates a tailored resume using Ollama with specified model.
    
    Args:
        base_resume_text: The candidate's base resume content
        job_description: The job posting description
        model_name: Optional model to use (defaults to llama3)
    
    Returns:
        Tuple of (generated_resume_content, metadata_dict)
        metadata includes: model_used, generation_time, tokens_used
    """
    # Use default model if not specified or invalid
    if not model_name or model_name not in AVAILABLE_MODELS:
        model_name = DEFAULT_MODEL
    
    model_config = AVAILABLE_MODELS[model_name]
    
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
        "model": model_name,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": model_config["recommended_tokens"],
            "temperature": model_config["temperature"]
        }
    }
    
    metadata = {
        "model_used": model_name,
        "generation_time": 0.0,
        "tokens_used": 0
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120)
        end_time = time.time()
        
        response.raise_for_status()
        result = response.json()
        
        metadata["generation_time"] = round(end_time - start_time, 2)
        metadata["tokens_used"] = result.get("eval_count", 0)
        
        return result.get("response", ""), metadata
        
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama using {model_name}: {e}")
        
        # Try fallback to default model if different
        if model_name != DEFAULT_MODEL:
            print(f"Falling back to {DEFAULT_MODEL}")
            return generate_tailored_resume(base_resume_text, job_description, DEFAULT_MODEL)
        
        return "", metadata
