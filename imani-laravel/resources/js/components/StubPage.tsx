import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types/inertia';
import { Construction } from 'lucide-react';

interface StubPageProps extends PageProps {
    title: string;
    subtitle?: string;
}

export default function StubPage({ auth, activeChurch, churches, title, subtitle }: StubPageProps) {
    return (
        <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
            <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-brand-primary tracking-tight uppercase">{title}</h2>
                    {subtitle && <p className="text-slate-500 mt-2 text-base sm:text-lg font-medium">{subtitle}</p>}
                </div>
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-20 h-20 bg-brand-indigo/10 text-brand-indigo rounded-[2rem] flex items-center justify-center mb-6">
                        <Construction size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Coming Soon</h3>
                    <p className="text-slate-400 font-medium text-sm mt-3 max-w-md">
                        This module is being migrated to the Laravel backend. Check back soon.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
