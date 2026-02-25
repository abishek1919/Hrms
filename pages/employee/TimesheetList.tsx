import React, { useEffect, useState } from 'react';
import styles from './TimesheetList.module.css';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Timesheet, TimesheetStatus } from '../../types';
import { Card, Badge, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Trash2, Plus, Calendar, History, Home, ArrowRight } from 'lucide-react';

export const TimesheetList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const data = await api.timesheet.list({ employeeId: user.id });
        setTimesheets(data);
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleCreateNew = async () => {
      if (!user) return;
      const today = new Date();
      const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = timesheets.find(t => t.month === monthStr);
      if (existing) {
          navigate(`/employee/timesheet/${existing.id}`);
          return;
      }

      const newSheet = await api.timesheet.create(user.id, monthStr);
      navigate(`/employee/timesheet/${newSheet.id}`);
  };

  const handleDeleteTimesheet = async (e: React.MouseEvent, id: string) => {
      // Complete isolation of the click event
      e.preventDefault();
      e.stopPropagation();
      
      if (window.confirm('Are you sure you want to delete this draft timesheet? This cannot be undone.')) {
          try {
              // Optimistic UI update
              setTimesheets(prev => prev.filter(t => t.id !== id));
              // API call
              await api.timesheet.delete(id);
          } catch (error) {
              console.error("Delete failed:", error);
              alert("Failed to delete. Please refresh and try again.");
              // Re-sync on error
              if (user) {
                  const data = await api.timesheet.list({ employeeId: user.id });
                  setTimesheets(data);
              }
          }
      }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Retrieving Logs</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-2 no-scrollbar overflow-x-auto py-1">
           <button 
             onClick={() => navigate('/employee/dashboard')}
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:text-primary-600 transition-all shadow-sm shrink-0"
           >
             <Home size={14} /> Home
           </button>
           <ChevronRight size={12} className="text-slate-300 shrink-0" />
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-black text-primary-700 shadow-sm shrink-0 uppercase tracking-widest">
             Activity History
           </div>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Timesheet Archives</h1>
                <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                    Manage your monthly cycles and historical session data.
                </p>
            </div>
            <Button 
                onClick={handleCreateNew} 
                className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-200/50 hover:-translate-y-0.5 transition-all"
            >
                <Plus size={18} className="mr-2" /> Start New Log
            </Button>
        </div>

        {/* Archives Table */}
        <Card className="overflow-hidden bg-white border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[2.5rem]">
             <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full">
                     <thead className="bg-gray-50/50 border-b border-gray-100">
                         <tr>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Period</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Sync Date</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Work Duration</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification</th>
                             <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest pr-16">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {timesheets.map(ts => {
                             const isDeletable = ts.status === TimesheetStatus.DRAFT;
                             const totalHours = ts.entries.reduce((a,c) => a+c.hours, 0);
                             
                             return (
                                 <tr 
                                    key={ts.id} 
                                    className="hover:bg-primary-50/20 transition-all group"
                                 >
                                     {/* Period Column - Clickable */}
                                     <td 
                                        className="px-10 py-8 cursor-pointer"
                                        onClick={() => navigate(`/employee/timesheet/${ts.id}`)}
                                     >
                                         <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                                 <Calendar size={22} />
                                             </div>
                                             <div>
                                                 <p className="text-lg font-black text-gray-900 tracking-tight">{ts.month}</p>
                                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Cycle</p>
                                             </div>
                                         </div>
                                     </td>
                                     {/* Sync Column - Clickable */}
                                     <td 
                                        className="px-10 py-8 cursor-pointer"
                                        onClick={() => navigate(`/employee/timesheet/${ts.id}`)}
                                     >
                                         <p className="text-sm font-bold text-gray-600">
                                             {ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Continuous Sync'}
                                         </p>
                                     </td>
                                     {/* Duration Column - Clickable */}
                                     <td 
                                        className="px-10 py-8 cursor-pointer"
                                        onClick={() => navigate(`/employee/timesheet/${ts.id}`)}
                                     >
                                         <div className="flex items-center gap-2">
                                             <span className="text-xl font-black text-gray-900 tracking-tighter">{totalHours}</span>
                                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Logged Hours</span>
                                         </div>
                                     </td>
                                     {/* Status Column - Clickable */}
                                     <td 
                                        className="px-10 py-8 cursor-pointer"
                                        onClick={() => navigate(`/employee/timesheet/${ts.id}`)}
                                     >
                                         <Badge status={ts.status} className="rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest" />
                                     </td>
                                     {/* Actions Column - NOT clickable as a whole, buttons only */}
                                     <td className="px-10 py-8 pr-16 text-right">
                                         <div className="flex items-center justify-end gap-3">
                                             {isDeletable && (
                                                <button 
                                                    type="button"
                                                    onClick={(e) => handleDeleteTimesheet(e, ts.id)}
                                                    className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm"
                                                    title="Delete Draft"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                             )}
                                             <button 
                                                onClick={() => navigate(`/employee/timesheet/${ts.id}`)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                             >
                                                 <ChevronRight size={24} />
                                             </button>
                                         </div>
                                     </td>
                                 </tr>
                             );
                         })}
                         {timesheets.length === 0 && (
                             <tr>
                                 <td colSpan={5} className="p-24 text-center">
                                     <div className="flex flex-col items-center gap-4 opacity-30">
                                         <History size={64} className="text-gray-400" />
                                         <p className="text-sm font-black uppercase tracking-widest">No activity records discovered</p>
                                     </div>
                                 </td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
        </Card>
    </div>
  );
};
