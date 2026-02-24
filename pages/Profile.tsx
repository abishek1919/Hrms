
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, Input, Button } from '../components/ui';
import { ManagerApprovalStatus, User as UserType } from '../types';
import { 
  User, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Camera,
  CheckCircle,
  Lock,
  Clock,
  ChevronRight,
  Bell,
  Users,
  Search,
  ArrowRight,
  AlertCircle,
  UserCheck
} from 'lucide-react';

export const Profile: React.FC = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [managers, setManagers] = useState<UserType[]>([]);
    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [isRequestingManager, setIsRequestingManager] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        avatarUrl: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl || ''
            }));
            setSelectedManagerId(user.managerId || '');
            
            if (user.role === 'EMPLOYEE') {
                api.manager.listManagers().then(setManagers);
            }
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        if (user) {
            login({ ...user, name: formData.name, avatarUrl: formData.avatarUrl });
        }
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleManagerRequest = async () => {
        if (!user || !selectedManagerId) return;
        setIsRequestingManager(true);
        try {
            const updatedUser = await api.user.requestManager(user.id, selectedManagerId);
            login(updatedUser);
        } catch (error) {
            alert("Failed to send request.");
        } finally {
            setIsRequestingManager(false);
        }
    };

    if (!user) return null;

    const currentAvatar = formData.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`;
    const selectedManager = managers.find(m => m.id === user.managerId);

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Account Profile</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your digital presence and team affiliations.</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl">
                        Edit Information
                    </Button>
                ) : (
                    <div className="flex gap-3">
                        <button onClick={() => setIsEditing(false)} className="px-6 h-14 text-xs font-black text-gray-400 uppercase tracking-widest">Cancel</button>
                        <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl">
                            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            Save Profile
                        </Button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 bg-white border-0 shadow-sm rounded-[2.5rem] flex flex-col items-center text-center">
                        <div className="relative mb-8">
                            <div className={`w-36 h-36 rounded-[3rem] border-8 border-slate-50 shadow-2xl overflow-hidden relative ${isEditing ? 'cursor-pointer' : ''}`} onClick={isEditing ? handlePhotoClick : undefined}>
                                <img src={currentAvatar} alt={user.name} className="w-full h-full object-cover" />
                                {isEditing && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"><Camera size={24} /></div>}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                            <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2.5 rounded-2xl shadow-xl border-4 border-white"><ShieldCheck size={20} /></div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h2>
                        <p className="text-sm font-bold text-primary-600 uppercase tracking-widest">{user.role}</p>
                    </Card>

                    {/* MANAGER SECTION */}
                    {user.role === 'EMPLOYEE' && (
                        <Card className="p-8 bg-slate-900 text-white border-0 shadow-xl rounded-[2.5rem] relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Manager Assignment</h3>
                                
                                {user.managerApprovalStatus === ManagerApprovalStatus.APPROVED && selectedManager ? (
                                    <div className="flex items-center gap-4">
                                        <img src={selectedManager.avatarUrl} className="w-14 h-14 rounded-2xl border-2 border-white/10" />
                                        <div>
                                            <p className="text-lg font-black">{selectedManager.name}</p>
                                            <p className="text-xs text-green-400 font-bold flex items-center gap-1"><UserCheck size={12}/> Verified Lead</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {user.managerApprovalStatus === ManagerApprovalStatus.PENDING ? (
                                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                                {/* Fix: Added Clock to lucide-react imports to resolve 'Cannot find name Clock' error */}
                                                <p className="text-xs font-bold text-orange-400 flex items-center gap-2 mb-1"><Clock size={14}/> Approval Pending</p>
                                                <p className="text-xs text-slate-400">Waiting for {selectedManager?.name} to verify your role.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Team Lead</label>
                                                    <select 
                                                        value={selectedManagerId} 
                                                        onChange={(e) => setSelectedManagerId(e.target.value)}
                                                        className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-600"
                                                    >
                                                        <option value="" className="text-slate-900">Unassigned</option>
                                                        {managers.map(m => (
                                                            <option key={m.id} value={m.id} className="text-slate-900">{m.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <Button 
                                                    onClick={handleManagerRequest} 
                                                    disabled={!selectedManagerId || isRequestingManager}
                                                    className="w-full h-12 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100"
                                                >
                                                    {isRequestingManager ? <Loader2 size={16} className="animate-spin" /> : 'Send Join Request'}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full"></div>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <Card className="p-10 bg-white border-0 shadow-sm rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl"><User size={20} /></div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase text-xs tracking-widest">Professional Identity</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <Input name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={!isEditing ? "bg-slate-50/50 border-transparent font-black" : "font-black"} />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                <Input name="email" value={formData.email} disabled className="bg-slate-50 border-transparent text-slate-400 font-bold" />
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 bg-white border-0 shadow-sm rounded-[2.5rem] group hover:shadow-lg transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm"><Lock size={20} /></div>
                                <ChevronRight className="text-slate-200 group-hover:text-primary-600 transition-all" />
                            </div>
                            <h4 className="text-base font-black text-gray-900 tracking-tight">Security Credentials</h4>
                        </Card>
                        <Card className="p-8 bg-white border-0 shadow-sm rounded-[2.5rem] group hover:shadow-lg transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm"><Bell size={20} /></div>
                                <ChevronRight className="text-slate-200 group-hover:text-primary-600 transition-all" />
                            </div>
                            <h4 className="text-base font-black text-gray-900 tracking-tight">System Alerts</h4>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
