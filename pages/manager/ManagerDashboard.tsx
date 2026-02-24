
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Timesheet, User as UserType, LeaveRequest, LeaveStatus } from '../../types';
import { Card, Button, Badge } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  FileText, 
  Bell, 
  Activity, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  Search,
  CheckCircle2,
  UserCheck,
  XCircle,
  UserPlus,
  Plane,
  X,
  // Added missing Calendar import
  Calendar
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [joinRequests, setJoinRequests] = useState<UserType[]>([]);
  const [teamSize, setTeamSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [time] = useState(new Date());
  const [search, setSearch] = useState('');
  const [isProcessingRequest, setIsProcessingRequest] = useState<string | null>(null);

  const fetchData = async () => {
    if (user) {
      setLoading(true);
      try {
          const [tsData, sizeData, requestsData, leaveData] = await Promise.all([
              api.manager.getPending(user.id),
              api.manager.getTeamSize(user.id),
              api.manager.getJoinRequests(user.id),
              api.leave.getPendingForManager(user.id)
          ]);
          setPendingTimesheets(tsData);
          setTeamSize(sizeData);
          setJoinRequests(requestsData);
          setPendingLeaves(leaveData);
      } catch (error) {
          console.error("Failed to fetch dashboard data", error);
      } finally {
          setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleJoinResponse = async (employeeId: string, approved: boolean) => {
      setIsProcessingRequest(employeeId);
      try {
          await api.manager.respondToJoinRequest(employeeId, approved);
          await fetchData();
      } catch (error) {
          alert("Response failed");
      } finally {
          setIsProcessingRequest(null);
      }
  };

  const handleLeaveResponse = async (leaveId: string, status: LeaveStatus.APPROVED | LeaveStatus.REJECTED) => {
      setIsProcessingRequest(leaveId);
      try {
          await api.leave.review(leaveId, status);
          await fetchData();
      } catch (error) {
          alert("Review failed");
      } finally {
          setIsProcessingRequest(null);
      }
  };

  const filteredTimesheets = useMemo(() => {
      return pendingTimesheets.filter(p => p.employeeName.toLowerCase().includes(search.toLowerCase()));
  }, [pendingTimesheets, search]);

  const totalTeamHours = useMemo(() => {
      return pendingTimesheets.reduce((sum, ts) => sum + ts.entries.reduce((a, c) => a + c.hours, 0), 0);
  }, [pendingTimesheets]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Lead, {user?.name.split(' ')[0]} ⚡</h1>
            <p className="text-gray-500 mt-2 font-medium">Dashboard Overseer — Synchronizing Team Performance</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative">
                <button className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-all relative group">
                    <Bell size={22} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                    {(pendingTimesheets.length > 0 || joinRequests.length > 0 || pendingLeaves.length > 0) && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                </button>
            </div>
        </div>
      </header>

      {/* JOIN REQUESTS */}
      {joinRequests.length > 0 && (
          <section className="animate-in slide-in-from-top-4 duration-500 space-y-4">
              <div className="flex items-center gap-3">
                  <UserPlus size={20} className="text-orange-500"/>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Join Requests</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinRequests.map(req => (
                      <Card key={req.id} className="p-6 bg-white border-l-4 border-l-orange-500 rounded-3xl flex items-center justify-between shadow-lg">
                          <div className="flex items-center gap-4">
                              <img src={req.avatarUrl} className="w-12 h-12 rounded-2xl border" alt="" />
                              <div>
                                  <p className="text-base font-black text-gray-900 leading-none mb-1">{req.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">New Subordinate</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => handleJoinResponse(req.id, false)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"><XCircle size={20} /></button>
                              <button onClick={() => handleJoinResponse(req.id, true)} className="p-2.5 bg-green-50 text-green-500 rounded-xl hover:bg-green-100 transition-all"><UserCheck size={20} /></button>
                          </div>
                      </Card>
                  ))}
              </div>
          </section>
      )}

      {/* LEAVE APPROVALS */}
      {pendingLeaves.length > 0 && (
          <section className="animate-in slide-in-from-top-4 duration-500 space-y-4">
              <div className="flex items-center gap-3">
                  <Plane size={20} className="text-primary-600"/>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Absence Approval Queue</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingLeaves.map(leave => (
                      <Card key={leave.id} className="p-6 bg-white border-l-4 border-l-primary-600 rounded-3xl shadow-lg group">
                          <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                      <Calendar size={22} />
                                  </div>
                                  <div>
                                      <p className="text-base font-black text-gray-900 leading-none mb-1">{leave.employeeName}</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{leave.type}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-xl font-black text-primary-600 leading-none">{leave.days}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Days</p>
                              </div>
                          </div>
                          <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-6 h-8 italic">"{leave.reason}"</p>
                          <div className="flex gap-3">
                              <button onClick={() => handleLeaveResponse(leave.id, LeaveStatus.REJECTED)} className="flex-1 h-12 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all">Decline</button>
                              <button onClick={() => handleLeaveResponse(leave.id, LeaveStatus.APPROVED)} className="flex-1 h-12 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-primary-200">Approve</button>
                          </div>
                      </Card>
                  ))}
              </div>
          </section>
      )}

      {/* HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 p-12 bg-slate-900 border-0 shadow-2xl rounded-[3rem] text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-black tracking-widest uppercase border border-white/10 mb-10">
                   <ShieldCheck size={14} className="text-primary-400" /> Administrative Hub
                </div>
                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.85] mb-8">
                    {filteredTimesheets.length} Sessions<br/><span className="text-primary-400">Awaiting Signature</span>
                </h2>
            </div>
            <Button variant="primary" className="bg-white text-slate-900 hover:bg-slate-50 rounded-[1.75rem] h-20 px-10 font-black text-lg w-fit shadow-2xl" onClick={() => navigate('/manager/approvals')}>
                Review Timesheets <ArrowRight size={24} className="ml-3" />
            </Button>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600 rounded-full blur-[140px] opacity-20 -mr-40 -mt-40"></div>
        </Card>

        <Card className="lg:col-span-4 p-8 bg-white shadow-sm rounded-[3rem] flex flex-col items-center">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10 self-start">Team Strength</h3>
            <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#f8fafc" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="92, 100" strokeLinecap="round" className="text-primary-600" />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter">92%</span>
                </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-4 pt-8 border-t">
                <div className="text-center border-r">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Members</p>
                    <p className="text-3xl font-black text-gray-900">{teamSize}</p>
                </div>
                <div className="text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Hours</p>
                    <p className="text-3xl font-black text-gray-900">{totalTeamHours.toFixed(0)}</p>
                </div>
            </div>
        </Card>
      </div>

      {/* QUICK TIMESHEET GRID */}
      <div className="space-y-6 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-2xl font-black text-gray-900 uppercase">Pending Review Queue</h3>
              <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Filter team..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-14 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-100 transition-all shadow-sm" />
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTimesheets.length > 0 ? (
                  filteredTimesheets.map(ts => (
                      <Card key={ts.id} className="p-10 bg-white shadow-sm hover:shadow-2xl transition-all group rounded-[3rem]">
                          <div className="flex items-start justify-between mb-10">
                              <div className="flex items-center gap-4">
                                  <img src={`https://ui-avatars.com/api/?name=${ts.employeeName}&background=random`} className="w-16 h-16 rounded-2xl" alt="" />
                                  <p className="text-xl font-black text-gray-900 leading-tight">{ts.employeeName}</p>
                              </div>
                              <Badge status={ts.status} className="uppercase text-[9px]" />
                          </div>
                          <div className="py-6 border-y mb-10 flex justify-between">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Period</p><p className="font-black">{ts.month}</p></div>
                                <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Hours</p><p className="font-black text-primary-600">{ts.entries.reduce((a,c) => a+c.hours, 0)}h</p></div>
                          </div>
                          <Button onClick={() => navigate(`/manager/review/${ts.id}`)} className="w-full rounded-2xl h-14 font-black text-xs uppercase tracking-widest">Review Data</Button>
                      </Card>
                  ))
              ) : (
                  <div className="col-span-full py-20 flex flex-col items-center text-center opacity-40">
                      <CheckCircle2 size={64} className="mb-4 text-green-500" />
                      <p className="text-lg font-black uppercase tracking-widest">All Records Cleared</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
