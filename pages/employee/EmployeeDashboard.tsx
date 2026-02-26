
import React, { useEffect, useState, useMemo } from 'react';
import styles from './EmployeeDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Timesheet, TimesheetStatus, User as UserType, ManagerApprovalStatus, LeaveRequest, LeaveStatus } from '../../types';
import { Card, Button, Badge } from '../../components/ui';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  LogIn, 
  LogOut, 
  Plane, 
  AlertTriangle, 
  Bell, 
  MoreHorizontal, 
  X, 
  Loader2, 
  CheckCircle, 
  Info, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Activity, 
  Award, 
  Star, 
  Plus, 
  ShieldCheck,
  Target,
  Timer,
  Check,
  UserCheck,
  Users,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'info' | 'alert';
  link?: string;
}

interface CalendarEvent {
    date: string; // YYYY-MM-DD
    title: string;
    type: 'holiday' | 'meeting' | 'deadline';
    region?: 'USA' | 'India' | 'Tamil Nadu' | 'Global';
    description?: string;
}

const GOVERNMENT_HOLIDAYS: CalendarEvent[] = [
    // Global/Shared
    { date: '2025-01-01', title: "New Year's Day", type: 'holiday', region: 'Global', description: 'Global Celebration' },
    { date: '2025-12-25', title: 'Christmas Day', type: 'holiday', region: 'Global', description: 'Public Holiday' },

    // India National 2025
    { date: '2025-01-26', title: 'Republic Day', type: 'holiday', region: 'India', description: 'National Holiday' },
    { date: '2025-03-29', title: 'Holi', type: 'holiday', region: 'India' },
    { date: '2025-04-14', title: 'Baisakhi', type: 'holiday', region: 'India' },
    { date: '2025-05-01', title: 'Labor Day', type: 'holiday', region: 'India' },
    { date: '2025-08-15', title: 'Independence Day', type: 'holiday', region: 'India', description: 'National Holiday' },
    { date: '2025-10-02', title: 'Gandhi Jayanti', type: 'holiday', region: 'India', description: 'National Holiday' },
    { date: '2025-10-23', title: 'Diwali (Laxmi Puja)', type: 'holiday', region: 'India' },
    { date: '2025-11-04', title: 'Guru Nanak Jayanti', type: 'holiday', region: 'India' },

    // India National 2026
    { date: '2026-01-01', title: "New Year's Day", type: 'holiday', region: 'Global' },
    { date: '2026-01-26', title: 'Republic Day', type: 'holiday', region: 'India' },
    { date: '2026-03-17', title: 'Holi', type: 'holiday', region: 'India' },
    { date: '2026-04-14', title: 'Baisakhi', type: 'holiday', region: 'India' },
    { date: '2026-05-01', title: 'Labor Day', type: 'holiday', region: 'India' },
    { date: '2026-08-15', title: 'Independence Day', type: 'holiday', region: 'India' },
    { date: '2026-10-02', title: 'Gandhi Jayanti', type: 'holiday', region: 'India' },
    { date: '2026-10-12', title: 'Diwali (Laxmi Puja)', type: 'holiday', region: 'India' },
    { date: '2026-11-13', title: 'Guru Nanak Jayanti', type: 'holiday', region: 'India' },

    // Tamil Nadu Specific
    { date: '2025-01-14', title: 'Pongal', type: 'holiday', region: 'Tamil Nadu', description: 'Harvest Festival' },
    { date: '2025-01-15', title: 'Thiruvalluvar Day', type: 'holiday', region: 'Tamil Nadu', description: 'Cultural Holiday' },
    { date: '2025-01-16', title: 'Uzhavar Thirunal', type: 'holiday', region: 'Tamil Nadu', description: 'Farmers Festival' },
    { date: '2025-04-14', title: 'Tamil New Year', type: 'holiday', region: 'Tamil Nadu', description: 'Puthandu / Ambedkar Jayanti' },
    { date: '2025-10-20', title: 'Deepavali', type: 'holiday', region: 'Tamil Nadu', description: 'Festival of Lights (Observed)' },

    // USA Federal
    { date: '2025-01-20', title: 'MLK Jr. Day', type: 'holiday', region: 'USA', description: 'Federal Holiday' },
    { date: '2025-02-17', title: "Presidents' Day", type: 'holiday', region: 'USA', description: 'Federal Holiday' },
    { date: '2025-05-26', title: 'Memorial Day', type: 'holiday', region: 'USA', description: 'Federal Holiday' },
    { date: '2025-06-19', title: 'Juneteenth', type: 'holiday', region: 'USA', description: 'Federal Holiday' },
    { date: '2025-07-04', title: 'Independence Day', type: 'holiday', region: 'USA', description: 'National Holiday' },
    { date: '2025-09-01', title: 'Labor Day', type: 'holiday', region: 'USA', description: 'Federal Holiday' },
    { date: '2025-10-13', title: 'Indigenous Peoples Day', type: 'holiday', region: 'USA', description: 'Federal Holiday' },
    { date: '2025-11-11', title: 'Veterans Day', type: 'holiday', region: 'USA', description: 'National Holiday' },
    { date: '2025-11-27', title: 'Thanksgiving', type: 'holiday', region: 'USA', description: 'Federal Holiday' },
];

