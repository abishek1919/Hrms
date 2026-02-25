
export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  HR = 'HR',
}

export enum TimesheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LeaveStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LeaveType {
  ANNUAL = 'Annual Leave',
  SICK = 'Sick Leave',
  PERSONAL = 'Personal Leave',
}

export enum ManagerApprovalStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId?: string; // For employees
  managerApprovalStatus?: ManagerApprovalStatus;
  avatarUrl?: string;
  token?: string; // JWT Token
}

export interface LeaveBalances {
  [LeaveType.ANNUAL]: number;
  [LeaveType.SICK]: number;
  [LeaveType.PERSONAL]: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
  managerId: string;
  submittedAt: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  title: string;
  description?: string;
}

export interface TimesheetEntry {
  id: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:mm
  checkOut: string; // HH:mm
  description: string;
  hours: number;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string; // Denormalized for easier display
  month: string; // YYYY-MM format
  status: TimesheetStatus;
  entries: TimesheetEntry[];
  submittedAt?: string;
  rejectionReason?: string;
}

export interface DashboardStats {
  leaveBalance?: number;
  hoursWorked?: number;
  pendingApprovals?: number;
  teamAvailability?: number;
}
