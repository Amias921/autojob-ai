'use client';

import React, { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { fetchJobs, fetchResumes, generateTailoredResume } from '@/lib/api';

interface Job {
    id: number;
    title: string;
    company: string;
    fetched_at: string;
    description?: string;
}

interface Resume {
    id: number;
    name: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState<number | null>(null);
    const [selectedResume, setSelectedResume] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [expandedJob, setExpandedJob] = useState<number | null>(null);


    useEffect(() => {
        loadJobs();
        loadResumes();
    }, []);

    async function loadJobs() {
        try {
            setError(null);
            const data = await fetchJobs();
            setJobs(data);
        } catch (err) {
            setError('Failed to load jobs. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadResumes() {
        try {
            const data = await fetchResumes();
            setResumes(data);
            if (data.length > 0) {
                setSelectedResume(data[0].id);
            }
        } catch (err) {
            console.error('Failed to load resumes:', err);
        }
    }

    async function handleGenerateResume(jobId: number) {
        if (!selectedResume) {
            setError('Please upload a resume first before generating');
            return;
        }

        setGenerating(jobId);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await generateTailoredResume(selectedResume, jobId);
            setSuccessMessage('Resume generated successfully! Check the Applications page.');
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            setError('Failed to generate resume. Please try again.');
            console.error(err);
        } finally {
            setGenerating(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
                    <p className="text-sm text-slate-500">Find and apply to relevant opportunities</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {resumes.length > 0 && (
                        <div className="relative">
                            <select
                                value={selectedResume || ''}
                                onChange={(e) => setSelectedResume(Number(e.target.value))}
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 pr-8 bg-white"
                            >
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={loadJobs}
                        className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
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
            ) : jobs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-12 text-center">
                    <div className="mx-auto h-12 w-12 text-slate-300">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No jobs found</h3>
                    <p className="mt-1 text-sm text-slate-500">Run the N8N workflow to fetch jobs automatically.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job) => {
                        const isExpanded = expandedJob === job.id;

                        return (
                            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow animate-fadeIn">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                    New
                                                </span>
                                            </div>
                                            <p className="text-slate-600 font-medium">{job.company}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(job.fetched_at).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Remote
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleGenerateResume(job.id)}
                                            disabled={generating === job.id || !selectedResume}
                                            className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2 ${generating === job.id || !selectedResume ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {generating === job.id ? (
                                                <>
                                                    <LoadingSpinner size="sm" />
                                                    <span>Generating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Generate Resume
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Job Description - Always Visible */}
                                {job.description && (
                                    <div className="border-t border-slate-200 pt-4 mt-4">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-2">Job Description:</h3>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{job.description}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
