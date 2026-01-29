import React from 'react';
import { SessionStatus } from '../types';
import { CheckCircle2, Clock, DollarSign } from 'lucide-react';

interface StatusBadgeProps {
  status: SessionStatus;
  mini?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, mini = false }) => {
  const styles = {
    [SessionStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 border-blue-200',
    [SessionStatus.COMPLETED]: 'bg-amber-100 text-amber-800 border-amber-200',
    [SessionStatus.PAID]: 'bg-green-100 text-green-800 border-green-200',
  };

  const labels = {
    [SessionStatus.SCHEDULED]: 'Scheduled',
    [SessionStatus.COMPLETED]: 'Finished',
    [SessionStatus.PAID]: 'Paid',
  };

  const Icons = {
    [SessionStatus.SCHEDULED]: Clock,
    [SessionStatus.COMPLETED]: CheckCircle2,
    [SessionStatus.PAID]: DollarSign,
  };

  const Icon = Icons[status];

  if (mini) {
    return (
        <div className={`w-3 h-3 rounded-full ${styles[status].split(' ')[0]} border ${styles[status].split(' ')[2]}`} title={labels[status]} />
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon size={12} />
      {labels[status]}
    </span>
  );
};
