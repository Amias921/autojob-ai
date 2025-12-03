'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchJobs, fetchResumes, fetchApplications } from '@/lib/api';

export default function DashboardPage() {
    const [stats, setStats] = useState({ jobs: 0, resumes: 0, applications: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        try {
            const [jobs, resumes, applications] = await Promise.all([
                fetchJobs(),
                fetchResumes(),
                fetchApplications(),
            ]);
            setStats({
                jobs: jobs.length,
                resumes: resumes.length,
                applications: applications.length,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">Overview of your job search automation</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        System Operational
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <StatsCard
                            title="Jobs Found"
                            value={stats.jobs}
                            icon={
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                            color="bg-blue-500"
                            link="/jobs"
                        />
                        <StatsCard
                            title="Resumes Uploaded"
                            value={stats.resumes}
                            icon={
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            }
                            color="bg-indigo-500"
                            link="/resumes"
                        />
                        <StatsCard
                            title="Applications Generated"
                            value={stats.applications}
                            icon={
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            }
                            color="bg-purple-500"
                            link="/applications"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                <Link href="/resumes" className="group flex items-center p-4 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-slate-900">Upload New Resume</p>
                                        <p className="text-xs text-slate-500">Add a base resume to start tailoring</p>
                                    </div>
                                    <svg className="ml-auto h-5 w-5 text-slate-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/jobs" className="group flex items-center p-4 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-slate-900">Search for Jobs</p>
                                        <p className="text-xs text-slate-500">Find new opportunities to apply for</p>
                                    </div>
                                    <svg className="ml-auto h-5 w-5 text-slate-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                How it works
                            </h2>
                            <div className="relative">
                                <div className="absolute top-0 left-4 h-full w-0.5 bg-slate-200"></div>
                                <ul className="space-y-6 relative">
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold ring-4 ring-white z-10">1</div>
                                        <div className="ml-4 pt-1">
                                            <p className="text-sm font-medium text-slate-900">Upload Resume</p>
                                            <p className="text-sm text-slate-500">Upload your base PDF or DOCX resume.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold ring-4 ring-white z-10">2</div>
                                        <div className="ml-4 pt-1">
                                            <p className="text-sm font-medium text-slate-900">Find Jobs</p>
                                            <p className="text-sm text-slate-500">System automatically fetches jobs daily.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold ring-4 ring-white z-10">3</div>
                                        <div className="ml-4 pt-1">
                                            <p className="text-sm font-medium text-slate-900">Generate & Apply</p>
                                            <p className="text-sm text-slate-500">AI tailors your resume for each job.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, color, link }: { title: string, value: number, icon: React.ReactNode, color: string, link: string }) {
    return (
        <Link href={link} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all duration-200">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                        {icon}
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View details
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
