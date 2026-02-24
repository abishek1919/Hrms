
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Timesheet } from '../../types';
import { Card, Badge, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, History, Home, Search, Filter } from 'lucide-react';

export const ManagerTeamTimesheets: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const data = await api.manager.getTeamTimesheets(user.id);
        setTimesheets(data);
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const filtered = timesheets.filter(t => 
    t.employeeName.toLowerCase().includes(search.toLowerCase()) || 
    t.month.includes(search)
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Scanning Archives</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <nav className="flex items-center gap-2 mb-2 no-scrollbar overflow-x-auto py-1">
           <button 
             onClick={() => navigate('/manager/dashboard')}
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:text-primary-600 transition-all shadow-sm shrink-0"
           >
             <Home size={14} /> Home
           </button>
           <ChevronRight size={12} className="text-slate-300 shrink-0" />
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-black text-primary-700 shadow-sm shrink-0 uppercase tracking-widest">
             Team Archives
           </div>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Team Submissions</h1>
                <p className="text-gray-500 mt-2 font-medium">Overview of all active and historical team logs.</p>
            </div>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search subordinates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 h-14 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all shadow-sm"
                />
            </div>
        </div>

        <Card className="overflow-hidden bg-white border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[2.5rem]">
             <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-left">
                     <thead className="bg-gray-50/50 border-b border-gray-100">
                         <tr>
                             <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subordinate</th>
                             <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                             <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Logged Hours</th>
                             <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification</th>
                             <th className="px-10 py-6 text-right pr-16 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {filtered.map(ts => (
                             <tr key={ts.id} className="hover:bg-primary-50/20 transition-all group">
                                 <td className="px-10 py-8">
                                     <div className="flex items-center gap-4">
                                         <img 
                                            src={`https://ui-avatars.com/api/?name=${ts.employeeName}&background=random`} 
                                            className="w-12 h-12 rounded-2xl border border-slate-100 shadow-sm"
                                            alt={ts.employeeName}
                                         />
                                         <div>
                                             <p className="text-lg font-black text-gray-900 tracking-tight leading-none">{ts.employeeName}</p>
                                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Direct Report</p>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="px-10 py-8 text-sm font-black text-gray-600 uppercase tracking-widest">{ts.month}</td>
                                 <td className="px-10 py-8">
                                     <div className="flex items-center gap-2">
                                         <span className="text-xl font-black text-gray-900 tracking-tighter">{ts.entries.reduce((a,c) => a+c.hours,0)}</span>
                                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Hours</span>
                                     </div>
                                 </td>
                                 <td className="px-10 py-8">
                                     <Badge status={ts.status} className="rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest" />
                                 </td>
                                 <td className="px-10 py-8 text-right pr-16">
                                     <button 
                                        onClick={() => navigate(`/manager/review/${ts.id}`)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                     >
                                         <ChevronRight size={24} />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                         {filtered.length === 0 && (
                             <tr>
                                 <td colSpan={5} className="p-24 text-center">
                                     <div className="flex flex-col items-center gap-4 opacity-30">
                                         <History size={64} className="text-gray-400" />
                                         <p className="text-sm font-black uppercase tracking-widest">No matching records found</p>
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
