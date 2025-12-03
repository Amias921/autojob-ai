'use client';

import React, { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { fetchResumes, uploadResume, deleteResume } from '@/lib/api';

interface Resume {
    id: number;
    name: string;
    created_at: string;
}

export default function ResumesPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        loadResumes();
    }, []);

    async function loadResumes() {
        try {
            setError(null);
            const data = await fetchResumes();
            setResumes(data);
        } catch (err) {
            setError('Failed to load resumes. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (file: File) => {
        // Validate file type
        const validTypes = ['.pdf', '.docx', '.txt'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!validTypes.includes(fileExtension)) {
            setError('Please upload a PDF, DOCX, or TXT file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await uploadResume(file, file.name);
            await loadResumes();
            setSuccessMessage('Resume uploaded successfully!');
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            setError('Failed to upload resume. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    async function handleDeleteResume(resumeId: number, resumeName: string) {
        if (!confirm(`Are you sure you want to delete "${resumeName}"? This action cannot be undone.`)) {
            return;
        }

        setError(null);
        setSuccessMessage(null);

        try {
            await deleteResume(resumeId);
            await loadResumes();
            setSuccessMessage('Resume deleted successfully!');
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            setError('Failed to delete resume. Please try again.');
            console.error(err);
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Resumes</h1>
                    <p className="text-sm text-slate-500">Manage your base resumes for tailoring</p>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeIn flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Upload Card */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer h-64 ${dragActive
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'
                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.txt"
                            onChange={handleChange}
                            disabled={uploading}
                        />

                        {uploading ? (
                            <>
                                <LoadingSpinner size="md" />
                                <p className="mt-4 text-sm font-medium text-slate-900">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900">Upload New Resume</h3>
                                <p className="mt-1 text-xs text-slate-500">Drag & drop or click to browse</p>
                                <p className="mt-2 text-xs text-slate-400">PDF, DOCX, or TXT up to 5MB</p>
                            </>
                        )}
                    </div>

                    {/* Resume Cards */}
                    {resumes.map((resume) => (
                        <div key={resume.id} className="card p-6 flex flex-col justify-between h-64 hover:shadow-md transition-shadow animate-fadeIn group">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteResume(resume.id, resume.name);
                                        }}
                                        className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete resume"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <h3 className="font-semibold text-lg mt-4 text-slate-900 line-clamp-2" title={resume.name}>

                                    {resume.name}
                                </h3>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                <span className="text-slate-500">
                                    {new Date(resume.created_at).toLocaleDateString()}
                                </span>
                                <a
                                    href={`http://localhost:8005/resumes/${resume.id}/download`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 font-medium hover:underline cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
