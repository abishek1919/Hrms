import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaveRequest, LeaveStatus, CalendarEvent } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui';

// simple copy of holiday list for reference - could be shared later
const GOVERNMENT_HOLIDAYS = [
    // 2025
    { date: '2025-01-01', title: "New Year's Day", type: 'holiday' },
    { date: '2025-01-26', title: 'Republic Day', type: 'holiday' },
    { date: '2025-03-29', title: 'Holi', type: 'holiday' },
    { date: '2025-04-14', title: 'Baisakhi / Vaisakhi', type: 'holiday' },
    { date: '2025-05-01', title: 'Labor Day', type: 'holiday' },
    { date: '2025-08-15', title: 'Independence Day', type: 'holiday' },
    { date: '2025-10-02', title: 'Gandhi Jayanti', type: 'holiday' },
    { date: '2025-10-23', title: 'Diwali (Laxmi Puja)', type: 'holiday' },
    { date: '2025-11-04', title: 'Guru Nanak Jayanti', type: 'holiday' },
    { date: '2025-12-25', title: 'Christmas Day', type: 'holiday' },

    // 2026
    { date: '2026-01-01', title: "New Year's Day", type: 'holiday' },
    { date: '2026-01-26', title: 'Republic Day', type: 'holiday' },
    { date: '2026-03-17', title: 'Holi', type: 'holiday' },
    { date: '2026-04-14', title: 'Baisakhi / Vaisakhi', type: 'holiday' },
    { date: '2026-05-01', title: 'Labor Day', type: 'holiday' },
    { date: '2026-08-15', title: 'Independence Day', type: 'holiday' },
    { date: '2026-10-02', title: 'Gandhi Jayanti', type: 'holiday' },
    { date: '2026-10-12', title: 'Diwali (Laxmi Puja)', type: 'holiday' },
    { date: '2026-11-13', title: 'Guru Nanak Jayanti', type: 'holiday' },
    { date: '2026-12-25', title: 'Christmas Day', type: 'holiday' },
];

export const EmployeeCalendar: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'month' | 'week' | 'day' | 'year'>('month');
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    // load leaves and events
    useEffect(() => {
        if (user) {
            api.leave.list({ employeeId: user.id }).then(data => {
                setLeaves(data.filter(l => l.status === LeaveStatus.APPROVED));
            });
        }
        const stored = localStorage.getItem('calendar_events');
        if (stored) {
            try { setEvents(JSON.parse(stored)); } catch { /* ignore */ }
        }
    }, [user]);

    // persist events whenever they change
    useEffect(() => {
        localStorage.setItem('calendar_events', JSON.stringify(events));
    }, [events]);

