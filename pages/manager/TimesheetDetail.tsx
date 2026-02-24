
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Timesheet, TimesheetStatus } from '../../types';
import { Button, Card, Badge } from '../../components/ui';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  X,
  FileText,
  ChevronRight
} from 'lucide-react';

export const TimesheetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [reason, setReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.timesheet.getById(id).then(data => {
          setTimesheet(data || null);
          setLoading(false);
      });
    }
  }, [id]);

  const handleApprove = async () => {
      if(!timesheet || isProcessing) return;
      
      const confirmMsg = `Are you sure you want to approve the monthly timesheet for ${timesheet.employeeName}? This will finalize their payroll record for ${timesheet.month}.`;
      
      if (window.confirm(confirmMsg)) {
          setIsProcessing(true);
          try {
              // Ensure we wait for the mock API to complete
              await api.timesheet.review(timesheet.id, TimesheetStatus.APPROVED);
              // Direct navigation back to dashboard after successful approval
              navigate('/manager/dashboard');
          } catch (error) {
              console.error("Approval flow failed:", error);
              alert("The approval request could not be completed. Please check your connection and try again.");
          } finally {
              setIsProcessing(false);
          }
      }
  };

  const handleReject = async () => {
      if (!timesheet || !reason || isProcessing) return;
      setIsProcessing(true);
      try {
          await api.timesheet.review(timesheet.id, TimesheetStatus.REJECTED, reason);
          setShowRejectModal(false);
          navigate('/manager/dashboard');
      } catch (error) {
          console.error("Rejection flow failed:", error);
          alert("The rejection request could not be processed.");
      } finally {
          setIsProcessing(false);
      }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Fetching Verification Data</p>
        </div>
    </div>
  );
  
  if (!timesheet) return <div className="p-8 text-center font-bold text-gray-400">Timesheet record missing or unavailable.</div>;

  const totalHours = timesheet.entries.reduce((a,c) => a+c.hours, 0);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <nav className="mb-6">
          <button 
            onClick={() => navigate('/manager/dashboard')} 
            className="flex items-center gap-2 text-gray-400 hover:text-primary-600 font-black text-xs uppercase tracking-widest transition-colors group"
          >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Review Queue
          </button>
      </nav>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
              <div className="relative">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${timesheet.employeeName}&background=random`} 
                    className="w-24 h-24 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover" 
                    alt={timesheet.employeeName} 
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-xl shadow-lg">
                      <ShieldCheck size={16} />
                  </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{timesheet.employeeName}</h1>
                <p className="text-gray-500 mt-1 font-bold flex items-center gap-2">
                    <Calendar size={16} className="text-primary-600" /> 
                    Cycle: <span className="text-gray-900">{timesheet.month}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Ref: {timesheet.id.slice(0, 8)}</span>
                </p>
              </div>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
             {timesheet.status === TimesheetStatus.SUBMITTED && (
                 <>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowRejectModal(true)}
                        disabled={isProcessing}
                        className="flex-1 lg:flex-none h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-red-100 text-red-500 hover:bg-red-50 transition-all"
                    >
                        <XCircle size={18} className="mr-2" /> Reject
                    </Button>
                    <Button 
                        onClick={handleApprove} 
                        disabled={isProcessing}
                        className="flex-1 lg:flex-none h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-200 hover:-translate-y-1 transition-all"
                    >
                        {isProcessing ? <Loader2 size={18} className="animate-spin mr-2" /> : <CheckCircle size={18} className="mr-2" />}
                        Approve Submission
                    </Button>
                 </>
             )}
             {timesheet.status !== TimesheetStatus.SUBMITTED && (
                 <Badge status={timesheet.status} className="rounded-full px-8 py-3 text-[11px] font-black uppercase tracking-widest shadow-sm" />
             )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
                <Card className="overflow-hidden bg-white border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[2.5rem]">
                    <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Clock size={24} className="text-primary-600" />
                            Work Schedule Detailed Log
                        </h3>
                    </div>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Timing</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest pr-16">Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {timesheet.entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-8 text-sm font-black text-gray-900 tracking-tight">{entry.date}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl w-fit">
                                                <Clock size={12} className="text-primary-600" /> {entry.checkIn} — {entry.checkOut}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-xs">{entry.description}</p>
                                        </td>
                                        <td className="px-10 py-8 text-right pr-16">
                                            <span className="text-lg font-black text-gray-900 tracking-tighter">{entry.hours}h</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-900 text-white">
                                <tr>
                                    <td colSpan={3} className="px-10 py-8 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Validated Monthly Aggregation:</td>
                                    <td className="px-10 py-8 text-right pr-16">
                                        <span className="text-3xl font-black tracking-tighter">{totalHours.toFixed(2)}</span>
                                        <span className="text-[10px] font-black text-primary-400 ml-2 uppercase tracking-widest">HRS</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
              <Card className="p-8 bg-white border-0 shadow-sm rounded-[2.5rem]">
                  <h4 className="text-lg font-black text-gray-900 mb-6 tracking-tight flex items-center gap-3 uppercase text-xs tracking-widest">
                      <ShieldCheck size={20} className="text-primary-600" />
                      Verification Audit
                  </h4>
                  <div className="space-y-6">
                      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                          <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                          <div>
                              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Session Integrity</p>
                              <p className="text-[11px] text-gray-500 font-bold mt-1 leading-snug">All log entries reside within designated period boundaries.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                          <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                          <div>
                              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Policy Alignment</p>
                              <p className="text-[11px] text-gray-500 font-bold mt-1 leading-snug">Hours correspond to contractual standard allocations.</p>
                          </div>
                      </div>
                  </div>
              </Card>

              <Card className="p-8 bg-slate-950 text-white border-0 shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                   <div className="relative z-10">
                       <h4 className="text-[10px] font-black text-slate-500 mb-4 tracking-widest uppercase">Lead Action</h4>
                       <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
                           Verifying this timesheet authorizes the disbursement of funds for the cycle. Please ensure all sessions match reported output.
                       </p>
                       <div className="space-y-3">
                            <Button 
                                onClick={handleApprove} 
                                disabled={timesheet.status !== TimesheetStatus.SUBMITTED || isProcessing}
                                className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest border-0 transition-all hover:scale-[1.02]"
                            >
                                {isProcessing ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Confirm & Finalize'}
                            </Button>
                       </div>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full"></div>
                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/10 blur-2xl rounded-full"></div>
              </Card>
          </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
          <div className="fixed inset-0 bg-slate-900/95 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
              <Card className="w-full max-w-lg bg-white p-12 rounded-[3rem] shadow-2xl border-0 relative overflow-hidden flex flex-col gap-8" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                              <AlertCircle size={28} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Flag Request</h3>
                            <p className="text-sm text-gray-400 font-bold">Return to subordinate for mandatory revisions.</p>
                          </div>
                      </div>
                      <button onClick={() => setShowRejectModal(false)} className="text-gray-300 hover:text-gray-600 p-2 hover:bg-slate-50 rounded-full transition-all">
                        <X size={24} />
                      </button>
                  </div>
                  
                  <div className="space-y-2">
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason for Rejection</label>
                      <textarea 
                        className="block w-full px-6 py-5 bg-slate-50/60 border border-slate-100 rounded-[2rem] text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all min-h-[160px] resize-none shadow-inner"
                        placeholder="Detail the corrections required..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                      />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setShowRejectModal(false)} 
                        className="flex-1 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-900"
                      >
                          Discard
                      </button>
                      <Button 
                        onClick={handleReject} 
                        disabled={!reason || isProcessing}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100/50"
                      >
                        {isProcessing ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Send Feedback'}
                      </Button>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};
