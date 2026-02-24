
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { TimesheetEditor } from './pages/employee/TimesheetEditor';
import { TimesheetList } from './pages/employee/TimesheetList';
import { LeaveRequests } from './pages/employee/LeaveRequests';
import { Profile } from './pages/Profile';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { TimesheetDetail } from './pages/manager/TimesheetDetail';
import { ManagerTeamTimesheets } from './pages/manager/ManagerTeamTimesheets';
import { ManagerReports } from './pages/manager/ManagerReports';
import { ManagerApprovals } from './pages/manager/ManagerApprovals';
import { HRDashboard } from './pages/hr/HRDashboard';
import { Role } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: Role[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === Role.EMPLOYEE) return <Navigate to="/employee/dashboard" replace />;
    if (user.role === Role.MANAGER) return <Navigate to="/manager/dashboard" replace />;
    if (user.role === Role.HR) return <Navigate to="/hr/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Employee Routes */}
            <Route 
                path="/employee/dashboard" 
                element={
                    <ProtectedRoute allowedRoles={[Role.EMPLOYEE]}>
                        <EmployeeDashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/employee/timesheets" 
                element={
                    <ProtectedRoute allowedRoles={[Role.EMPLOYEE]}>
                        <TimesheetList />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/employee/leaves" 
                element={
                    <ProtectedRoute allowedRoles={[Role.EMPLOYEE]}>
                        <LeaveRequests />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/employee/timesheet/:id" 
                element={
                    <ProtectedRoute allowedRoles={[Role.EMPLOYEE]}>
                        <TimesheetEditor />
                    </ProtectedRoute>
                } 
            />

            {/* Shared Profile Route */}
             <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } 
            />

            {/* Manager Routes */}
            <Route 
                path="/manager/dashboard" 
                element={
                    <ProtectedRoute allowedRoles={[Role.MANAGER]}>
                        <ManagerDashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/manager/approvals" 
                element={
                    <ProtectedRoute allowedRoles={[Role.MANAGER]}>
                        <ManagerApprovals />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/manager/team-timesheets" 
                element={
                    <ProtectedRoute allowedRoles={[Role.MANAGER]}>
                        <ManagerTeamTimesheets />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/manager/reports" 
                element={
                    <ProtectedRoute allowedRoles={[Role.MANAGER]}>
                        <ManagerReports />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/manager/review/:id" 
                element={
                    <ProtectedRoute allowedRoles={[Role.MANAGER]}>
                        <TimesheetDetail />
                    </ProtectedRoute>
                } 
            />

            {/* HR Routes */}
            <Route 
                path="/hr/dashboard" 
                element={
                    <ProtectedRoute allowedRoles={[Role.HR]}>
                        <HRDashboard />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
