import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaveRequest, LeaveStatus, CalendarEvent } from '../../types';
import { ChevronLeft, ChevronRight, X, Plus, Trash2, Edit2 } from 'lucide-react';
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
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [eventHour, setEventHour] = useState(9);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

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
            cells.push(<div key={`empty-${i}`} className="aspect-square"></div>);
        }
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasLeave = leaves.some(l => l.startDate === dateStr);
            const hasHoliday = GOVERNMENT_HOLIDAYS.some(h => h.date === dateStr);
            const dayEvents = events.filter(e => e.date === dateStr);
            cells.push(
                <div
                    key={dateStr}
                    onClick={() => { setSelectedDate(dateStr); setShowEventModal(true); }}
                    className={`aspect-square p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md flex flex-col ${hasLeave ? 'bg-green-100 border-green-300' : hasHoliday ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                    <div className="text-sm font-bold text-gray-800">{day}</div>
                    <div className="flex-1 text-xs space-y-1 overflow-auto">
                        {dayEvents.slice(0, 2).map(ev => (
                            <div key={ev.id} className="bg-primary-100 text-primary-700 rounded px-1 py-0.5 truncate text-xs">
                                {ev.title}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                        )}
                    </div>
                </div>
            );
        }
        return cells;
    };

    const handleEditEvent = (id: string) => {
        const ev = events.find(e => e.id === id);
        if (!ev) return;
        setEventTitle(ev.title);
        setEventHour(ev.hour);
        setEditingEventId(id);
    };

    const handleDeleteEvent = (id: string) => {
        if (confirm('Delete this event?')) {
            setEvents(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleSaveEvent = () => {
        if (!eventTitle.trim() || !selectedDate) return;

        if (editingEventId) {
            setEvents(prev => prev.map(e => 
                e.id === editingEventId ? { ...e, title: eventTitle, hour: eventHour } : e
            ));
        } else {
            const id = String(Date.now());
            setEvents(prev => [...prev, { id, date: selectedDate, hour: eventHour, title: eventTitle }]);
        }
        
        setEventTitle('');
        setEventHour(9);
        setEditingEventId(null);
    };

    const handleCloseModal = () => {
        setShowEventModal(false);
        setSelectedDate(null);
        setEventTitle('');
        setEventHour(9);
        setEditingEventId(null);
    };

    const addEvent = (dateStr: string, hour: number) => {
        setSelectedDate(dateStr);
        setEventHour(hour);
        setEventTitle('');
        setEditingEventId(null);
        setShowEventModal(true);
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
                <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2">
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                            <div key={d} className="text-center font-black text-sm text-gray-600 py-2">{d}</div>
                        ))}
                        {renderMonth()}
                    </div>
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
                            <div key={hour} className="flex items-start gap-3 p-3 border-b hover:bg-gray-50 transition-colors">
                                <div className="w-16 text-sm font-semibold text-gray-700 flex-shrink-0">{String(hour).padStart(2, '0')}:00</div>
                                <div className="flex-1 space-y-2">
                                    {slotEvents.length === 0 ? (
                                        <div className="text-sm text-gray-400 italic py-1">No events</div>
                                    ) : (
                                        slotEvents.map(ev => (
                                            <div
                                                key={ev.id}
                                                className="p-2 bg-primary-100 border border-primary-300 rounded-lg cursor-pointer hover:bg-primary-200 transition-colors flex items-center justify-between group"
                                                onClick={() => { handleEditEvent(ev.id); }}
                                            >
                                                <span className="font-semibold text-primary-900">{ev.title}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                                                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-600 hover:bg-red-100 rounded transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button 
                                    onClick={() => addEvent(dateStr, hour)} 
                                    className="flex-shrink-0 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center gap-1 whitespace-nowrap"
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
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
                                <div className="text-sm font-semibold text-gray-700 py-2 border-b">{String(hour).padStart(2, '0')}:00</div>
                                {Array.from({ length: 7 }).map((_, j) => {
                                    const d = new Date(getWeekStart(calendarDate));
                                    d.setDate(d.getDate() + j);
                                    const dateStr = d.toISOString().slice(0,10);
                                    const slotEvents = events.filter(e => e.date === dateStr && e.hour === hour);
                                    return (
                                        <div key={j} className="p-2 border-b border-r min-h-20 relative hover:bg-gray-50 transition-colors group">
                                            <div className="space-y-1 mb-2">
                                                {slotEvents.map(ev => (
                                                    <div
                                                        key={ev.id}
                                                        className="text-xs bg-primary-100 border border-primary-300 rounded p-1 cursor-pointer hover:bg-primary-200 transition-colors flex items-center justify-between group/event"
                                                        onClick={() => handleEditEvent(ev.id)}
                                                    >
                                                        <span className="font-semibold truncate">{ev.title}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                                                            className="opacity-0 group-hover/event:opacity-100 ml-1 text-red-600 hover:text-red-800 transition-all flex-shrink-0"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => addEvent(dateStr, hour)} 
                                                className="opacity-0 group-hover:opacity-100 absolute bottom-1 right-1 p-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-all"
                                                title="Add Event"
                                            >
                                                <Plus size={14} />
                                            </button>
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

            {/* Event Modal */}
            {showEventModal && selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg mx-4 bg-white rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {new Date(selectedDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </h2>
                            <button 
                                onClick={handleCloseModal}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Holiday Notice */}
                        {(() => {
                            const holiday = getHolidayForDate(selectedDate);
                            if (holiday) {
                                return (
                                    <div className="p-3 mb-4 bg-orange-100 text-orange-700 rounded-lg font-semibold">
                                        🎉 Holiday: {holiday.title}
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Leave Notice */}
                        {(() => {
                            const hasLeave = leaves.some(l => l.startDate === selectedDate);
                            if (hasLeave) {
                                return (
                                    <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-lg font-semibold">
                                        ✓ Leave Approved
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Events List */}
                        <div className="max-h-64 overflow-y-auto mb-4">
                            <h3 className="font-bold text-lg mb-3">Events</h3>
                            {events.filter(e => e.date === selectedDate).length === 0 ? (
                                <p className="text-gray-500 text-sm">No events scheduled</p>
                            ) : (
                                <div className="space-y-2">
                                    {events.filter(e => e.date === selectedDate).map(ev => (
                                        <div 
                                            key={ev.id}
                                            className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200"
                                        >
                                            <div className="flex-1">
                                                <p className="font-bold text-primary-900">{ev.title}</p>
                                                <p className="text-xs text-gray-500">{ev.hour}:00</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditEvent(ev.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEvent(ev.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Event Form */}
                        <div className="border-t pt-4">
                            <h3 className="font-bold mb-3">
                                {editingEventId ? 'Edit Event' : 'Add Event'}
                            </h3>
                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="text-sm text-gray-600 block mb-1">Event Title</label>
                                    <input
                                        type="text"
                                        value={eventTitle}
                                        onChange={(e) => setEventTitle(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEvent()}
                                        placeholder="Event title..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 block mb-1">Time</label>
                                    <select
                                        value={eventHour}
                                        onChange={(e) => setEventHour(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                    >
                                        {[...Array(24).keys()].map(hour => (
                                            <option key={hour} value={hour}>
                                                {String(hour).padStart(2, '0')}:00
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEvent}
                                    disabled={!eventTitle.trim()}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                >
                                    <Plus size={16} className="inline mr-2" />
                                    {editingEventId ? 'Update' : 'Add'}
                                </button>
                                {editingEventId && (
                                    <button
                                        onClick={() => { setEditingEventId(null); setEventTitle(''); setEventHour(9); }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
