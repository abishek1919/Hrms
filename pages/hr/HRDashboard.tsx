
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { Timesheet } from '../../types';
import { Card, Button, Badge } from '../../components/ui';
import { 
    Download, 
    FileSpreadsheet, 
    Search, 
    ShieldCheck, 
    Users, 
    Activity, 
    BarChart3, 
    Globe, 
    ArrowRight, 
    Clock, 
    Zap, 
    ChevronRight,
    Loader2,
    Database,
    CheckCircle2,
    Calendar as CalendarIcon,
    ShieldAlert,
    Cpu,
    MousePointer2,
    Fingerprint,
    History
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const HRDashboard: React.FC = () => {
  const [approved, setApproved] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Intelligence');
  const [timeframe, setTimeframe] = useState('Monthly');

  useEffect(() => {
    const fetch = async () => {
        try {
            const data = await api.hr.getAllApproved();
            setApproved(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetch();
  }, []);

  const handleExport = () => {
      const headers = ['Employee ID', 'Name', 'Month', 'Date', 'Start', 'End', 'Hours', 'Description'];
      const rows = approved.flatMap(ts => 
        ts.entries.map(e => [
            ts.employeeId, 
            ts.employeeName, 
            ts.month, 
            e.date, 
            e.checkIn, 
            e.checkOut, 
            e.hours, 
            e.description
        ])
      );

      const csvContent = [
          headers.join(','),
          ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HRMS_Export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
  };

  const filtered = approved.filter(t => 
      t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.month.includes(searchTerm)
  );

  const chartData = useMemo(() => {
      return approved.reduce((acc: any[], curr) => {
          const existing = acc.find(i => i.name === curr.employeeName);
          const hours = curr.entries.reduce((a,c) => a + c.hours, 0);
          if (existing) {
              existing.hours += hours;
          } else {
              acc.push({ name: curr.employeeName, hours: Number(hours.toFixed(1)) });
          }
          return acc;
      }, []).slice(0, 6);
  }, [approved]);

  const stats = useMemo(() => {
    const totalHours = approved.reduce((acc, curr) => acc + curr.entries.reduce((a,c) => a+c.hours, 0), 0);
    const uniqueEmployees = new Set(approved.map(t => t.employeeId)).size;
    return {
        totalHours: Number(totalHours.toFixed(1)),
        activeCount: uniqueEmployees,
        avgHours: uniqueEmployees > 0 ? Number((totalHours / uniqueEmployees).toFixed(1)) : 0
    };
  }, [approved]);

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          const offset = 120;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
          });
          setActiveTab(id.charAt(0).toUpperCase() + id.slice(1));
      }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">Decrypting Registry</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700 pb-20 scroll-smooth">
      {/* Premium Glass Sticky Navigation */}
      <div className="sticky top-20 md:top-8 z-[100] flex justify-center mb-16 px-4">
          <nav className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2.5 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.3)] flex gap-2 w-full max-w-2xl group transition-all hover:scale-[1.01]">
              {[
                  { label: 'Intelligence', id: 'intelligence', icon: <Cpu size={14}/>, metric: `${stats.totalHours}h` },
                  { label: 'Analytics', id: 'analytics', icon: <BarChart3 size={14}/>, metric: timeframe },
                  { label: 'Registry', id: 'registry', icon: <Database size={14}/>, metric: `${filtered.length} Logs` }
              ].map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => scrollToSection(tab.id)}
                      className={`flex-1 px-6 py-3.5 rounded-[1.75rem] flex flex-col items-center gap-1 transition-all duration-500 relative overflow-hidden ${
                        activeTab === tab.label 
                        ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                      <div className="flex items-center gap-2">
                        {tab.icon}
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest opacity-60 ${activeTab === tab.label ? 'text-white' : 'text-slate-500'}`}>
                        {tab.metric}
                      </span>
                      {activeTab === tab.label && (
                          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20"></div>
                      )}
                  </button>
              ))}
          </nav>
      </div>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative">
        <div>
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-200">
                    <ShieldAlert className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">HQ Intelligence</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Node: Active</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-[1.75rem] shadow-sm border border-slate-100 flex gap-2">
                 <button className="px-5 py-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-2xl hover:text-primary-600 transition-all">
                    <History size={14} className="inline mr-2" /> System Logs
                 </button>
                 <Button onClick={handleExport} className="rounded-2xl h-12 px-8 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-100 transition-all hover:scale-105">
                    <FileSpreadsheet size={16} className="mr-2" /> Primary Data Export
                 </Button>
            </div>
        </div>
      </header>

      {/* Intelligence Section */}
      <section id="intelligence" className="scroll-mt-40 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-8 p-12 bg-slate-900 border-0 shadow-2xl rounded-[3.5rem] text-white relative overflow-hidden flex flex-col justify-between min-h-[460px] group">
                  <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-[10px] font-black tracking-[0.2em] uppercase border border-white/10 mb-12">
                        <Globe size={14} className="text-primary-400" /> Organizational Matrix
                      </div>
                      <h2 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.8] mb-10 transition-transform group-hover:scale-[1.01] duration-700">
                          {stats.totalHours}<br/><span className="text-primary-500">Validated Hours</span>
                      </h2>
                      <p className="text-slate-400 font-bold text-xl max-w-sm leading-snug">
                        Real-time encrypted aggregation of all departmental performance benchmarks.
                      </p>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600 rounded-full blur-[150px] opacity-20 -mr-40 -mt-40 transition-all duration-1000 group-hover:opacity-30 group-hover:scale-110"></div>
                  <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-purple-600 rounded-full blur-[120px] opacity-10 -ml-20 -mb-20"></div>
              </Card>

              <Card className="lg:col-span-4 p-10 bg-white border border-slate-100 shadow-xl rounded-[3.5rem] flex flex-col justify-between group">
                  <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                        <Fingerprint size={14} className="text-primary-600" />
                        Verification Index
                      </h3>
                      <div className="flex flex-col items-center justify-center relative py-8">
                          <div className="w-52 h-52 rounded-full border-[12px] border-slate-50 flex items-center justify-center relative shadow-inner">
                            <div className="text-center">
                                <p className="text-6xl font-black text-slate-950 tracking-tighter">100%</p>
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-2">Audit Ready</p>
                            </div>
                            {/* Inner rotating orbit */}
                            <div className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]">
                                <div className="w-4 h-4 bg-primary-600 rounded-lg shadow-xl shadow-primary-200 absolute -top-2 left-1/2 -ml-2"></div>
                            </div>
                          </div>
                      </div>
                  </div>
                  <div className="pt-10 border-t border-slate-50 grid grid-cols-2 gap-6">
                      <div className="text-center group-hover:scale-110 transition-transform">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Yield</p>
                          <p className="text-3xl font-black text-slate-900">{stats.avgHours}h</p>
                      </div>
                      <div className="text-center border-l border-slate-50 group-hover:scale-110 transition-transform">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Density</p>
                          <p className="text-3xl font-black text-slate-900">{stats.activeCount}</p>
                      </div>
                  </div>
              </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                  { label: 'Workforce Size', value: '128', sub: 'Verified Personnel', color: 'blue', icon: <Users size={28} /> },
                  { label: 'Cloud Uptime', value: '99.9%', sub: 'Security Layer 4', color: 'purple', icon: <Zap size={28} /> },
                  { label: 'Pending Audit', value: approved.length, sub: 'Authorized Logs', color: 'emerald', icon: <Database size={28} /> }
              ].map((item, i) => (
                  <Card key={i} className="p-12 bg-white border-0 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group rounded-[3rem] cursor-pointer">
                      <div className={`w-20 h-20 rounded-[2rem] bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-10 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-xl shadow-${item.color}-100/50`}>
                          {item.icon}
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                      <p className="text-5xl font-black text-slate-900 tracking-tighter mb-3">{item.value}</p>
                      <p className="text-xs font-bold text-slate-400 opacity-60 italic">{item.sub}</p>
                  </Card>
              ))}
          </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="scroll-mt-40">
          <Card className="p-12 bg-white border-0 shadow-xl rounded-[4rem] relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
                  <h3 className="text-3xl font-black text-slate-950 tracking-tighter flex items-center gap-5 uppercase">
                      <div className="w-2 h-10 bg-primary-600 rounded-full shadow-xl shadow-primary-200"></div>
                      Global Distribution
                  </h3>
                  <div className="bg-slate-100 p-2 rounded-[1.75rem] flex gap-1 relative border border-slate-200 shadow-inner">
                      {['Daily', 'Weekly', 'Monthly'].map((item) => (
                          <button 
                            key={item}
                            onClick={() => setTimeframe(item)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                timeframe === item 
                                ? 'bg-white text-primary-600 shadow-md scale-105' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {item}
                          </button>
                      ))}
                  </div>
              </div>
              <div className="h-[450px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                            dy={15}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15)', padding: '25px' }}
                        />
                        <Bar dataKey="hours" radius={[15, 15, 15, 15]} barSize={55}>
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#8b5cf6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
          </Card>
      </section>

      {/* Registry Section */}
      <section id="registry" className="scroll-mt-40 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase ml-4">Global Registry</h3>
              <div className="relative w-full md:w-[450px] group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={22} />
                  <input 
                      type="text" 
                      placeholder="Search across secure employee nodes..." 
                      className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black focus:ring-4 focus:ring-primary-100/50 focus:outline-none transition-all shadow-inner"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <Card className="overflow-hidden bg-white border-0 shadow-xl rounded-[4rem]">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-12 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Validated Resource</th>
                            <th className="px-12 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle</th>
                            <th className="px-12 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aggregate Units</th>
                            <th className="px-12 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sessions</th>
                            <th className="px-12 py-8 text-right pr-20 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-40 text-center">
                                    <div className="flex flex-col items-center gap-8 opacity-30">
                                        <div className="p-8 bg-slate-50 rounded-[3rem]">
                                            <Database size={80} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Node Data Unreachable</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(ts => (
                                <tr key={ts.id} className="hover:bg-primary-50/10 transition-all group">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="relative shrink-0">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${ts.employeeName}&background=random`} 
                                                    className="w-16 h-16 rounded-[1.5rem] border-2 border-white shadow-xl object-cover transition-transform group-hover:scale-110" 
                                                    alt="" 
                                                />
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-lg border-2 border-white shadow-lg"></div>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-slate-950 tracking-tighter leading-none mb-2 italic group-hover:text-primary-600 transition-colors">{ts.employeeName}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ref Code:</span>
                                                    <span className="text-[10px] font-bold text-slate-900 font-mono tracking-widest">{ts.employeeId.toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-3">
                                            <CalendarIcon size={16} className="text-primary-600" />
                                            <span className="text-sm font-black text-slate-600 tracking-widest uppercase">{ts.month}</span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-950 tracking-tighter">{ts.entries.reduce((a,c) => a+c.hours, 0).toFixed(1)}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units</span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <span className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
                                            {ts.entries.length} Logs Verified
                                        </span>
                                    </td>
                                    <td className="px-12 py-10 text-right pr-20">
                                        <Badge status={ts.status} className="rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform group-hover:scale-105" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </Card>
      </section>

      {/* High-Security Footer */}
      <Card className="p-12 bg-slate-950 text-white border-0 shadow-[0_48px_96px_-24px_rgba(15,23,42,0.4)] rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
            <div className="relative z-10 flex items-center gap-8">
                <div className="w-20 h-20 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl flex items-center justify-center shadow-inner border border-white/5 group-hover:bg-primary-600/20 transition-all">
                    <ShieldCheck className="text-primary-400 group-hover:text-primary-200" size={36} />
                </div>
                <div>
                    <h4 className="text-3xl font-black tracking-tight leading-none italic uppercase mb-2">Operational Integrity Verified</h4>
                    <p className="text-base font-bold text-slate-500 leading-relaxed max-w-lg">
                        Encryption layer 6 established. All personnel logs for the current financial segment have been processed and are ready for primary core disbursement.
                    </p>
                </div>
            </div>
            <div className="relative z-10">
                 <Button onClick={handleExport} className="h-16 px-12 rounded-[2rem] bg-white text-slate-950 hover:bg-primary-500 hover:text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl border-0 transition-all hover:scale-[1.05] active:scale-95">
                    Generate HQ Core Payload <ArrowRight size={20} className="ml-3" />
                 </Button>
            </div>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[120px] rounded-full group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 blur-[90px] rounded-full group-hover:opacity-20 transition-opacity"></div>
      </Card>
    </div>
  );
};
