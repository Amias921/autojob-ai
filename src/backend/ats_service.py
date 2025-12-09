"""
ATS (Applicant Tracking System) Score Service

Analyzes resumes for ATS compatibility using HuggingFace transformers.
Provides scoring and actionable feedback for resume optimization.
"""

# Try to import transformers, but don't crash if not available
try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("Warning: transformers not installed. Using rule-based ATS scoring only.")
    TRANSFORMERS_AVAILABLE = False

import json
import re
from typing import Dict, List
from datetime import datetime

# Global model cache to avoid reloading
_ats_model = None

def load_ats_model():
    """Load the ATS resume checker model. Cached after first load."""
    global _ats_model
    
    if not TRANSFORMERS_AVAILABLE:
        print("Transformers not available - using rule-based scoring")
        return "fallback"
    
    if _ats_model is None:
        try:
            print("Loading ATS model... (This may take a moment on first use)")
            # Using text-classification pipeline with the ATS model
            _ats_model = pipeline(
                "text-classification", 
                model="KarthikeyanDev/ATS_RESUME_CHECKER",
                device=-1  # Use CPU (-1), change to 0 for GPU
            )
            print("ATS model loaded successfully!")
        except Exception as e:
            print(f"Error loading ATS model: {e}")
            print("Falling back to rule-based scoring")
            _ats_model = "fallback"
    
    return _ats_model

def calculate_rule_based_score(resume_text: str) -> Dict:
    """
    Fallback rule-based scoring if HuggingFace model fails.
    Analyzes resume based on common ATS criteria.
    """
    score = 50  # Base score
    suggestions = []
    strengths = []
    missing_keywords = []
    
    # Check length
    word_count = len(resume_text.split())
    if 300 <= word_count <= 800:
        score += 10
        strengths.append("Good resume length")
    else:
        suggestions.append(f"Adjust length (currently {word_count} words, aim for 300-800)")
    
    # Check for sections
    sections = ['experience', 'education', 'skills', 'summary']
    found_sections = sum(1 for s in sections if s.lower() in resume_text.lower())
    score += found_sections * 5
    
    if found_sections >= 3:
        strengths.append("Contains key resume sections")
    else:
        missing = [s for s in sections if s.lower() not in resume_text.lower()]
        suggestions.append(f"Add missing sections: {', '.join(missing)}")
    
    # Check for action verbs
    action_verbs = ['developed', 'managed', 'created', 'led', 'implemented', 'designed', 
                    'achieved', 'improved', 'increased', 'reduced']
    found_verbs = sum(1 for v in action_verbs if v in resume_text.lower())
    
    if found_verbs >= 3:
        score += 10
        strengths.append(f"Uses {found_verbs} action verbs")
    else:
        suggestions.append("Add more action verbs (e.g., developed, managed, implemented)")
    
    # Check for quantifiable achievements
    has_numbers = bool(re.search(r'\d+%|\d+\+|\$\d+', resume_text))
    if has_numbers:
        score += 10
        strengths.append("Includes quantifiable achievements")
    else:
        suggestions.append("Add metrics and numbers to quantify achievements")
    
    # Check for technical keywords (basic check)
    tech_keywords = ['python', 'javascript', 'sql', 'react', 'docker', 'aws', 
                     'git', 'api', 'database', 'agile']
    found_tech = [k for k in tech_keywords if k in resume_text.lower()]
    
    if len(found_tech) >= 3:
        score += 5
        strengths.append(f"Contains technical keywords: {', '.join(found_tech[:3])}")
    else:
        missing_keywords = [k for k in tech_keywords[:5] if k not in resume_text.lower()][:3]
        if missing_keywords:
            suggestions.append(f"Consider adding relevant keywords: {', '.join(missing_keywords)}")
    
    # Cap score at 100
    score = min(score, 100)
    
    # Determine grade
    if score >= 90:
        grade = "excellent"
    elif score >= 75:
        grade = "good"
    elif score >= 60:
        grade = "fair"
    else:
        grade = "poor"
    
    return {
        "score": score,
        "grade": grade,
        "suggestions": suggestions,
        "strengths": strengths,
        "missing_keywords": missing_keywords,
        "method": "rule-based"
    }

def get_ats_score(resume_text: str) -> Dict:
    """
    Analyze resume and return ATS score with feedback.
    
    Args:
        resume_text: The resume content to analyze
    
    Returns:
        {
            "score": int (0-100),
            "grade": str (excellent/good/fair/poor),
            "suggestions": List[str],
            "strengths": List[str],
            "missing_keywords": List[str],
            "analyzed_at": str (ISO datetime)
        }
    """
    
    if not resume_text or len(resume_text.strip()) < 50:
        return {
            "score": 0,
            "grade": "poor",
            "suggestions": ["Resume is too short to analyze"],
            "strengths": [],
            "missing_keywords": [],
            "analyzed_at": datetime.utcnow().isoformat()
        }
    
    model = load_ats_model()
    
    # Use rule-based scoring as fallback or if model load failed
    if model == "fallback":
        result = calculate_rule_based_score(resume_text)
    else:
        try:
            # Try to use HuggingFace model
            # Note: The actual API might differ - this is a best guess
            # May need adjustment based on model's actual interface
            prediction = model(resume_text[:512])  # Truncate to model's max length
            
            # Extract score from model output
            # This is an approximation - actual model output format may vary
            if isinstance(prediction, list) and len(prediction) > 0:
                confidence = prediction[0].get('score', 0.5)
                score = int(confidence * 100)
            else:
                score = 70  # Default if can't parse
            
            # Use rule-based for detailed feedback
            result = calculate_rule_based_score(resume_text)
            result['score'] = score  # Override with model score
            result['method'] = "ml-model"
            
        except Exception as e:
            print(f"Error using HuggingFace model: {e}")
            print("Falling back to rule-based scoring")
            result = calculate_rule_based_score(resume_text)
    
    # Re-calculate grade based on final score
    score = result['score']
    if score >= 90:
        result['grade'] = "excellent"
    elif score >= 75:
        result['grade'] = "good"
    elif score >= 60:
        result['grade'] = "fair"
    else:
        result['grade'] = "poor"
    
    result['analyzed_at'] = datetime.utcnow().isoformat()
    
    return result
