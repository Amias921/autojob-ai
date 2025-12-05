import React from 'react';
import styles from './resume.module.css';

interface ResumeDisplayProps {
    content: string;
}

export default function ResumeDisplay({ content }: ResumeDisplayProps) {
    // Parse the resume content into sections
    const parseResume = (text: string) => {
        const sections = {
            header: '',
            summary: '',
            experience: '',
            education: '',
            skills: '',
            certifications: ''
        };

        // Split by common section headers (case-insensitive)
        const lines = text.split('\n');
        let currentSection = 'header';

        lines.forEach((line) => {
            const lowerLine = line.toLowerCase();

            // Detect section headers
            if (lowerLine.includes('experience')) {
                currentSection = 'experience';
            } else if (lowerLine.includes('education')) {
                currentSection = 'education';
            } else if (lowerLine.includes('technical skills') || lowerLine.includes('skills')) {
                currentSection = 'skills';
            } else if (lowerLine.includes('certification') || lowerLine.includes('awards')) {
                currentSection = 'certifications';
            } else if (lowerLine.includes('summary') || lowerLine.includes('objective')) {
                currentSection = 'summary';
            } else {
                // Add content to current section
                sections[currentSection as keyof typeof sections] += line + '\n';
            }
        });

        return sections;
    };

    const sections = parseResume(content);

    return (
        <div className={styles.resumeContainer}>
            {/* Header / Contact Info */}
            <div className={styles.header}>
                <pre className={styles.headerText}>{sections.header.trim()}</pre>
            </div>

            {/* Professional Summary */}
            {sections.summary && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>PROFESSIONAL SUMMARY</h2>
                    <div className={styles.sectionDivider}></div>
                    <p className={styles.sectionContent}>{sections.summary.trim()}</p>
                </div>
            )}

            {/* Experience */}
            {sections.experience && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>EXPERIENCE</h2>
                    <div className={styles.sectionDivider}></div>
                    <pre className={styles.sectionContent}>{sections.experience.trim()}</pre>
                </div>
            )}

            {/* Education */}
            {sections.education && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>EDUCATION</h2>
                    <div className={styles.sectionDivider}></div>
                    <pre className={styles.sectionContent}>{sections.education.trim()}</pre>
                </div>
            )}

            {/* Technical Skills */}
            {sections.skills && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>TECHNICAL SKILLS</h2>
                    <div className={styles.sectionDivider}></div>
                    <pre className={styles.sectionContent}>{sections.skills.trim()}</pre>
                </div>
            )}

            {/* Certifications & Awards */}
            {sections.certifications && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>CERTIFICATIONS & AWARDS</h2>
                    <div className={styles.sectionDivider}></div>
                    <pre className={styles.sectionContent}>{sections.certifications.trim()}</pre>
                </div>
            )}
        </div>
    );
}
