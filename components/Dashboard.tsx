import React, { useMemo } from 'react';
import { Session, SessionStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DollarSign, Clock, Users, TrendingUp, BadgeDollarSign } from 'lucide-react';

interface DashboardProps {
  sessions: Session[];
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions }) => {
  
  const stats = useMemo(() => {
    return sessions.reduce((acc, session) => {
      // Total Sessions
      acc.totalSessions++;

      // Earnings
      if (session.status === SessionStatus.PAID) {
        acc.totalEarnings += session.rate;
      }
      
      // Pending
      if (session.status === SessionStatus.COMPLETED) {
        acc.pendingPayment += session.rate;
      }

      // Upcoming
      if (session.status === SessionStatus.SCHEDULED && new Date(session.startTime) > new Date()) {
        acc.upcomingSessions++;
      }

      return acc;
    }, {
      totalSessions: 0,
      totalEarnings: 0,
      pendingPayment: 0,
      upcomingSessions: 0
    });
  }, [sessions]);

  const statusData = useMemo(() => {
    const counts = {
      [SessionStatus.SCHEDULED]: 0,
      [SessionStatus.COMPLETED]: 0,
      [SessionStatus.PAID]: 0,
    };
    sessions.forEach(s => counts[s.status]++);
    return [
      { name: 'Scheduled', value: counts[SessionStatus.SCHEDULED], color: '#60A5FA' }, // Blue 400
      { name: 'Finished', value: counts[SessionStatus.COMPLETED], color: '#FBBF24' }, // Amber 400
      { name: 'Paid', value: counts[SessionStatus.PAID], color: '#34D399' }, // Emerald 400
    ].filter(item => item.value > 0);
  }, [sessions]);

  // Weekly earnings logic (simplified for last 7 sessions or grouping by student for variety)
  const studentData = useMemo(() => {
     const earningsByStudent: {[key:string]: number} = {};
     sessions.forEach(s => {
       if (s.status === SessionStatus.PAID || s.status === SessionStatus.COMPLETED) {
         earningsByStudent[s.studentName] = (earningsByStudent[s.studentName] || 0) + s.rate;
       }
     });
     return Object.entries(earningsByStudent)
       .map(([name, value]) => ({ name, value }))
       .sort((a, b) => b.value - a.value)
       .slice(0, 5); // Top 5
  }, [sessions]);


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Earnings" 
          value={`LKR ${stats.totalEarnings}`} 
          icon={<BadgeDollarSign className="text-green-600" size={20}/>}
          bg="bg-green-50"
          border="border-green-100"
        />
        <StatCard 
          title="Pending" 
          value={`LKR ${stats.pendingPayment}`} 
          icon={<TrendingUp className="text-amber-600" size={20}/>}
          bg="bg-amber-50"
          border="border-amber-100"
        />
        <StatCard 
          title="Upcoming" 
          value={stats.upcomingSessions} 
          icon={<Clock className="text-blue-600" size={20}/>}
          bg="bg-blue-50"
          border="border-blue-100"
        />
        <StatCard 
          title="Total Sessions" 
          value={stats.totalSessions} 
          icon={<Users className="text-purple-600" size={20}/>}
          bg="bg-purple-50"
          border="border-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-700 font-semibold mb-4">Session Status</h3>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}/>
                    {item.name}
                </div>
            ))}
          </div>
        </div>

        {/* Top Students Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-700 font-semibold mb-4">Top Students (Value)</h3>
          <div className="h-64">
            {studentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill="#818CF8" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                 <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg, border }: { title: string, value: string | number, icon: React.ReactNode, bg: string, border: string }) => (
  <div className={`p-4 rounded-xl ${bg} border ${border} transition-transform hover:scale-[1.02]`}>
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{title}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
  </div>
);
