"""
Job Search Utility using JobSpy
Fetches job postings from multiple sources (Indeed, LinkedIn, ZipRecruiter, etc.)
"""

from jobspy import scrape_jobs
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime


def search_jobs(
    search_term: str,
    location: str = "Remote",
    results_wanted: int = 10,
    hours_old: int = 72,
    country_indeed: str = "USA"
) -> List[Dict]:
    """
    Search for jobs using JobSpy
    
    Args:
        search_term: Job title or keywords (e.g., "Software Engineer", "Cybersecurity")
        location: Location or "Remote"
        results_wanted: Number of results to fetch
        hours_old: Only show jobs posted within this many hours
        country_indeed: Country for Indeed search
        
    Returns:
        List of job dictionaries with standardized fields
    """
    
    try:
        # Use JobSpy to scrape jobs
        jobs_df = scrape_jobs(
            site_name=["indeed", "linkedin", "zip_recruiter"],
            search_term=search_term,
            location=location,
            results_wanted=results_wanted,
            hours_old=hours_old,
            country_indeed=country_indeed
        )
        
        # Convert DataFrame to list of dicts
        if jobs_df is None or jobs_df.empty:
            return []
        
        # Standardize and clean job data
        jobs_list = []
        for _, row in jobs_df.iterrows():
            job = {
                "title": str(row.get("title", "Unknown Title")),
                "company": str(row.get("company", "Unknown Company")),
                "location": str(row.get("location", location)),
                "description": str(row.get("description", "")),
                "url": str(row.get("job_url", "")),
                "source": str(row.get("site", "Unknown")),
                "date_posted": row.get("date_posted", datetime.now()),
                "job_type": str(row.get("job_type", "Full-time")),
                "salary": str(row.get("interval", "")) if pd.notna(row.get("interval")) else None
            }
            jobs_list.append(job)
        
        return jobs_list
        
    except Exception as e:
        print(f"Error searching jobs: {e}")
        return []


def deduplicate_jobs(jobs: List[Dict]) -> List[Dict]:
    """
    Remove duplicate jobs based on title and company
    """
    seen = set()
    unique_jobs = []
    
    for job in jobs:
        key = (job["title"].lower(), job["company"].lower())
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    return unique_jobs


def format_job_description(description: str, max_length: int = 1000) -> str:
    """
    Clean and truncate job description
    """
    if not description:
        return "No description available"
    
    # Remove excessive whitespace
    cleaned = " ".join(description.split())
    
    # Truncate if too long
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length] + "..."
    
    return cleaned
