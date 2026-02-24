
import { Role, Timesheet, TimesheetStatus, User, TimesheetEntry, ManagerApprovalStatus, LeaveRequest, LeaveStatus, LeaveType, LeaveBalances } from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================
const USE_MOCK = true;
const STORAGE_KEY = 'sync_hr_mock_data_v9'; 
const LEAVE_STORAGE_KEY = 'sync_hr_leaves_v9';

const INITIAL_BALANCES: LeaveBalances = {
  [LeaveType.ANNUAL]: 20,
  [LeaveType.SICK]: 10,
  [LeaveType.PERSONAL]: 5
};

// ============================================================================
// MOCK DATA STORE
// ============================================================================
const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Alice Employee', email: 'alice@company.com', role: Role.EMPLOYEE, managerId: 'u2', managerApprovalStatus: ManagerApprovalStatus.APPROVED, avatarUrl: 'https://picsum.photos/200/200?random=1', token: 'mock-token-u1' },
  { id: 'u4', name: 'David Developer', email: 'david@company.com', role: Role.EMPLOYEE, managerId: 'u2', managerApprovalStatus: ManagerApprovalStatus.APPROVED, avatarUrl: 'https://picsum.photos/200/200?random=4', token: 'mock-token-u4' },
  { id: 'u2', name: 'Bob Manager', email: 'bob@company.com', role: Role.MANAGER, avatarUrl: 'https://picsum.photos/200/200?random=2', token: 'mock-token-u2' },
  { id: 'u3', name: 'Charlie HR', email: 'charlie@company.com', role: Role.HR, avatarUrl: 'https://picsum.photos/200/200?random=3', token: 'mock-token-u3' },
  { id: 'u5', name: 'Sarah Supervisor', email: 'sarah@company.com', role: Role.MANAGER, avatarUrl: 'https://picsum.photos/200/200?random=5', token: 'mock-token-u5' },
];

let LOCAL_USERS: User[] = [];
try {
  const stored = localStorage.getItem('sync_hr_users');
  LOCAL_USERS = stored ? JSON.parse(stored) : [...DEFAULT_USERS];
} catch (e) {
  LOCAL_USERS = [...DEFAULT_USERS];
}

const persistUsers = () => {
    localStorage.setItem('sync_hr_users', JSON.stringify(LOCAL_USERS));
};

let MOCK_TIMESHEETS: Timesheet[] = [];
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  MOCK_TIMESHEETS = stored ? JSON.parse(stored) : [];
} catch (e) {
  MOCK_TIMESHEETS = [];
}

const persistMockData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TIMESHEETS));
};

let MOCK_LEAVES: LeaveRequest[] = [];
try {
  const stored = localStorage.getItem(LEAVE_STORAGE_KEY);
  MOCK_LEAVES = stored ? JSON.parse(stored) : [];
} catch (e) {
  MOCK_LEAVES = [];
}

const persistLeaves = () => {
  localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(MOCK_LEAVES));
};

// Helper to check overlaps
const isOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    return (start1 <= end2) && (end1 >= start2);
};

