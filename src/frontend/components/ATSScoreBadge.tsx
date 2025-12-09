'use client';

import React from 'react';

interface ATSScoreBadgeProps {
    score?: number | null;
    grade?: string | null;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function ATSScoreBadge({
    score,
    grade,
    size = 'md',
    showLabel = true
}: ATSScoreBadgeProps) {

    if (score === null || score === undefined) {
        return null;
    }

    // Determine color based on score/grade
    const getColorClasses = () => {
        if (score >= 90 || grade === 'excellent') {
            return 'bg-green-100 text-green-800 ring-green-600/20';
        } else if (score >= 75 || grade === 'good') {
            return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
        } else if (score >= 60 || grade === 'fair') {
            return 'bg-orange-100 text-orange-800 ring-orange-600/20';
        } else {
            return 'bg-red-100 text-red-800 ring-red-600/20';
        }
    };

    const getIcon = () => {
        if (score >= 90) return '⭐';
        if (score >= 75) return '✓';
        if (score >= 60) return '⚠';
        return '✗';
    };

    const getGradeText = () => {
        if (!grade) {
            if (score >= 90) return 'Excellent';
            if (score >= 75) return 'Good';
            if (score >= 60) return 'Fair';
            return 'Needs Work';
        }
        return grade.charAt(0).toUpperCase() + grade.slice(1);
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5'
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset ${getColorClasses()} ${sizeClasses[size]}`}
            title={`ATS Score: ${score}/100 - ${getGradeText()}`}
        >
            <span>{getIcon()}</span>
            <span className="font-semibold">{score}</span>
            {showLabel && size !== 'sm' && (
                <span className="hidden sm:inline">{getGradeText()}</span>
            )}
        </span>
    );
}
