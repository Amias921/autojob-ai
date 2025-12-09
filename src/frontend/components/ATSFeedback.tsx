'use client';

import React, { useState } from 'react';

interface ATSFeedbackProps {
    feedback?: string | null;
    score?: number | null;
    grade?: string | null;
}

export default function ATSFeedback({ feedback, score, grade }: ATSFeedbackProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!feedback) {
        return null;
    }

    let parsedFeedback;
    try {
        parsedFeedback = typeof feedback === 'string' ? JSON.parse(feedback) : feedback;
    } catch (e) {
        console.error('Failed to parse ATS feedback:', e);
        return null;
    }

    const { suggestions = [], strengths = [], missing_keywords = [] } = parsedFeedback;

    if (!suggestions.length && !strengths.length && !missing_keywords.length) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-slate-900">ATS Analysis & Suggestions</h4>
                </div>
                <svg
                    className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Strengths */}
                    {strengths.length > 0 && (
                        <div>
                            <h5 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <span>✓</span> Strengths
                            </h5>
                            <ul className="space-y-1">
                                {strengths.map((strength: string, idx: number) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <span className="text-green-500 mt-0.5">•</span>
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Suggestions for Improvement */}
                    {suggestions.length > 0 && (
                        <div>
                            <h5 className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <span>⚠</span> Improvements
                            </h5>
                            <ul className="space-y-1">
                                {suggestions.map((suggestion: string, idx: number) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <span className="text-orange-500 mt-0.5">•</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Missing Keywords */}
                    {missing_keywords.length > 0 && (
                        <div>
                            <h5 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <span>🔍</span> Consider Adding Keywords
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {missing_keywords.map((keyword: string, idx: number) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
