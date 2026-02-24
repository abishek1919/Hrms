
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Timesheet, TimesheetEntry, TimesheetStatus } from '../../types';
import { Button, Card, Input, Badge, Select } from '../../components/ui';
import { 
  Save, 
  Clock, 
  Calendar, 
  History, 
  Trash2, 
  Loader2, 
  ArrowRight, 
  Edit2, 
  ChevronRight, 
  Home, 
  Timer, 
  Plus,
  Send
} from 'lucide-react';

export const TimesheetEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('17:30');
  const [desc, setDesc] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (id) {
        const data = await api.timesheet.getById(id);
        setTimesheet(data || null);
        
        if (data) {
          const [year, month] = data.month.split('-');
          const today = new Date();
          const isCurrentMonth = today.getFullYear() === parseInt(year) && (today.getMonth() + 1) === parseInt(month);
          
          if (isCurrentMonth) {
            setDate(today.toISOString().split('T')[0]);
          } else {
            setDate(`${year}-${month}-01`);
          }
        }
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return '0h 0m';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if(diff < 0) diff = 0;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };
  
  const getDurationNumber = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? Number((diff / 60).toFixed(2)) : 0;
  }

  const handleSaveEntry = async () => {
    if (!timesheet || !date || !checkIn || !checkOut || !desc) return;
    setIsSubmitting(true);
    
    try {
        const hours = getDurationNumber(checkIn, checkOut);
        const entryId = editingEntryId || `e${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const entry: TimesheetEntry = {
            id: entryId,
            date,
            checkIn,
            checkOut,
            description: desc,
            hours
        };

        await api.timesheet.upsertEntry(timesheet.id, entry);
        
        const updatedEntries = [...timesheet.entries];
        const idx = updatedEntries.findIndex(e => e.id === entry.id);
        if (idx >= 0) updatedEntries[idx] = entry;
        else updatedEntries.push(entry);

        setTimesheet({ ...timesheet, entries: updatedEntries });
        resetForm();
    } catch (error) {
        alert("Failed to save entry.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    if (!timesheet) return;
    if (window.confirm('Delete this session log?')) {
        setDeletingId(entryId);
        try {
            await api.timesheet.deleteEntry(timesheet.id, entryId);
            setTimesheet(prev => {
                if (!prev) return null;
                return { ...prev, entries: prev.entries.filter(e => e.id !== entryId) };
            });
            if (editingEntryId === entryId) resetForm();
        } catch (error) {
            alert("Could not delete entry.");
        } finally {
            setDeletingId(null);
        }
    }
  };

  const resetForm = () => {
    setEditingEntryId(null);
    setDesc('');
    setCheckIn('09:00');
    setCheckOut('17:30');
  };

  const handleEdit = (entry: TimesheetEntry) => {
      if(isReadOnly) return;
      setDesc(entry.description);
      setDate(entry.date);
      setCheckIn(entry.checkIn);
      setCheckOut(entry.checkOut);
      setEditingEntryId(entry.id);
  }

  const handleSubmitTimesheet = async (e: React.MouseEvent) => {
      e.preventDefault();
      if(!timesheet || isFinalizing) return;
      
      if (timesheet.entries.length === 0) {
          alert("You cannot submit an empty timesheet. Please add at least one work log.");
          return;
      }

      if (window.confirm('Ready for Review? Once submitted, this month will be locked for editing and sent to your manager.')) {
        setIsFinalizing(true);
        try {
            await api.timesheet.submit(timesheet.id);
            navigate('/employee/timesheets'); 
        } catch (error) {
            console.error("Submit failed", error);
            alert("Submission failed. Check your connection.");
        } finally {
            setIsFinalizing(false);
        }
      }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Configuration</p>
        </div>
    </div>
  );
  
  if (!timesheet) return <div className="p-8">Timesheet not found</div>;

  const isReadOnly = timesheet.status === TimesheetStatus.SUBMITTED || timesheet.status === TimesheetStatus.APPROVED;
  const [year, month] = timesheet.month.split('-');
  const minDate = `${year}-${month}-01`;
  const maxDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <nav className="flex items-center gap-2 mb-2 no-scrollbar overflow-x-auto py-1">
           <button onClick={() => navigate('/employee/dashboard')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm shrink-0">
             <Home size={14} /> Home
           </button>
           <ChevronRight size={12} className="text-slate-300 shrink-0" />
           <button onClick={() => navigate('/employee/timesheets')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm shrink-0">
             Timesheets
           </button>
           <ChevronRight size={12} className="text-slate-300 shrink-0" />
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-black text-primary-700 shadow-sm shrink-0 uppercase tracking-widest">
             Daily Entry
           </div>
      </nav>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Work Log Session</h1>
                <p className="text-gray-500 mt-2 font-medium">Managing cycle: <span className="text-gray-900 font-bold">{timesheet.month}</span></p>
            </div>
            {!isReadOnly && (
                <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                        onClick={handleSubmitTimesheet} 
                        disabled={isFinalizing}
                        className={`flex-1 md:flex-none rounded-2xl h-14 px-10 font-black text-xs uppercase tracking-widest transition-all shadow-xl ${timesheet.entries.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
                    >
                        {isFinalizing ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send size={18} className="mr-2" />}
                        {timesheet.entries.length === 0 ? 'Add Logs to Submit' : 'Submit for Review'}
                    </Button>
                </div>
            )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-6">
               <Card className="p-10 bg-white border-0 shadow-sm rounded-[2.5rem]">
                   <div className="mb-10 flex justify-between items-center">
                       <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                           <Clock size={24} className="text-primary-600" />
                           Session Entry
                       </h3>
                       {isReadOnly && <Badge status={timesheet.status} className="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest" />}
                   </div>
                   
                   <div className="space-y-2 mb-8">
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Date</label>
                       <input 
                        type="date" 
                        value={date} 
                        min={minDate}
                        max={maxDate}
                        onChange={e => setDate(e.target.value)} 
                        disabled={isReadOnly}
                        className="block w-full px-6 h-14 bg-slate-50/60 border border-slate-100 rounded-2xl text-gray-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all shadow-inner"
                       />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div className="space-y-2">
                           <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">From</label>
                           <input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)} disabled={isReadOnly} className="block w-full px-6 h-14 bg-slate-50/60 border border-slate-100 rounded-2xl text-gray-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all shadow-inner" />
                       </div>
                       <div className="space-y-2">
                           <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">To</label>
                           <input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)} disabled={isReadOnly} className="block w-full px-6 h-14 bg-slate-50/60 border border-slate-100 rounded-2xl text-gray-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all shadow-inner" />
                       </div>
                   </div>

                   <div className="bg-slate-900 rounded-[2rem] p-6 flex items-center justify-between text-white mb-10 shadow-xl overflow-hidden relative">
                       <div className="flex items-center gap-4 relative z-10">
                           <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                               <Timer size={24} className="text-primary-400" />
                           </div>
                           <div>
                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Duration</p>
                               <p className="text-2xl font-black tracking-tight">{calculateHours(checkIn, checkOut)}</p>
                           </div>
                       </div>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full"></div>
                   </div>

                   <div className="space-y-2">
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Detail</label>
                       <textarea
                            className="block w-full px-6 py-5 bg-slate-50/60 border border-slate-100 rounded-[2rem] text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all min-h-[160px] resize-none shadow-inner"
                            placeholder="Briefly explain what was accomplished..."
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            disabled={isReadOnly}
                       />
                   </div>

                   <div className="mt-12 flex items-center gap-4">
                       {!isReadOnly && (
                            <>
                            <Button onClick={handleSaveEntry} disabled={!desc || isSubmitting} className="rounded-2xl px-8 h-14 font-black text-xs uppercase tracking-widest shadow-lg">
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                                {editingEntryId ? 'Update Entry' : 'Log Entry'}
                            </Button>
                            <button onClick={resetForm} disabled={isSubmitting} className="px-6 h-14 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Clear</button>
                            </>
                       )}
                   </div>
               </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
              <Card className="p-8 bg-white border-0 shadow-sm rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-primary-50 text-primary-600 rounded-xl shadow-sm">
                        <History size={20} />
                      </div>
                      <h3 className="font-black text-gray-900 tracking-tight text-lg">Timeline</h3>
                  </div>
                  
                  <div className="space-y-8 relative max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                      <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-slate-100"></div>
                      {[...timesheet.entries].sort((a,b) => b.date.localeCompare(a.date)).map((entry) => (
                          <div key={entry.id} className="relative pl-8 group">
                              <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-md bg-primary-600 z-10"></div>
                              <div className="mb-1">
                                  <p className="text-xs font-black text-gray-900 uppercase">{new Date(entry.date).toLocaleDateString(undefined, {weekday:'short', day:'numeric'})}</p>
                                  <p className="text-[11px] text-gray-500 font-bold line-clamp-2 opacity-70 group-hover:opacity-100">{entry.description}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                  <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">{entry.hours}h Logged</span>
                                  {!isReadOnly && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(entry)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-600">Edit</button>
                                        <button onClick={(e) => handleDeleteEntry(e, entry.id)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500">Delete</button>
                                    </div>
                                  )}
                              </div>
                          </div>
                      ))}
                      {timesheet.entries.length === 0 && <div className="pl-8 text-xs font-bold text-slate-300 italic">No sessions logged yet.</div>}
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
};