const changePeriod = (offset: number) => {
        const d = new Date(calendarDate);
        if (view === 'month') {
            d.setMonth(d.getMonth() + offset);
        } else if (view === 'week') {
            d.setDate(d.getDate() + offset * 7);
        } else if (view === 'day') {
            d.setDate(d.getDate() + offset);
        } else if (view === 'year') {
            d.setFullYear(d.getFullYear() + offset);
        }
        setCalendarDate(d);
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return d;
    };

    const getHolidayForDate = (dateStr: string) => {
        return GOVERNMENT_HOLIDAYS.find(h => h.date === dateStr);
    };

    const renderMonth = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = daysInMonth(year, month);
        const cells = [];

        // blank cells
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-16 w-16"></div>);
        }
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasLeave = leaves.some(l => l.startDate === dateStr);
            const hasHoliday = GOVERNMENT_HOLIDAYS.some(h => h.date === dateStr);
            const hasEvent = events.some(e => e.date === dateStr);
            cells.push(
                <div
                    key={dateStr}
                    className={`h-16 w-16 flex items-center justify-center text-sm font-bold relative ${hasLeave ? 'bg-green-100' : hasHoliday ? 'bg-orange-100' : ''}`}
                >
                    {day}
                    {hasEvent && <span className="absolute bottom-1 right-1 w-2 h-2 bg-primary-600 rounded-full" />}
                </div>
            );
        }
        return cells;
    };

    const handleEditEvent = (id: string) => {
        const ev = events.find(e => e.id === id);
        if (!ev) return;
        const newTitle = prompt('Edit event title (leave blank to delete)', ev.title);
        if (newTitle === null) return;
        if (newTitle.trim() === '') {
            setEvents(prev => prev.filter(e => e.id !== id));
        } else {
            setEvents(prev => prev.map(e => e.id === id ? { ...e, title: newTitle } : e));
        }
    };

    const addEvent = (dateStr: string, hour: number) => {
        const title = prompt('Event title');
        if (title) {
            const id = String(Date.now());
            setEvents(prev => [...prev, { id, date: dateStr, hour, title }]);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black">Calendar</h1>
                <div className="flex gap-3">
                    <button
                        className={`px-3 py-1 rounded-lg ${view === 'day' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
                        onClick={() => setView('day')}
                    >Day</button>
                    <button
                        className={`px-3 py-1 rounded-lg ${view === 'week' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
                        onClick={() => setView('week')}
                    >Week</button>
                    <button
                        className={`px-3 py-1 rounded-lg ${view === 'month' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
                        onClick={() => setView('month')}
                    >Month</button>
                    <button
                        className={`px-3 py-1 rounded-lg ${view === 'year' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
                        onClick={() => setView('year')}
                    >Year</button>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <button onClick={() => changePeriod(-1)} className="p-2 text-gray-600 hover:text-primary-600"><ChevronLeft size={20} /></button>
                <span className="text-xl font-bold">
                    {view === 'month' && calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    {view === 'year' && calendarDate.getFullYear()}
                    {view === 'day' && calendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {view === 'week' && `Week of ${getWeekStart(calendarDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </span>
                <button onClick={() => changePeriod(1)} className="p-2 text-gray-600 hover:text-primary-600"><ChevronRight size={20} /></button>
            </div>

            {view === 'month' && (
                <div className="grid grid-cols-7 gap-1">
                    {['S','M','T','W','T','F','S'].map(d => (
                        <div key={d} className="text-center font-black text-xs text-gray-500 pb-1">{d}</div>
                    ))}
                    {renderMonth()}
                </div>
            )}

            {view === 'day' && (
                <div className="space-y-4">
                    {(() => {
                        const todayStr = calendarDate.toISOString().slice(0,10);
                        const hol = getHolidayForDate(todayStr);
                        if (hol) {
                            return <div className="p-2 bg-orange-100 text-orange-700 font-bold rounded">Holiday: {hol.title}</div>;
                        }
                        return null;
                    })()}
                    {[...Array(24).keys()].map(hour => {
                        const dateStr = calendarDate.toISOString().slice(0,10);
                        const slotEvents = events.filter(e => e.date === dateStr && e.hour === hour);
                        return (
                            <div key={hour} className="flex items-start justify-between p-2 border-b">
                                <div className="w-16 text-sm text-gray-600">{hour}:00</div>
                                <div className="flex-1">
                                    {slotEvents.map(ev => (
                                        <div
                                            key={ev.id}
                                            className="p-2 mb-1 bg-primary-50 rounded cursor-pointer"
                                            onClick={() => handleEditEvent(ev.id)}
                                        >{ev.title}</div>
                                    ))}
                                </div>
                                <button onClick={() => addEvent(dateStr, hour)} className="text-primary-600">+</button>
                            </div>
                        );
                    })}
                </div>
            )}

            {view === 'week' && (
                <div className="overflow-auto">
                    <div className="grid" style={{ gridTemplateColumns: '80px repeat(7,1fr)' }}>
                        <div></div>
                        {Array.from({ length: 7 }).map((_, i) => {
                            const d = new Date(getWeekStart(calendarDate));
                            d.setDate(d.getDate() + i);
                            return (
                                <div key={i} className="text-center font-black text-sm py-1">
                                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                            );
                        })}
                        {[...Array(24).keys()].map(hour => (
                            <React.Fragment key={hour}>
                                <div className="text-sm text-gray-600 py-1">{hour}:00</div>
                                {Array.from({ length: 7 }).map((_, j) => {
                                    const d = new Date(getWeekStart(calendarDate));
                                    d.setDate(d.getDate() + j);
                                    const dateStr = d.toISOString().slice(0,10);
                                    const slotEvents = events.filter(e => e.date === dateStr && e.hour === hour);
                                    return (
                                        <div key={j} className="p-1 border">
                                            {slotEvents.map(ev => (
                                                <div
                                                    key={ev.id}
                                                    className="text-xs bg-primary-50 rounded mb-1 cursor-pointer"
                                                    onClick={() => handleEditEvent(ev.id)}
                                                >{ev.title}</div>
                                            ))}
                                            <button onClick={() => addEvent(dateStr, hour)} className="text-primary-600 text-xs">+</button>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {view === 'year' && (
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 12 }, (_, m) => {
                        const mdate = new Date(calendarDate.getFullYear(), m, 1);
                        return (
                            <div
                                key={m}
                                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                                onClick={() => { setCalendarDate(mdate); setView('month'); }}
                            >
                                <h3 className="text-center font-black text-lg">
                                    {mdate.toLocaleDateString('en-US', { month: 'long' })}
                                </h3>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
