'use client';

import React, { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import ResumeDisplay from '@/components/ResumeDisplay';
import { fetchApplications, fetchJobDetails } from '@/lib/api';

interface Application {
    id: number;
    job_id: number;
    resume_id: number;
    status: string;
    created_at: string;
    generated_content?: string;
}

interface JobDetails {
    id: number;
    title: string;
    company: string;
    description: string;
    url?: string;
}



export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedApp, setExpandedApp] = useState<number | null>(null);
    const [jobDetails, setJobDetails] = useState<Record<number, JobDetails>>({});
    const [loadingJob, setLoadingJob] = useState<number | null>(null);

    useEffect(() => {
        loadApplications();
    }, []);

    async function loadApplications() {
        try {
            setError(null);
            const data = await fetchApplications();
            setApplications(data);
        } catch (err) {
            setError('Failed to load applications. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadJobDetails(jobId: number) {
        if (jobDetails[jobId]) return; // Already loaded

        setLoadingJob(jobId);
        try {
            const data = await fetchJobDetails(jobId);
            setJobDetails(prev => ({ ...prev, [jobId]: data }));
        } catch (err) {
            console.error('Failed to load job details:', err);
        } finally {
            setLoadingJob(null);
        }
    }

    async function toggleExpand(app: Application) {
        if (expandedApp === app.id) {
            setExpandedApp(null);
        } else {
            setExpandedApp(app.id);
            await loadJobDetails(app.job_id);
        }
    }

    function printResume(content: string) {
        // Create a new window with only the resume
        const printWindow = window.open('', '_blank', 'width=850,height=1100');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume</title>
                <style>
                    body {
                        font-family: Georgia, 'Times New Roman', serif;
                        color: #1a1a1a;
                        line-height: 1.6;
                        padding: 0.5in 0.75in;
                        margin: 0;
                    }
                    @media print {
                        body { padding: 0.5in 0.75in; }
                    }
                    pre {
                        white-space: pre-wrap;
                        font-family: Georgia, 'Times New Roman', serif;
                        font-size: 13px;
                        margin: 0;
                    }
                </style>
            </head>
            <body>
                <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </body>
            </html>
        `);
        printWindow.document.close();

        // Wait a moment for content to load, then print
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    async function downloadPDF(applicationId: number) {
        try {
            // Download the PDF
            const response = await fetch(`http://localhost:8005/applications/${applicationId}/download-pdf`);

            if (!response.ok) {
                throw new Error('PDF not found or not generated yet');
            }

            // Create a blob from the response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resume_application_${applicationId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            alert('PDF not available. Try generating it from N8N workflow first.');
        }
    }


    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'generated':
                return 'bg-green-100 text-green-700 ring-1 ring-green-600/20';
            case 'draft':
                return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-600/20';
            case 'applied':
                return 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20';
            case 'rejected':
                return 'bg-red-100 text-red-700 ring-1 ring-red-600/20';
            default:
                return 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Application Tracker</h1>
                    <p className="text-sm text-slate-500">Monitor your job application progress</p>
                </div>
                <button
                    onClick={loadApplications}
                    className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {error && <ErrorMessage message={error} />}

            {loading ? (
                <div className="py-20 flex justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-12 text-center">
                    <div className="mx-auto h-12 w-12 text-slate-300">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No applications yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Generate resumes from the Jobs page to get started!</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Job
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Resume
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Date Created
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {applications.map((app) => {
                                    const isExpanded = expandedApp === app.id;
                                    const job = jobDetails[app.job_id];

                                    return (
                                        <React.Fragment key={app.id}>
                                            <tr className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleExpand(app)}>
                                                <td className="px-6 py-4 text-sm">
                                                    {loadingJob === app.job_id ? (
                                                        <div className="flex items-center gap-2">
                                                            <LoadingSpinner size="sm" />
                                                            <span className="text-slate-500">Loading...</span>
                                                        </div>
                                                    ) : job ? (
                                                        <div>
                                                            <div className="font-medium text-slate-900">{job.title}</div>
                                                            <div className="text-slate-500">{job.company}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500">Job #{app.job_id}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    Resume #{app.resume_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                                                        {isExpanded ? (
                                                            <>
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                </svg>
                                                                Hide
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                                View
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-4 bg-slate-50">
                                                        {job && (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Job Description:</h4>
                                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{job.description}</p>
                                                                </div>
                                                                {app.generated_content && (
                                                                    <div>
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <h4 className="text-sm font-semibold text-slate-900">Tailored Resume:</h4>
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={() => printResume(app.generated_content || '')}
                                                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center gap-1"
                                                                                >
                                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                                                    </svg>
                                                                                    Print
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => downloadPDF(app.id)}
                                                                                    className="text-green-600 hover:text-green-900 text-sm font-medium flex items-center gap-1"
                                                                                >
                                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                    </svg>
                                                                                    Download PDF
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                                                            <ResumeDisplay content={app.generated_content} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
