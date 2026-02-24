
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Timesheet, TimesheetStatus } from '../../types';
import { Card, Badge, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  Home, 
  ChevronRight, 
  Search, 
  Filter, 
  ArrowRight,
  Loader2,
  FileCheck
} from 'lucide-react';

export const ManagerApprovals: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        setLoading(true);
        const data = await api.manager.getPending(user.id);
        setPending(data);
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const filtered = useMemo(() => {
    return pending.filter(p => 
      p.employeeName.toLowerCase().includes(search.toLowerCase()) || 
      p.month.includes(search)
    );
  }, [pending, search]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Approval Queue</p>
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
             Pending Approvals
           </div>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                    Approvals Queue
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Verify and sign-off on team submissions.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.length > 0 ? (
                filtered.map(ts => (
                    <Card key={ts.id} className="p-10 bg-white border-0 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group rounded-[3rem] relative overflow-hidden">
                        <div className="flex items-start justify-between mb-10">
                            <div className="flex items-center gap-5">
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${ts.employeeName}&background=random`} 
                                    className="w-16 h-16 rounded-2xl border-4 border-slate-50 shadow-md object-cover transition-transform group-hover:scale-105" 
                                    alt={ts.employeeName} 
                                />
                                <div>
                                    <p className="text-xl font-black text-gray-900 leading-tight">{ts.employeeName}</p>
                                    <Badge status={ts.status} className="mt-2 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest shadow-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Month</span>
                                <span className="text-sm font-black text-gray-900">{ts.month}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Hours</span>
                                <span className="text-sm font-black text-primary-600">{ts.entries.reduce((a,c) => a+c.hours, 0)}h</span>
                            </div>
                        </div>

                        <Button 
                            onClick={() => navigate(`/manager/review/${ts.id}`)}
                            className="w-full rounded-2xl h-14 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-200/50"
                        >
                            Review & Approve <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </Card>
                ))
            ) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle2 size={48} />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-2 uppercase">Queue Empty</h4>
                    <p className="text-gray-400 font-bold max-w-xs leading-relaxed">
                        No pending timesheets require your signature at this moment.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};
