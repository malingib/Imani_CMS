import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Wallet,
    CalendarDays,
    Settings as SettingsIcon,
    LogOut,
    Layers,
    MessageSquare,
    BarChart3,
    PieChart,
    BookOpen,
    X,
    Sparkles,
    Building2,
    ChevronDown,
    ShieldCheck,
    CreditCard,
    Globe,
    Receipt,
    Activity,
    Mail,
    DollarSign,
} from 'lucide-react';
import { UserRole } from '@/types';
import { ImaniLogoIcon } from '@/components/brand/ImaniLogoIcon';
import { AuthUser, Church } from '@/types/inertia';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    roles: UserRole[];
    match?: string[];
}

const platformItems: Omit<NavItem, 'roles'>[] = [
    { href: '/platform', label: 'Platform Overview', icon: Activity, match: ['/platform'] },
    { href: '/platform/tenants', label: 'Tenants', icon: Building2 },
    { href: '/platform/invitations', label: 'Invitations', icon: Mail },
    { href: '/platform/billing', label: 'Billing', icon: DollarSign },
    { href: '/platform/settings', label: 'Platform Settings', icon: Globe },
];

const adminItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { href: '/members', label: 'Congregation', icon: Users, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
    { href: '/finance', label: 'Finance Hub', icon: Receipt, roles: [UserRole.ADMIN, UserRole.TREASURER, UserRole.SUPER_ADMIN] },
    { href: '/events', label: 'Calendar', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
    { href: '/communication', label: 'Outreach', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
    { href: '/groups', label: 'Departments', icon: Layers, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { href: '/reports', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { href: '/analytics', label: 'Analytics', icon: PieChart, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { href: '/sermons', label: 'Sermon Archive', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { href: '/audit-logs', label: 'System Audit', icon: ShieldCheck, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { href: '/billing', label: 'Subscription', icon: CreditCard, roles: [UserRole.ADMIN] },
];

const memberItems: NavItem[] = [
    { href: '/portal', label: 'My Sanctuary', icon: Sparkles, roles: [UserRole.MEMBER] },
    { href: '/sermons', label: 'Sermon Archive', icon: BookOpen, roles: [UserRole.MEMBER] },
    { href: '/giving', label: 'Stewardship', icon: Wallet, roles: [UserRole.MEMBER] },
];

const branches = ['Nairobi Central', 'Mombasa Branch', 'Kisumu Branch', 'Nakuru Branch'];

interface AppSidebarProps {
    currentUser: AuthUser;
    activeChurch: Church | null;
    churches: Church[];
    isOpen?: boolean;
    onClose?: () => void;
}

const isActive = (href: string, url: string, match?: string[]) => {
    if (match) return match.some((m) => url === m || url.startsWith(m + '/'));
    return url === href || url.startsWith(href + '/');
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
    currentUser,
    activeChurch,
    churches,
    isOpen,
    onClose,
}) => {
    const { url } = usePage();
    const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
    const [isChurchMenuOpen, setIsChurchMenuOpen] = useState(false);

    const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;
    const menuItems = currentUser.role === UserRole.MEMBER ? memberItems : adminItems;
    const filteredItems = menuItems.filter((item) => item.roles.includes(currentUser.role));

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleChurchSwitch = (churchId: string | null) => {
        router.post('/platform/church-switch', { churchId }, { preserveScroll: true });
        setIsChurchMenuOpen(false);
        onClose?.();
    };

    return (
        <aside
            className={`
      w-64 h-full bg-white text-slate-600 fixed left-0 top-0 flex flex-col border-r border-slate-100 shadow-2xl lg:shadow-sm z-[70] transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10">
                            <ImaniLogoIcon />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-brand-primary uppercase">Imani CMS</h1>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Enterprise SaaS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {isSuperAdmin && churches.length > 0 && (
                    <div className="mb-6 relative">
                        <button
                            onClick={() => setIsChurchMenuOpen(!isChurchMenuOpen)}
                            className="w-full flex items-center justify-between p-3 bg-brand-indigo/5 border border-brand-indigo/20 rounded-2xl group hover:border-brand-indigo transition-all"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <Building2 size={16} className="text-brand-indigo" />
                                <div className="text-left min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Viewing Church</p>
                                    <p className="text-xs font-bold text-brand-indigo truncate">{activeChurch?.name || 'All Churches'}</p>
                                </div>
                            </div>
                            <ChevronDown size={14} className={`text-slate-300 transition-transform ${isChurchMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isChurchMenuOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <button
                                    onClick={() => handleChurchSwitch(null)}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold border-b border-slate-50 ${!activeChurch ? 'bg-slate-100 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    All Churches (Platform View)
                                </button>
                                {churches.map((church) => (
                                    <button
                                        key={church.id}
                                        onClick={() => handleChurchSwitch(church.id)}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold border-b last:border-0 border-slate-50 ${activeChurch?.id === church.id ? 'bg-slate-100 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {church.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!isSuperAdmin && currentUser.role !== UserRole.MEMBER && (
                    <div className="mb-6 relative">
                        <button
                            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                            className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-brand-primary transition-all"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <Building2 size={16} className="text-brand-primary" />
                                <div className="text-left min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Parish</p>
                                    <p className="text-xs font-bold text-slate-700 truncate">{currentUser.branch || branches[0]}</p>
                                </div>
                            </div>
                            <ChevronDown size={14} className={`text-slate-300 transition-transform ${isBranchMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isBranchMenuOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {branches.map((branch) => (
                                    <button
                                        key={branch}
                                        onClick={() => setIsBranchMenuOpen(false)}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold border-b last:border-0 border-slate-50 ${currentUser.branch === branch ? 'bg-slate-100 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {branch}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                {isSuperAdmin && !activeChurch && (
                    <>
                        <p className="px-4 pt-2 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform</p>
                        {platformItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href, url, item.match);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                                        active ? 'bg-brand-indigo/10 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon size={18} className={active ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                        <div className="my-3 mx-4 border-t border-slate-100" />
                    </>
                )}

                {isSuperAdmin && activeChurch && (
                    <div className="px-4 py-2 mb-1">
                        <button
                            onClick={() => handleChurchSwitch(null)}
                            className="text-[10px] font-bold text-brand-indigo hover:underline flex items-center gap-1"
                        >
                            ← Back to Platform
                        </button>
                    </div>
                )}

                {isSuperAdmin && activeChurch && (
                    <p className="px-4 pt-1 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">{activeChurch?.name || 'Church'}</p>
                )}

                {!isSuperAdmin && (
                    <p className="px-4 pt-2 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Navigation</p>
                )}

                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, url, item.match);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                                active ? 'bg-brand-primary/5 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Icon size={18} className={active ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-2">
                {!isSuperAdmin && currentUser.role !== UserRole.MEMBER && (
                    <Link
                        href="/settings"
                        onClick={onClose}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/settings', url) ? 'bg-brand-primary/5 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <SettingsIcon size={18} className={isActive('/settings', url) ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
                        <span className="text-sm">Church Settings</span>
                    </Link>
                )}

                <div className="mt-4 p-4 rounded-2xl bg-slate-50 flex items-center gap-3 border border-slate-100/50">
                    <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter truncate">{currentUser.role}</p>
                    </div>
                    <button onClick={handleLogout} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
