import React, { useMemo, useState } from 'react';
import { Session, SessionStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { Calendar, Clock, DollarSign, Trash2, CheckCircle, Search, Filter } from 'lucide-react';

interface ScheduleViewProps {
  sessions: Session[];
  onStatusChange: (id: string, status: SessionStatus) => void;
  onDelete: (id: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ sessions, onStatusChange, onDelete }) => {
  const [filter, setFilter] = useState<'ALL' | SessionStatus>('ALL');
  const [search, setSearch] = useState('');

  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => filter === 'ALL' || s.status === filter)
      .filter(s => s.studentName.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [sessions, filter, search]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(d);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search student or subject..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
          />
        </div>
        
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-full sm:w-auto">
            {(['ALL', SessionStatus.SCHEDULED, SessionStatus.COMPLETED, SessionStatus.PAID] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        filter === status 
                        ? 'bg-white text-gray-800 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <Filter size={32} className="mx-auto mb-2 opacity-20"/>
            <p>No sessions found matching your filters.</p>
          </div>
        ) : (
          filteredSessions.map(session => (
            <div 
              key={session.id} 
              className={`group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden
                ${session.status === SessionStatus.PAID ? 'opacity-75 hover:opacity-100' : ''}
              `}
            >
                {/* Left Colored Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    session.status === SessionStatus.SCHEDULED ? 'bg-blue-500' :
                    session.status === SessionStatus.COMPLETED ? 'bg-amber-500' : 'bg-green-500'
                }`} />

              <div className="flex items-start gap-4 pl-2">
                <div className="bg-gray-50 p-3 rounded-lg text-center min-w-[70px]">
                   <span className="block text-xs font-bold text-gray-500 uppercase">{new Date(session.startTime).toLocaleString('en-us', { month: 'short' })}</span>
                   <span className="block text-xl font-bold text-gray-800">{new Date(session.startTime).getDate()}</span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{session.studentName}</h3>
                    <StatusBadge status={session.status} />
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><Clock size={14}/> {formatTime(session.startTime)} ({session.durationMinutes}m)</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {session.subject}</span>
                    <span className="flex items-center gap-1 font-medium text-gray-700"><DollarSign size={14}/> {session.rate}</span>
                  </div>
                  {session.notes && <p className="text-xs text-gray-400 mt-2 line-clamp-1 italic">"{session.notes}"</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                 {session.status === SessionStatus.SCHEDULED && (
                     <button 
                        onClick={() => onStatusChange(session.id, SessionStatus.COMPLETED)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors"
                        title="Mark as Finished"
                     >
                        <CheckCircle size={18} />
                     </button>
                 )}
                 {session.status === SessionStatus.COMPLETED && (
                     <button 
                        onClick={() => onStatusChange(session.id, SessionStatus.PAID)}
                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 text-xs font-medium transition-colors"
                     >
                        Mark Paid
                     </button>
                 )}
                 
                <button 
                  onClick={() => onDelete(session.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete Session"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
