import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { ImaniLogoIcon } from '@/components/brand/ImaniLogoIcon';
import { ToastProvider } from '@/components/ToastProvider';
import { AuthUser, Church } from '@/types/inertia';
import { AppNotification } from '@/types';
import NotificationsPanel from '@/components/NotificationsPanel';

interface AppLayoutProps {
    auth: { user: AuthUser };
    activeChurch: Church | null;
    churches: Church[];
    notifications?: AppNotification[];
    children: React.ReactNode;
}

export default function AppLayout({ auth, activeChurch, churches, notifications = [], children }: AppLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const currentUser = auth.user;
    const churchId = activeChurch?.id || currentUser.churchId;

    return (
        <ToastProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
                <AppSidebar
                    currentUser={currentUser}
                    activeChurch={activeChurch}
                    churches={churches}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <main className="flex-1 min-h-screen lg:ml-64 transition-all">
                    <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                            >
                                <Menu size={22} />
                            </button>
                            <div className="lg:hidden w-10 h-10">
                                <ImaniLogoIcon />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary opacity-60 truncate hidden sm:block">
                                Imani Enterprise {churchId ? '• Viewing Church' : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-slate-100 text-brand-primary' : 'text-slate-400 hover:text-brand-primary hover:bg-slate-50'}`}
                            >
                                <Bell size={22} />
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-primary rounded-full border-2 border-white animate-pulse" />
                            </button>
                            {isNotificationsOpen && (
                                <NotificationsPanel
                                    notifications={notifications}
                                    onClose={() => setIsNotificationsOpen(false)}
                                    onMarkAsRead={() => {}}
                                    onMarkAllAsRead={() => {}}
                                    onDelete={() => {}}
                                />
                            )}
                            <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block" />
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-1">{currentUser.role}</p>
                                </div>
                                <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-primary/10" />
                            </div>
                        </div>
                    </header>
                    <div className="p-10 max-w-[1600px] mx-auto pb-20">{children}</div>
                </main>
            </div>
        </ToastProvider>
    );
}
