import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input, Button } from '../components/ui';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email: string) => {
    setLoading(true);
    setError('');
    try {
      const user = await api.auth.login(email);
      if (user) {
        login(user);
        if (user.role === 'EMPLOYEE') navigate('/employee/dashboard');
        else if (user.role === 'MANAGER') navigate('/manager/dashboard');
        else if (user.role === 'HR') navigate('/hr/dashboard');
      } else {
        setError('User not found');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { label: 'Employee', email: 'alice@company.com', role: 'UX Designer' },
    { label: 'Manager', email: 'bob@company.com', role: 'Engineering Lead' },
    { label: 'HR Admin', email: 'charlie@company.com', role: 'People Ops' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Brand/Image */}
      <div className="hidden lg:flex w-1/2 bg-primary-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="relative z-10 flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <LayoutTemplate size={24} className="text-white" />
             </div>
             <span className="text-xl font-bold tracking-tight">Smart HRMS</span>
        </div>

        <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-6 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                New Version 2.0
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">Streamline your workforce management.</h1>
            <p className="text-primary-100 text-lg leading-relaxed">
                Join thousands of employees managing time, leaves, and approvals in one unified platform. Experience the future of work today.
            </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                    <img key={i} src={`https://picsum.photos/100/100?random=${i+10}`} className="w-10 h-10 rounded-full border-2 border-primary-600" alt="User" />
                ))}
                <div className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center text-xs font-bold border-2 border-primary-600 shadow-sm">+2k</div>
             </div>
             <div className="text-sm font-medium">Active Users</div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary-700 rounded-full opacity-50 blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-left mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-sm text-gray-500">
              Welcome back! Please enter your details.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} /> {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
                 <Input label="Email" icon={<Mail size={18} />} placeholder="name@company.com" disabled />
            </div>
            <div>
                 <Input label="Password" type="password" icon={<Lock size={18} />} placeholder="••••••••" disabled />
            </div>
            
            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    Remember me
                </label>
                <a href="#" className="text-primary-600 font-medium hover:text-primary-700">Forgot password?</a>
            </div>

            <div className="pt-2 space-y-3">
                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">Select Demo User</p>
                 {demoUsers.map(u => (
                     <button
                        key={u.email}
                        onClick={() => handleLogin(u.email)}
                        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group text-left"
                     >
                        <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">{u.label}</p>
                            <p className="text-xs text-gray-500">{u.role}</p>
                        </div>
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                 ))}
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account? <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};
