'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">AutoJob<span className="text-indigo-600">AI</span></span>
                        </Link>

                        <div className="hidden sm:flex sm:space-x-1">
                            <NavLink href="/dashboard" active={pathname === '/dashboard'}>Dashboard</NavLink>
                            <NavLink href="/jobs" active={pathname === '/jobs'}>Jobs</NavLink>
                            <NavLink href="/resumes" active={pathname === '/resumes'}>Resumes</NavLink>
                            <NavLink href="/applications" active={pathname === '/applications'}>Applications</NavLink>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm border border-indigo-200">
                            AA
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${active
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
        >
            {children}
        </Link>
    );
}
