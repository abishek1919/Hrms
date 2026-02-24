
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Timesheet } from '../../types';
import { Card, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Home, 
  ChevronRight, 
  Activity, 
  Zap, 
  Users,
  Loader2
} from 'lucide-react';

export const ManagerReports: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);

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

  const chartData = timesheets.reduce((acc: any[], curr) => {
    const hours = curr.entries.reduce((a,c) => a+c.hours, 0);
    const existing = acc.find(item => item.name === curr.employeeName);
    if (existing) existing.hours += hours;
    else acc.push({ name: curr.employeeName, hours });
    return acc;
  }, []);

  const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
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
             Team Intelligence
           </div>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
              <p className="text-gray-500 mt-2 font-medium">Performance tracking and team utilization metrics.</p>
          </div>
          <Button className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl">
              <Download size={18} className="mr-2" /> Export Dataset
          </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-10 bg-white border-0 shadow-sm rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      <TrendingUp size={24} className="text-primary-600" />
                      Hours Distribution
                  </h3>
              </div>
              <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={40}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </Card>

          <div className="space-y-8">
              <Card className="p-8 bg-slate-900 text-white border-0 shadow-xl rounded-[2.5rem] relative overflow-hidden">
                  <div className="relative z-10">
                      <div className="p-4 bg-white/10 rounded-2xl w-fit mb-6">
                        <Users size={24} className="text-primary-400" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Team Effort</p>
                      <p className="text-4xl font-black tracking-tight mb-2">
                        {chartData.reduce((a,c) => a+c.hours, 0)} <span className="text-sm opacity-40">HRS</span>
                      </p>
                      <div className="flex items-center gap-2 text-green-400 font-bold text-xs mt-4">
                          <Activity size={14} /> +12% vs last cycle
                      </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full"></div>
              </Card>

              <Card className="p-8 bg-white border-0 shadow-sm rounded-[2.5rem]">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Efficiency Snapshot</h4>
                   <div className="space-y-6">
                       <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-gray-600">Review Completion</span>
                           <span className="text-sm font-black text-gray-900">92%</span>
                       </div>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-primary-600 w-[92%]"></div>
                       </div>
                       <div className="flex justify-between items-center pt-2">
                           <span className="text-xs font-bold text-gray-600">Submission Accuracy</span>
                           <span className="text-sm font-black text-gray-900">88%</span>
                       </div>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-purple-600 w-[88%]"></div>
                       </div>
                   </div>
              </Card>
          </div>
      </div>
    </div>
  );
};
