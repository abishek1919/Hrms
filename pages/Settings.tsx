import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight">Settings</h1>
      <p className="text-gray-500">This section will contain application preferences and account settings. Coming soon.</p>
      <div className="mt-6">
        <Button onClick={() => { /* nothing yet */ }} className="rounded-2xl px-6 py-3">Explore Features</Button>
      </div>
    </div>
  );
};
