const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';

export async function fetchJobs() {
    const res = await fetch(`${API_URL}/jobs/`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
}

export async function fetchResumes() {
    const res = await fetch(`${API_URL}/resumes/`);
    if (!res.ok) throw new Error('Failed to fetch resumes');
    return res.json();
}

export async function uploadResume(file: File, name: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    const res = await fetch(`${API_URL}/resumes/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload resume');
    return res.json();
}

export async function generateTailoredResume(resumeId: number, jobId: number) {
    const res = await fetch(`${API_URL}/applications/generate?resume_id=${resumeId}&job_id=${jobId}`, {
        method: 'POST',
    });

    if (!res.ok) throw new Error('Failed to generate resume');
    return res.json();
}

export async function fetchApplications() {
    const res = await fetch(`${API_URL}/applications/`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
}

export async function fetchJobDetails(jobId: number) {
    const res = await fetch(`${API_URL}/jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch job details');
    return res.json();
}


export async function fetchApplicationDetails(applicationId: number) {
    const res = await fetch(`${API_URL}/applications/${applicationId}`);
    if (!res.ok) throw new Error('Failed to fetch application details');
    return res.json();
}

export async function deleteResume(resumeId: number) {
    const res = await fetch(`${API_URL}/resumes/${resumeId}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete resume');
    return res.json();
}

