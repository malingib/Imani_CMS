import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return <div className="min-h-screen bg-slate-50 font-sans">{children}</div>;
}