export const api = {
  auth: {
    login: async (email: string): Promise<User> => {
      await new Promise(r => setTimeout(r, 500));
      const user = LOCAL_USERS.find(u => u.email === email);
      if (!user) throw new Error('User not found');
      return user;
    }
  },

  user: {
    requestManager: async (userId: string, managerId: string): Promise<User> => {
        await new Promise(r => setTimeout(r, 800));
        const user = LOCAL_USERS.find(u => u.id === userId);
        if (user) {
            user.managerId = managerId;
            user.managerApprovalStatus = ManagerApprovalStatus.PENDING;
            persistUsers();
            return user;
        }
        throw new Error("User not found");
    }
  },

  leave: {
    getBalances: async (userId: string): Promise<LeaveBalances> => {
      await new Promise(r => setTimeout(r, 200));
      // Deduct APPROVED leaves from INITIAL_BALANCES
      const approvedLeaves = MOCK_LEAVES.filter(l => l.employeeId === userId && l.status === LeaveStatus.APPROVED);
      
      const balances = { ...INITIAL_BALANCES };
      approvedLeaves.forEach(l => {
        if (balances[l.type] !== undefined) {
          balances[l.type] -= l.days;
        }
      });
      return balances;
    },
    list: async (filters: { employeeId?: string }): Promise<LeaveRequest[]> => {
        await new Promise(r => setTimeout(r, 400));
        let data = [...MOCK_LEAVES];
        if (filters.employeeId) data = data.filter(l => l.employeeId === filters.employeeId);
        return data;
    },
    create: async (payload: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>): Promise<LeaveRequest> => {
        await new Promise(r => setTimeout(r, 600));
        
        // Validation: Check Balances (Annual/Sick/Personal)
        const currentBalances = await api.leave.getBalances(payload.employeeId);
        if (payload.days > currentBalances[payload.type]) {
            throw new Error(`Insufficient balance for ${payload.type}. You only have ${currentBalances[payload.type]} days left.`);
        }

        // Validation: Check Overlaps
        const hasOverlap = MOCK_LEAVES.some(l => 
            l.employeeId === payload.employeeId && 
            l.status !== LeaveStatus.REJECTED &&
            isOverlapping(payload.startDate, payload.endDate, l.startDate, l.endDate)
        );

        if (hasOverlap) {
            throw new Error("Date overlap: You already have a pending or approved leave request during these dates.");
        }

        const newLeave: LeaveRequest = {
            ...payload,
            id: `l${Date.now()}`,
            status: LeaveStatus.SUBMITTED,
            submittedAt: new Date().toISOString()
        };
        MOCK_LEAVES.push(newLeave);
        persistLeaves();
        return newLeave;
    },
    update: async (id: string, payload: Partial<LeaveRequest>): Promise<void> => {
        await new Promise(r => setTimeout(r, 600));
        const idx = MOCK_LEAVES.findIndex(l => l.id === id);
        if (idx >= 0) {
            const current = MOCK_LEAVES[idx];
            
            // Check overlaps and balances if dates/type are changing
            if (payload.startDate || payload.endDate || payload.type || payload.days) {
                const newStart = payload.startDate || current.startDate;
                const newEnd = payload.endDate || current.endDate;
                const newType = payload.type || current.type;
                const newDays = payload.days || current.days;

                // Validate balance for updated request
                const currentBalances = await api.leave.getBalances(current.employeeId);
                if (newDays > currentBalances[newType]) {
                    throw new Error(`Insufficient balance for ${newType}. You only have ${currentBalances[newType]} days left.`);
                }
                
                const hasOverlap = MOCK_LEAVES.some(l => 
                    l.id !== id &&
                    l.employeeId === current.employeeId && 
                    l.status !== LeaveStatus.REJECTED &&
                    isOverlapping(newStart, newEnd, l.startDate, l.endDate)
                );

                if (hasOverlap) {
                    throw new Error("Date overlap: Updated dates conflict with another request.");
                }
            }

            MOCK_LEAVES[idx] = { ...MOCK_LEAVES[idx], ...payload };
            persistLeaves();
        }
    },
    delete: async (id: string): Promise<void> => {
        MOCK_LEAVES = MOCK_LEAVES.filter(l => l.id !== id);
        persistLeaves();
    },
    getPendingForManager: async (managerId: string): Promise<LeaveRequest[]> => {
        await new Promise(r => setTimeout(r, 400));
        return MOCK_LEAVES.filter(l => l.managerId === managerId && l.status === LeaveStatus.SUBMITTED);
    },
    review: async (id: string, status: LeaveStatus.APPROVED | LeaveStatus.REJECTED): Promise<void> => {
        await new Promise(r => setTimeout(r, 600));
        const leave = MOCK_LEAVES.find(l => l.id === id);
        if (leave) {
            leave.status = status;
            persistLeaves();
        }
    }
  },

  timesheet: {
    list: async (filters: { employeeId?: string, status?: string } = {}): Promise<Timesheet[]> => {
      await new Promise(r => setTimeout(r, 400));
      let data = [...MOCK_TIMESHEETS];
      if (filters.employeeId) data = data.filter(t => t.employeeId === filters.employeeId);
      if (filters.status) data = data.filter(t => t.status === filters.status);
      return data;
    },
    getById: async (id: string): Promise<Timesheet | undefined> => {
      await new Promise(r => setTimeout(r, 300));
      return MOCK_TIMESHEETS.find(t => t.id === id);
    },
    create: async (employeeId: string, month: string): Promise<Timesheet> => {
      const user = LOCAL_USERS.find(u => u.id === employeeId);
      const newSheet: Timesheet = {
        id: `t${Date.now()}`,
        employeeId,
        employeeName: user?.name || 'Unknown',
        month,
        status: TimesheetStatus.DRAFT,
        entries: []
      };
      MOCK_TIMESHEETS.push(newSheet);
      persistMockData();
      return newSheet;
    },
    delete: async (id: string): Promise<void> => {
      MOCK_TIMESHEETS = MOCK_TIMESHEETS.filter(t => t.id !== id);
      persistMockData();
    },
    submit: async (id: string): Promise<void> => {
      await new Promise(r => setTimeout(r, 800));
      const t = MOCK_TIMESHEETS.find(ts => ts.id === id);
      if (t) {
        t.status = TimesheetStatus.SUBMITTED;
        t.submittedAt = new Date().toISOString();
        persistMockData();
      }
    },
    upsertEntry: async (timesheetId: string, entry: TimesheetEntry): Promise<void> => {
      const t = MOCK_TIMESHEETS.find(ts => ts.id === timesheetId);
      if (t) {
        const idx = t.entries.findIndex(e => e.id === entry.id);
        if (idx >= 0) t.entries[idx] = entry;
        else t.entries.push(entry);
        persistMockData();
      }
    },
    deleteEntry: async (timesheetId: string, entryId: string): Promise<void> => {
      const t = MOCK_TIMESHEETS.find(ts => ts.id === timesheetId);
      if(t) {
        t.entries = t.entries.filter(e => e.id !== entryId);
        persistMockData();
      }
    },
    review: async (id: string, status: TimesheetStatus.APPROVED | TimesheetStatus.REJECTED, reason?: string): Promise<void> => {
      await new Promise(r => setTimeout(r, 800));
      const t = MOCK_TIMESHEETS.find(ts => ts.id === id);
      if (t) {
        t.status = status;
        t.rejectionReason = reason;
        persistMockData();
      }
    }
  },

  manager: {
    listManagers: async (): Promise<User[]> => {
        await new Promise(r => setTimeout(r, 300));
        return LOCAL_USERS.filter(u => u.role === Role.MANAGER);
    },
    getJoinRequests: async (managerId: string): Promise<User[]> => {
        await new Promise(r => setTimeout(r, 400));
        return LOCAL_USERS.filter(u => u.managerId === managerId && u.managerApprovalStatus === ManagerApprovalStatus.PENDING);
    },
    respondToJoinRequest: async (employeeId: string, approved: boolean): Promise<void> => {
        await new Promise(r => setTimeout(r, 600));
        const user = LOCAL_USERS.find(u => u.id === employeeId);
        if (user) {
            user.managerApprovalStatus = approved ? ManagerApprovalStatus.APPROVED : ManagerApprovalStatus.REJECTED;
            if (!approved) user.managerId = undefined;
            persistUsers();
        }
    },
    getPending: async (managerId: string): Promise<Timesheet[]> => {
      const subordinates = LOCAL_USERS.filter(u => u.managerId === managerId && u.managerApprovalStatus === ManagerApprovalStatus.APPROVED).map(u => u.id);
      return MOCK_TIMESHEETS.filter(t => subordinates.includes(t.employeeId) && t.status === TimesheetStatus.SUBMITTED);
    },
    getTeamTimesheets: async (managerId: string): Promise<Timesheet[]> => {
      const subordinates = LOCAL_USERS.filter(u => u.managerId === managerId && u.managerApprovalStatus === ManagerApprovalStatus.APPROVED).map(u => u.id);
      return MOCK_TIMESHEETS.filter(t => subordinates.includes(t.employeeId));
    },
    getTeamSize: async (managerId: string): Promise<number> => {
      return LOCAL_USERS.filter(u => u.managerId === managerId && u.managerApprovalStatus === ManagerApprovalStatus.APPROVED).length;
    }
  },

  hr: {
    getAllApproved: async (): Promise<Timesheet[]> => MOCK_TIMESHEETS.filter(t => t.status === TimesheetStatus.APPROVED)
  }
};
