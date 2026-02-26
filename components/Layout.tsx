
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
    LogOut,
    LayoutTemplate,
    Clock,
    CheckSquare,
    BarChart3,
    Menu,
    X,
    LayoutDashboard,
    CalendarDays,
    User as UserIcon,
    ShieldCheck,
    Settings,
    ShieldAlert,
    Briefcase,
    Fingerprint,
    Zap,
    GanttChart,
    Database,
    Cpu
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { tokens } from '../styles/tokens';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  count?: number;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, active, count, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all text-sm font-black mb-2 group ${
      active
        ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 scale-[1.02]'
        : 'text-slate-500 hover:bg-white hover:text-primary-600 hover:shadow-sm'
    }`}
  >
    <div className="flex items-center gap-4">
        <span className={active ? 'text-white' : 'text-slate-300 group-hover:text-primary-600 transition-colors'}>{icon}</span>
        <span className="tracking-tight uppercase text-[11px]">{label}</span>
    </div>
    {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-600'}`}>
            {count}
        </span>
    )}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return <>{children}</>;

  const getLinks = () => {
    switch (user.role) {
      case Role.EMPLOYEE:
        return [
          { to: '/employee/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
          { to: '/employee/timesheets', icon: <Clock size={18} />, label: 'Timesheets' },
          { to: '/employee/calendar', icon: <CalendarDays size={18} />, label: 'Calendar' },
          { to: '/employee/leaves', icon: <CalendarDays size={18} />, label: 'Time Off' },
          // profile link moved to the header avatar dropdown
        ];
      case Role.MANAGER:
        return [
          { to: '/manager/dashboard', icon: <LayoutDashboard size={18} />, label: 'Leadership' },
          { to: '/manager/team-timesheets', icon: <Clock size={18} />, label: 'Team Archive' },
          { to: '/manager/approvals', icon: <CheckSquare size={18} />, label: 'Approvals' },
          { to: '/manager/reports', icon: <BarChart3 size={18} />, label: 'Analytics' },
          // profile link moved to header
        ];
      case Role.HR:
        return [
          { to: '/hr/dashboard', icon: <Cpu size={18} />, label: 'HQ Intelligence' },
          { to: '/hr/dashboard', icon: <GanttChart size={18} />, label: 'Resource Matrix' },
          { to: '/hr/dashboard', icon: <ShieldCheck size={18} />, label: 'Policy Audit' },
          { to: '/hr/dashboard', icon: <Fingerprint size={18} />, label: 'Financial Core' },
          { to: '/profile', icon: <ShieldAlert size={18} />, label: 'Security Node' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-80 bg-[#F1F5F9]/50 border-r border-slate-200 fixed h-full z-20 backdrop-blur-md">
        <div className="p-10 flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-2xl shadow-2xl shadow-slate-200">
            <LayoutTemplate className="text-white" size={26} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-950 tracking-tighter uppercase leading-none">BowHrms</h1>
          </div>
        </div>

        <nav className="flex-1 px-8 py-4 overflow-y-auto no-scrollbar">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 px-5">
            Command Center
          </div>
          {getLinks().map((link, idx) => (
            <SidebarLink
              key={idx}
              {...link}
              active={location.pathname === link.to && (idx === 0 || user.role !== Role.HR)}
            />
          ))}
          
          {user.role === Role.HR && (
            <div className="mt-12 px-2">
               <div className="p-6 bg-slate-950 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Pulse</span>
                    </div>
                    <div className="flex items-end gap-1 mb-4 h-10">
                        {[40, 70, 45, 90, 65, 80, 50, 95, 60, 75].map((h, i) => (
                            <div 
                                key={i} 
                                className="w-1 bg-primary-500/30 rounded-full transition-all duration-500 group-hover:bg-primary-500" 
                                style={{ height: `${h}%`, animation: `pulse-bar 1.5s ease-in-out infinite ${i * 0.1}s` }}
                            ></div>
                        ))}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                        Real-time encrypted link established with Cloud Core.
                    </p>
                  </div>
                  <style>{`
                    @keyframes pulse-bar {
                        0%, 100% { height: 40%; }
                        50% { height: 90%; }
                    }
                  `}</style>
               </div>
            </div>
          )}
        </nav>

        {/* desktop header with avatar dropdown */}
        {/* this area moved into main content instead, so sidebar no longer contains a profile card */}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <div className="bg-slate-950 p-2 rounded-xl shadow-lg">
                <LayoutTemplate className="text-white" size={18} />
            </div>
            <span className="font-black text-slate-900 tracking-tighter uppercase text-sm">BowHrms</span>
         </div>
         <UserMenu />
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-40 pt-24 px-8 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
              <nav className="space-y-4">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">Operations Menu</div>
                  {getLinks().map((link, idx) => (
                    <SidebarLink
                        key={idx}
                        {...link}
                        active={location.pathname === link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                  ))}
                  <button
                    onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center w-full h-16 text-sm font-black text-white rounded-[2rem] bg-slate-950 mt-12 shadow-xl shadow-slate-200"
                  >
                    <LogOut size={20} className="mr-3" />
                    Terminate Session
                  </button>
              </nav>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-80 p-6 md:p-12 pt-28 md:pt-12 overflow-y-auto h-screen bg-[#F8FAFC] scroll-smooth">
        <div className="max-w-[1400px] mx-auto">
            {/* desktop header with avatar */}
            <header className="hidden md:flex justify-end items-center" style={{ marginBottom: tokens.spacing.lg }}>
                <UserMenu />
            </header>
            {children}
        </div>
      </main>
    </div>
  );
};
