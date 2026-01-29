import React, { useState, useMemo } from 'react';
import { Session, SessionStatus } from '../types';
import { ChevronLeft, ChevronRight, Clock, DollarSign, CheckCircle2 } from 'lucide-react';

interface CalendarViewProps {
  sessions: Session[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ sessions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const sessionsByDate = useMemo(() => {
    const map: Record<number, Session[]> = {};
    sessions.forEach(session => {
      const sDate = new Date(session.startTime);
      // Ensure we are in the correct month view
      if (sDate.getMonth() === month && sDate.getFullYear() === year) {
        const day = sDate.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(session);
      }
    });
    return map;
  }, [sessions, month, year]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const renderCells = () => {
    const cells = [];
    
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`pad-${i}`} className="min-h-[80px] sm:min-h-[120px] bg-gray-50/30 border-r border-b border-gray-100" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = sessionsByDate[day] || [];
      const dateObj = new Date(year, month, day);
      const isToday = new Date().toDateString() === dateObj.toDateString();
      
      cells.push(
        <div key={`day-${day}`} className={`group min-h-[80px] sm:min-h-[120px] bg-white border-r border-b border-gray-100 p-1 sm:p-2 transition-colors hover:bg-gray-50 flex flex-col gap-1 relative ${isToday ? 'bg-blue-50/20' : ''}`}>
          
          <div className="flex justify-between items-start z-10">
            <span className={`text-xs sm:text-sm font-semibold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
              {day}
            </span>
            {/* Mobile Count Indicator */}
            {daySessions.length > 0 && (
                <span className="sm:hidden text-[10px] text-gray-400 font-medium">{daySessions.length}</span>
            )}
          </div>
          
          {/* Mobile Dots */}
          <div className="sm:hidden flex flex-wrap gap-1 mt-1 content-start pl-1">
            {daySessions.map((s, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${
                    s.status === SessionStatus.PAID ? 'bg-green-500' :
                    s.status === SessionStatus.COMPLETED ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
            ))}
          </div>

          {/* Desktop List */}
          <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px]">
            {daySessions.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(session => (
              <div 
                key={session.id}
                title={`${session.studentName} - ${session.status}`}
                className={`text-[10px] p-1.5 rounded-md border truncate transition-all
                  ${session.status === SessionStatus.SCHEDULED ? 'bg-blue-50 border-blue-100 text-blue-700' : ''}
                  ${session.status === SessionStatus.COMPLETED ? 'bg-amber-50 border-amber-100 text-amber-800 font-medium' : ''}
                  ${session.status === SessionStatus.PAID ? 'bg-green-50 border-green-100 text-green-700 opacity-80' : ''}
                `}
              >
                <div className="flex items-center gap-1">
                   {session.status === SessionStatus.COMPLETED && <DollarSign size={8} className="text-amber-600" />}
                   <span className="font-semibold">{new Date(session.startTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'}).toLowerCase()}</span>
                   <span className="truncate">- {session.studentName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
           <span className="capitalize">{monthName}</span> 
           <span className="text-gray-400 font-normal">{year}</span>
        </h2>
        <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200 transition-colors">Today</button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
            </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {renderCells()}
      </div>
      
      {/* Legend */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/50 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Scheduled</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Finished (Unpaid)</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Paid</div>
      </div>
    </div>
  );
};