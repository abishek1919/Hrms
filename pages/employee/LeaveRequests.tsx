
import React, { useState, useEffect, useMemo } from 'react';
import styles from './LeaveRequests.module.css';
import { Card, Button, Badge } from '../../components/ui';
import { 
    Plus, 
    Calendar as CalendarIcon, 
    X, 
    Plane, 
    Clock, 
    Info, 
    History, 
    ArrowRight, 
    Home, 
    ChevronRight, 
    Edit2, 
    Trash2, 
    Eye, 
    Loader2, 
    AlertTriangle, 
    Umbrella, 
    Thermometer, 
    User,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaveRequest, LeaveStatus, LeaveType, LeaveBalances } from '../../types';

// --- Internal Mini Calendar Component ---
interface MiniCalendarProps {
    selectedDate: string; // YYYY-MM-DD
    onSelect: (date: string) => void;
    minDate?: string;
    label: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onSelect, minDate, label }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate || new Date()));
    const [isOpen, setIsOpen] = useState(false);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    
    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const year = viewDate.getFullYear();

    const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const isDateSelected = (day: number) => {
        const d = new Date(year, viewDate.getMonth(), day);
        return d.toISOString().split('T')[0] === selectedDate;
    };

    const isDateDisabled = (day: number) => {
        if (!minDate) return false;
        const d = new Date(year, viewDate.getMonth(), day);
        return d.toISOString().split('T')[0] < minDate;
    };

    const handleDateClick = (day: number) => {
        if (isDateDisabled(day)) return;
        const d = new Date(year, viewDate.getMonth(), day);
        onSelect(d.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">{label}</label>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 flex items-center justify-between text-gray-900 font-black hover:border-primary-200 transition-all shadow-inner"
            >
                <span className={selectedDate ? 'text-gray-900' : 'text-gray-300'}>
                    {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                </span>
                <CalendarIcon size={18} className="text-primary-600" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[250] p-5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={handlePrev} className="p-1.5 hover:bg-slate-50 rounded-lg text-gray-400"><ChevronLeft size={16}/></button>
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{monthName} {year}</span>
                        <button type="button" onClick={handleNext} className="p-1.5 hover:bg-slate-50 rounded-lg text-gray-400"><ChevronRight size={16}/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[9px] font-black text-slate-300">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const active = isDateSelected(day);
                            const disabled = isDateDisabled(day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleDateClick(day)}
                                    className={`h-8 w-8 rounded-xl text-[10px] font-black transition-all flex items-center justify-center
                                        ${active ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 
                                          disabled ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'}`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const LeaveRequests: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [balances, setBalances] = useState<LeaveBalances | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State for modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
    const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);
    
    // State for form
    const [formData, setFormData] = useState({
        type: LeaveType.ANNUAL,
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchLeaveData = async () => {
        if (user) {
            setLoading(true);
            const [leavesData, balancesData] = await Promise.all([
                api.leave.list({ employeeId: user.id }),
                api.leave.getBalances(user.id)
            ]);
            setLeaves(leavesData);
            setBalances(balancesData);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveData();
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
        setErrorMessage(null);
    };

    const handleDateSelect = (field: 'startDate' | 'endDate', date: string) => {
        setFormData(prev => {
            const update = { ...prev, [field]: date };
            // If start date is selected and it's after end date, clear end date
            if (field === 'startDate' && prev.endDate && date > prev.endDate) {
                update.endDate = '';
            }
            return update;
        });
        setErrorMessage(null);
    };

    const handleOpenCreate = () => {
        if (!user?.managerId) {
            alert("You must assign a Reporting Manager in your profile before requesting leave.");
            return;
        }
        setEditingLeaveId(null);
        setFormData({ type: LeaveType.ANNUAL, startDate: '', endDate: '', reason: '' });
        setErrorMessage(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (e: React.MouseEvent, leave: LeaveRequest) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (leave.status !== LeaveStatus.SUBMITTED) {
            alert("Only pending requests can be edited.");
            return;
        }

        setEditingLeaveId(leave.id);
        setFormData({
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason
        });
        setErrorMessage(null);
        setIsModalOpen(true);
    };

    const handleOpenView = (leave: LeaveRequest) => {
        setSelectedLeave(leave);
        setIsViewModalOpen(true);
    };

    const handleDeleteLeave = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const leaveToDelete = leaves.find(l => l.id === id);
        if (!leaveToDelete || leaveToDelete.status !== LeaveStatus.SUBMITTED) {
            alert("Only pending requests can be deleted.");
            return;
        }

        if (window.confirm('Delete this pending leave request?')) {
            await api.leave.delete(id);
            fetchLeaveData();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.managerId) return;

        if (!formData.startDate || !formData.endDate) {
            setErrorMessage("Please select both start and end dates.");
            return;
        }

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        
        if (end < start) {
            setErrorMessage("End date cannot be before start date.");
            return;
        }

        const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
        const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
        const diffDays = Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;

        setIsSaving(true);
        setErrorMessage(null);

        try {
            if (editingLeaveId) {
                await api.leave.update(editingLeaveId, {
                    type: formData.type,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    days: diffDays,
                    reason: formData.reason
                });
            } else {
                await api.leave.create({
                    employeeId: user.id,
                    employeeName: user.name,
                    managerId: user.managerId,
                    type: formData.type,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    days: diffDays,
                    reason: formData.reason
                });
            }
            setIsModalOpen(false);
            fetchLeaveData();
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to process request.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <nav className="flex items-center gap-2 mb-2 no-scrollbar overflow-x-auto py-1">
               <button onClick={() => navigate('/employee/dashboard')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:text-primary-600 transition-all shadow-sm shrink-0">
                 <Home size={14} /> Home
               </button>
               <ChevronRight size={12} className="text-slate-300 shrink-0" />
               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-black text-primary-700 shadow-sm shrink-0 uppercase tracking-widest">
                 Leave Management
               </div>
            </nav>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Time Off Portal</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your holiday balance and request absence records.</p>
                </div>
                <Button onClick={handleOpenCreate} className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl">
                    <Plus size={18} className="mr-2" /> Request Time Off
                </Button>
            </div>

            {/* Balances Display */}
            {balances && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-8 border-0 shadow-sm bg-white rounded-[2rem] flex items-center gap-6 group hover:shadow-md transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                            <Umbrella size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Annual Balance</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{balances[LeaveType.ANNUAL]} <span className="text-sm font-bold opacity-40">Days</span></p>
                        </div>
                    </Card>
                    <Card className="p-8 border-0 shadow-sm bg-white rounded-[2rem] flex items-center gap-6 group hover:shadow-md transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <Thermometer size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sick Balance</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{balances[LeaveType.SICK]} <span className="text-sm font-bold opacity-40">Days</span></p>
                        </div>
                    </Card>
                    <Card className="p-8 border-0 shadow-sm bg-white rounded-[2rem] flex items-center gap-6 group hover:shadow-md transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <User size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Personal Balance</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{balances[LeaveType.PERSONAL]} <span className="text-sm font-bold opacity-40">Days</span></p>
                        </div>
                    </Card>
                </div>
            )}

            {/* List Table */}
            <Card className="overflow-hidden bg-white border-0 shadow-sm rounded-[2.5rem]">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Absence Type</th>
                                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Days</th>
                                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-6 text-right pr-16 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaves.length > 0 ? leaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-primary-50/20 transition-all group">
                                    <td className="px-10 py-8 cursor-pointer" onClick={() => handleOpenView(leave)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                                <CalendarIcon size={22} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 tracking-tight">{leave.type}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1 max-w-[200px]">{leave.reason}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-sm font-bold text-gray-600 cursor-pointer" onClick={() => handleOpenView(leave)}>
                                        {leave.startDate} to {leave.endDate}
                                    </td>
                                    <td className="px-10 py-8 cursor-pointer" onClick={() => handleOpenView(leave)}>
                                        <span className="text-xl font-black text-gray-900 tracking-tighter">{leave.days}</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Days</span>
                                    </td>
                                    <td className="px-10 py-8 cursor-pointer" onClick={() => handleOpenView(leave)}>
                                        <Badge status={leave.status as any} className="rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest" />
                                    </td>
                                    <td className="px-10 py-8 text-right pr-16">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => handleOpenView(leave)} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Eye size={18} /></button>
                                            {leave.status === LeaveStatus.SUBMITTED && (
                                                <>
                                                    <button onClick={(e) => handleOpenEdit(e, leave)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                                                    <button onClick={(e) => handleDeleteLeave(e, leave.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-gray-400 font-black uppercase text-[10px] tracking-widest">No absence history found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}>
                    <Card className="w-full max-w-lg bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col gap-8" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                                {editingLeaveId ? 'Edit Leave Request' : 'New Absence Request'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-red-500 transition-all"><X size={28} /></button>
                        </div>
                        
                        {errorMessage && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                                <AlertTriangle className="text-red-600 shrink-0" size={20} />
                                <p className="text-xs font-bold text-red-600 leading-relaxed">{errorMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Absence Type</label>
                                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-6 h-14 bg-slate-50 border border-slate-100 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all">
                                    <option value={LeaveType.ANNUAL}>{LeaveType.ANNUAL}</option>
                                    <option value={LeaveType.SICK}>{LeaveType.SICK}</option>
                                    <option value={LeaveType.PERSONAL}>{LeaveType.PERSONAL}</option>
                                </select>
                                {balances && (
                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1 ml-1">
                                        Remaining Balance: {balances[formData.type as LeaveType]} Days
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <MiniCalendar 
                                    label="Start Date" 
                                    selectedDate={formData.startDate} 
                                    onSelect={(d) => handleDateSelect('startDate', d)} 
                                />
                                <MiniCalendar 
                                    label="End Date" 
                                    selectedDate={formData.endDate} 
                                    minDate={formData.startDate} 
                                    onSelect={(d) => handleDateSelect('endDate', d)} 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason</label>
                                <textarea name="reason" value={formData.reason} onChange={handleInputChange} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-gray-900 font-medium focus:outline-none min-h-[140px] resize-none" placeholder="Briefly describe your request..." required />
                            </div>

                            <div className="flex justify-end gap-6 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-xs font-black text-gray-400 uppercase tracking-widest">Cancel</button>
                                <Button type="submit" disabled={isSaving} className="rounded-2xl h-14 px-10 font-black text-xs uppercase tracking-widest shadow-xl">
                                    {isSaving ? <Loader2 className="animate-spin" /> : editingLeaveId ? 'Update Request' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
