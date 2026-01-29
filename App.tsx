import React, { useState, useEffect } from 'react';
import { LayoutGrid, CalendarDays, Plus, Calendar } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ScheduleView } from './components/ScheduleView';
import { CalendarView } from './components/CalendarView';
import { SmartAddModal } from './components/SmartAddModal';
import { getSessions, saveSession, seedDataIfEmpty, updateSession, deleteSession } from './services/storageService';
import { Session, SessionStatus } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'calendar'>('schedule');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const loadData = () => {
        seedDataIfEmpty();
        setSessions(getSessions());
        setLoading(false);
    };
    loadData();
  }, []);

  const handleAddSession = (newSession: Session) => {
    const updatedList = saveSession(newSession);
    setSessions(updatedList);
  };

  const handleStatusChange = (id: string, status: SessionStatus) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      const updatedList = updateSession({ ...session, status });
      setSessions(updatedList);
    }
  };

  const handleDelete = (id: string) => {
      if(window.confirm("Are you sure you want to delete this session?")) {
        const updatedList = deleteSession(id);
        setSessions(updatedList);
      }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20 md:pb-0">
      
      {/* Navbar - Desktop */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">TutorTrack</h1>
        </div>
        
        <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutGrid size={18}/>} 
            label="Dashboard" 
          />
          <TabButton 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')} 
            icon={<CalendarDays size={18}/>} 
            label="Schedule" 
          />
          <TabButton 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
            icon={<Calendar size={18}/>} 
            label="Calendar" 
          />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-blue-200 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Session</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {loading ? (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            <>
                {activeTab === 'dashboard' && <Dashboard sessions={sessions} />}
                {activeTab === 'schedule' && (
                    <ScheduleView 
                        sessions={sessions} 
                        onStatusChange={handleStatusChange} 
                        onDelete={handleDelete}
                    />
                )}
                {activeTab === 'calendar' && (
                    <CalendarView sessions={sessions} />
                )}
            </>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around z-40">
        <MobileTabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutGrid size={24}/>} 
            label="Dash" 
        />
        <MobileTabButton 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')} 
            icon={<CalendarDays size={24}/>} 
            label="List" 
        />
        <div className="relative -top-6 mx-2">
             <button 
                onClick={() => setIsModalOpen(true)}
                className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-300 transform active:scale-95 transition-transform"
            >
                <Plus size={28} />
            </button>
        </div>
        <MobileTabButton 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
            icon={<Calendar size={24}/>} 
            label="Cal" 
        />
        {/* Placeholder for symmetry or future setting feature, or just distribute space */}
        <div className="w-10"></div> 
      </div>

      <SmartAddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddSession} 
      />
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
      active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

const MobileTabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-colors ${
            active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
        }`}
    >
        {icon}
        <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
);

export default App;