const ConfettiBurst: React.FC = () => {
    const particles = useMemo(() => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.8) * 300,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            delay: Math.random() * 0.2,
            duration: Math.random() * 1.5 + 1,
            rotation: Math.random() * 360,
        }));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-[100]">
            <style>
                {`
                @keyframes confetti-pop {
                    0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; }
                    50% { opacity: 1; }
                    100% { transform: translate(var(--tw-x), var(--tw-y)) scale(0.5) rotate(var(--tw-rot)); opacity: 0; }
                }
                .confetti-p {
                    animation: confetti-pop var(--tw-dur) cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                    animation-delay: var(--tw-delay);
                }
                `}
            </style>
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="confetti-p absolute rounded-sm shadow-sm"
                    style={{
                        backgroundColor: p.color,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        '--tw-x': `${p.x}px`,
                        '--tw-y': `${p.y}px`,
                        '--tw-dur': `${p.duration}s`,
                        '--tw-delay': `${p.delay}s`,
                        '--tw-rot': `${p.rotation}deg`
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

export const EmployeeDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailed, setShowDetailed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
  
  const [managers, setManagers] = useState<UserType[]>([]);
  const [isRequestingManager, setIsRequestingManager] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [nextLeave, setNextLeave] = useState<LeaveRequest | null>(null);

  const [isCheckedIn, setIsCheckedIn] = useState(() => {
      return localStorage.getItem('is_checked_in') === 'true';
  });

  const [time, setTime] = useState(new Date());

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'Timesheet Approved', message: 'Your September log was approved.', time: '2h ago', read: false, type: 'success', link: '/employee/timesheets' },
    { id: '2', title: 'Policy Update', message: 'New remote work rules applied.', time: 'Yesterday', read: true, type: 'info', link: '/profile' }
  ]);

  useEffect(() => {
    if (!sessionStorage.getItem('dashboard_visited')) {
        setTriggerConfetti(true);
        sessionStorage.setItem('dashboard_visited', 'true');
    }
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const data = await api.timesheet.list({ employeeId: user.id });
        setTimesheets(data);
        
        const managerList = await api.manager.listManagers();
        setManagers(managerList);
        // reset search whenever the list updates
        setManagerSearch('');

        // compute next approved leave
        try {
          const leaveList = await api.leave.list({ employeeId: user.id });
          // consider approved or pending future leaves
          const now = new Date();
          const upcoming = leaveList
            .filter(l => (l.status === LeaveStatus.APPROVED || l.status === LeaveStatus.SUBMITTED) && new Date(l.startDate) >= now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
          setNextLeave(upcoming || null);
        } catch (err) {
          console.error('failed loading leaves', err);
        }

        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleAction = async () => {
      if (!user) return;
      const today = new Date();
      const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const existing = timesheets.find(t => t.month === monthStr);
      let targetId = existing?.id;

      if (!isCheckedIn) {
          localStorage.setItem('is_checked_in', 'true');
          setIsCheckedIn(true);
          if (!targetId) {
              setLoading(true);
              const newSheet = await api.timesheet.create(user.id, monthStr);
              targetId = newSheet.id;
          }
          navigate(`/employee/timesheet/${targetId}`);
      } else {
          localStorage.setItem('is_checked_in', 'false');
          setIsCheckedIn(false);
      }
  };

  const handleManagerRequest = async (managerId: string) => {
    if (!user) return;
    setIsRequestingManager(true);
    try {
        const updatedUser = await api.user.requestManager(user.id, managerId);
        login(updatedUser);
        setShowManagerModal(false);
    } catch (error) {
        alert("Failed to send join request.");
    } finally {
        setIsRequestingManager(false);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  };

  const markAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const changeMonth = (offset: number) => {
      const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1);
      setCalendarDate(newDate);
      setSelectedDate(null);
  };

  const getHolidayForDay = (day: number) => {
      const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return GOVERNMENT_HOLIDAYS.find(h => h.date === dateStr);
  };

  const nextHoliday = useMemo(() => {
    const now = new Date();
    return GOVERNMENT_HOLIDAYS.find(h => new Date(h.date) >= now) || GOVERNMENT_HOLIDAYS[0];
  }, []);

  const renderCalendarDays = () => {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      
      const days = [];
      for (let i = 0; i < firstDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
      }
      
      const today = new Date();
      for (let d = 1; d <= daysInMonth; d++) {
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = d === selectedDate;
          const holiday = getHolidayForDay(d);
          
          days.push(
              <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`h-9 w-9 flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all transform active:scale-90 relative
                      ${isSelected ? 'bg-primary-600 text-white shadow-md z-10' : 
                        isToday ? 'bg-primary-50 text-primary-600 border border-primary-100' : 
                        holiday ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                  {d}
                  {holiday && !isSelected && (
                      <div className="absolute top-0.5 right-0.5">
                          <Star size={6} className="fill-orange-400 text-orange-400" />
                      </div>
                  )}
              </button>
          );
      }
      return days;
  };

  const getTimeComponents = (date: Date) => {
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return {
          hh: String(hours).padStart(2, '0'),
          mm: String(date.getMinutes()).padStart(2, '0'),
          ss: String(date.getSeconds()).padStart(2, '0'),
          ampm
      };
  };

  const timeInfo = getTimeComponents(time);
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Synchronizing Workspace</p>
        </div>
    </div>
  );

  const selectedHoliday = selectedDate ? getHolidayForDay(selectedDate) : null;
  const currentManager = managers.find(m => m.id === user?.managerId);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative">
            {triggerConfetti && <ConfettiBurst />}
            <div className="flex items-center gap-3">
                <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight">
                    Dashboard
                </h1>
                <div className="bg-primary-50 px-3 py-1 rounded-full border border-primary-100 flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Employee Dashboard</span>
                </div>
            </div>
            <p className="text-gray-500 mt-2 font-medium">
                <span className="font-bold text-gray-900">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Reporting Manager Button */}
            <button 
                onClick={() => setShowManagerModal(true)}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-100 transition-all group"
            >
                <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 rounded-xl transition-all">
                    <UserCheck size={18} />
                </div>
                <div className="text-left">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Reporting Lead</p>
                    <p className="text-sm font-black text-gray-900 truncate max-w-[140px]">
                        {user?.managerApprovalStatus === ManagerApprovalStatus.APPROVED && currentManager 
                            ? currentManager.name 
                            : user?.managerApprovalStatus === ManagerApprovalStatus.PENDING 
                            ? 'Approval Pending' 
                            : 'Select Manager'}
                    </p>
                </div>
            </button>

            <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-all relative group"
                >
                    <Bell size={22} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                </button>

                {showNotifications && (
                     <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-xl border border-gray-100 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-4">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="font-black text-gray-900 text-base">Inbox</h3>
                            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-6 border-b border-gray-50 hover:bg-gray-100 transition-all cursor-pointer group relative ${notif.read ? '' : 'bg-primary-50/10'}`}
                                    >
                                        {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600"></div>}
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                                notif.type === 'success' ? 'bg-green-100 text-green-600' : 
                                                notif.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {notif.type === 'success' ? <CheckCircle size={20} /> : notif.type === 'alert' ? <AlertTriangle size={20} /> : <Info size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-gray-900 leading-tight mb-1">{notif.title}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">{notif.message}</p>
                                                <div className="flex justify-between items-center mt-3">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{notif.time}</p>
                                                    {!notif.read && (
                                                        <button 
                                                            onClick={(e) => markAsRead(e, notif.id)}
                                                            className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-800 transition-colors"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center">
                                    <Bell className="text-gray-200 mx-auto mb-4" size={48} />
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No new updates</p>
                                </div>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <div className="p-4 border-t border-gray-50 bg-gray-50/30 text-center">
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        )}
                     </div>
                 )}
            </div>
            <Button onClick={() => navigate('/employee/timesheets')} className="rounded-2xl px-6 py-3 font-bold uppercase tracking-widest text-xs h-[52px]">
                <Activity size={18} className="mr-2" /> Activity Log
            </Button>
        </div>
      </header>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Modern Session Card & Clock */}
        <Card className="lg:col-span-8 p-10 relative overflow-hidden bg-white border-0 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] rounded-[2.5rem] flex flex-col justify-between min-h-[460px]">
            <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-10 lg:mb-14">
                    <div className="max-w-md">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border mb-6 transition-all duration-500 ${isCheckedIn ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' : 'bg-gray-100 text-gray-500 border-gray-200 shadow-sm'}`}>
                           <div className={`w-2.5 h-2.5 rounded-full ${isCheckedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                           {isCheckedIn ? 'STREAMING ACTIVE' : 'READY TO SYNC'}
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-4">
                            {isCheckedIn ? "You are Online" : "Ready to Start?"}
                        </h2>
                        <p className="text-gray-400 font-bold text-lg opacity-80 max-w-xs leading-snug">
                            {isCheckedIn ? "Tracking performance and attendance metrics in real-time." : "Authenticate your session to begin logging daily contributions."}
                        </p>
                    </div>
                </div>

                <div className="flex-1"></div>

                <div className="flex flex-col md:flex-row items-center gap-10 mt-auto bg-slate-50/50 p-4 rounded-[3rem] border border-white/80 backdrop-blur-sm self-start">
                    <button 
                        onClick={handleAction}
                        className={`w-full md:w-64 h-20 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.03] active:scale-95 group/btn border-0 shadow-xl relative overflow-hidden ${
                            isCheckedIn 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                    >
                        {isCheckedIn ? <LogOut size={32} /> : <LogIn size={32} />}
                        {isCheckedIn ? 'CLOCK OUT' : 'CLOCK IN'}
                    </button>

                    <div className="flex flex-col px-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-2 h-2 rounded-full bg-primary-600 animate-ping"></div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-black text-slate-950 tracking-tighter tabular-nums">
                                {timeInfo.hh}<span className="text-primary-600 animate-pulse">:</span>{timeInfo.mm}<span className="text-primary-600 animate-pulse">:</span>{timeInfo.ss}
                            </span>
                            <span className="text-xs font-black text-slate-400 uppercase">{timeInfo.ampm}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none transition-all duration-1000 ${isCheckedIn ? 'bg-green-500 -mr-60 -mt-60' : 'bg-primary-500 -mr-60 -mt-60'}`}></div>
        </Card>

        {/* MINIMALIST WORK EFFICIENCY CARD */}
        <Card className="lg:col-span-4 p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] flex flex-col items-center group/efficiency">
            <div className="w-full flex justify-between items-center mb-10">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp size={14} className="text-primary-600" />
                    Work Efficiency
                </h3>
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="75, 100"
                        strokeLinecap="round"
                        className="text-primary-600 transition-all duration-[2s]"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter">75%</span>
                    <span className="text-[9px] font-bold text-primary-600 uppercase tracking-widest mt-1">Excellent</span>
                </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-50">
                <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Logged</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900">120</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">H</span>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1 text-center border-l border-gray-50">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900">40</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">H</span>
                    </div>
                </div>
            </div>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      {showDetailed && (
          <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setShowDetailed(false)}>
              <Card className="w-full max-w-3xl p-8 rounded-[2rem] overflow-auto max-h-[80vh]" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-black">Detailed Billing Report</h2>
                      <button onClick={() => setShowDetailed(false)} className="text-gray-400 hover:text-red-500">
                          <X size={24} />
                      </button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours</th>
                                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {timesheets.map(ts => {
                                  const total = ts.entries.reduce((a,c) => a + c.hours, 0);
                                  return (
                                      <tr key={ts.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-4">{ts.month}</td>
                                          <td className="px-6 py-4">{ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : 'n/a'}</td>
                                          <td className="px-6 py-4">{total}h</td>
                                          <td className="px-6 py-4"><span className="text-xs font-bold uppercase">{ts.status}</span></td>
                                      </tr>
                                  );
                              })}
                              {timesheets.length === 0 && (
                                  <tr><td colSpan={4} className="py-12 text-center text-gray-400">No records available</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </Card>
          </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card 
            className="p-8 flex items-center gap-6 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer bg-white border-0 rounded-[2rem] group"
            onClick={() => navigate('/employee/leaves')}
          >
              <div className="p-6 bg-blue-50 text-blue-600 rounded-[1.75rem] group-hover:bg-primary-600 group-hover:text-white transition-all shadow-lg">
                  <Plane size={28} />
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Off</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tighter truncate">12<span className="text-sm font-bold opacity-40 ml-1">Days</span></p>
                  <div className="text-[10px] font-black text-blue-600 mt-2 uppercase flex items-center gap-2">
                      <Zap size={10} className="animate-pulse" />
                      Request Portal
                  </div>
              </div>
          </Card>

          <Card 
            className="p-8 flex items-center gap-6 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer bg-white border-0 rounded-[2rem] group"
            onClick={() => navigate('/employee/calendar')}
          >
              <div className="p-6 bg-purple-50 text-purple-600 rounded-[1.75rem] group-hover:bg-purple-600 group-hover:text-white transition-all shadow-lg">
                  <Calendar size={28} />
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Upcoming</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tighter truncate">
                    {nextLeave
                      ? new Date(nextLeave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : new Date(nextHoliday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }
                  </p>
                  <div className="text-[10px] font-black text-purple-600 mt-2 uppercase flex items-center gap-2">
                      <Info size={10} />
                      {nextLeave ? nextLeave.type : nextHoliday.title}
                  </div>
              </div>
          </Card>

      </div>

      {/* History Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
          <Card className="lg:col-span-8 overflow-hidden bg-white border-0 shadow-sm rounded-[2.5rem]">
             <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
                 <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     <Clock size={24} className="text-gray-400" />
                     Recent Billing
                 </h3>
                 <Button variant="outline" onClick={() => setShowDetailed(true)} className="rounded-xl px-5 text-xs font-bold border-gray-100">Detailed Report</Button>
             </div>
             <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full">
                     <thead className="bg-gray-50/30">
                         <tr>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Log Date</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                             <th className="px-10 py-6"></th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {timesheets.slice(0, 4).map(ts => (
                             <tr key={ts.id} className="hover:bg-primary-50/20 transition-all group">
                                 <td className="px-10 py-8 text-base font-black text-gray-900 tracking-tight whitespace-nowrap">{ts.month}</td>
                                 <td className="px-10 py-8 text-base font-black text-gray-900 tracking-tight whitespace-nowrap">{ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : 'Real-time Sync'}</td>
                                 <td className="px-10 py-8 text-base text-gray-900 font-black">{ts.entries.reduce((a,c) => a+c.hours, 0)}h</td>
                                 <td className="px-10 py-8"><Badge status={ts.status} className="rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest" /></td>
                                 <td className="px-10 py-8 text-right">
                                     <button onClick={() => navigate(`/employee/timesheet/${ts.id}`)} className="text-gray-400 hover:text-primary-600">
                                         <ChevronRight size={28} />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </Card>
          
          <Card className="lg:col-span-4 p-10 bg-white border-0 shadow-sm rounded-[2.5rem] flex flex-col">
              <h3 className="text-xl font-black text-gray-900 mb-10 tracking-tight uppercase flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-primary-600 rounded-full shadow-lg"></div>
                  Bulletin Board
              </h3>
              <div className="space-y-10 flex-1">
                  {[
                      { title: 'System Maintenance', desc: 'Maintenance on Oct 30, 01:00 AM.', icon: <Bell size={28} />, color: 'blue' },
                      { title: 'Policy Update', desc: 'Security module training live.', icon: <Zap size={28} />, color: 'orange' }
                  ].map((item, i) => (
                      <div key={i} className="flex gap-6 group cursor-pointer">
                          <div className={`w-16 h-16 rounded-[1.75rem] bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-md`}>
                              {item.icon}
                          </div>
                          <div>
                              <p className="text-base font-black text-gray-900 mb-1 leading-tight">{item.title}</p>
                              <p className="text-xs text-gray-500 leading-relaxed font-bold opacity-70">{item.desc}</p>
                              <p className="text-[9px] text-gray-400 mt-3 font-black uppercase tracking-widest">Posted Recently</p>
                          </div>
                      </div>
                  ))}
              </div>
          </Card>
      </div>

      {/* MANAGER SELECTION MODAL */}
      {showManagerModal && (
          <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowManagerModal(false)}>
              <Card className="w-full max-w-lg bg-white p-10 rounded-[3rem] shadow-2xl border-0 relative overflow-hidden flex flex-col gap-8" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                  
                  <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-3">
                          <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl shadow-sm">
                              <Users size={24} />
                          </div>
                          <div>
                              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Reporting Lead</h2>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select your manager</p>
                          </div>
                      </div>
                      <button onClick={() => setShowManagerModal(false)} className="text-gray-300 hover:text-red-500 hover:rotate-90 transition-all p-2 hover:bg-red-50 rounded-full">
                          <X size={28} />
                      </button>
                  </div>

                  <div className="relative z-10 space-y-4">
                      <div className="space-y-3">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input
                                  type="text"
                                  placeholder="Search reporting lead…"
                                  value={managerSearch}
                                  onChange={e => setManagerSearch(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 mb-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
                              />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                              {managers
                                  .filter(m => m.name.toLowerCase().includes(managerSearch.toLowerCase()))
                                  .map(m => (
                              <button
                                  key={m.id}
                                  onClick={() => handleManagerRequest(m.id)}
                                  disabled={isRequestingManager}
                                  className={`w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all group ${user?.managerId === m.id ? 'bg-primary-50 border-primary-200' : 'bg-white'}`}
                              >
                                  <div className="flex items-center gap-4">
                                      <img src={m.avatarUrl || `https://ui-avatars.com/api/?name=${m.name}&background=random`} className="w-12 h-12 rounded-xl border border-white shadow-sm" alt="" />
                                      <div className="text-left">
                                          <p className="text-sm font-black text-gray-900 group-hover:text-primary-700">{m.name}</p>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manager</p>
                                      </div>
                                  </div>
                                  {user?.managerId === m.id && (
                                      <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                                          <Check size={14} />
                                      </div>
                                  )}
                              </button>
                          ))}
                      </div>
                  </div>
                      {isRequestingManager && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="animate-spin text-primary-600" size={24} />
                        </div>
                      )}

                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mt-4">
                          <div className="flex items-start gap-4">
                              <Info size={20} className="text-primary-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                  Selecting a new manager will send them a join request. Once approved, you will be officially part of their reporting unit.
                              </p>
                          </div>
                      </div>
                  </div>
              </Card>
          </div>
      )}



    </div>
  );
};
