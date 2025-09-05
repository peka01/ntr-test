import React from 'react';

interface CalendarCardProps {
  date?: string;
  time?: string;
  className?: string;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({ date, time, className = '' }) => {
  if (!date) {
    return null;
  }

  // Parse the date to extract day, month, and day of week
  const trainingDate = new Date(date);
  
  // Check if date is valid
  if (isNaN(trainingDate.getTime())) {
    return null;
  }
  
  const dayOfWeek = trainingDate.toLocaleDateString('sv-SE', { weekday: 'short' });
  const day = trainingDate.getDate();
  const month = trainingDate.toLocaleDateString('sv-SE', { month: 'short' });
  
  // Format time if provided
  const formattedTime = time ? time.substring(0, 5) : '';

  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
      {/* Header with day of week */}
      <div className="bg-cyan-500 text-white text-center py-1 px-2 rounded-t-lg">
        <span className="font-semibold text-xs">{dayOfWeek}</span>
      </div>
      
      {/* Day number and month */}
      <div className="text-center py-1">
        <div className="text-xl font-bold text-slate-800">{day}</div>
        <div className="text-xs text-slate-500">{month}</div>
      </div>
      
      {/* Time */}
      {formattedTime && (
        <div className="border-t border-slate-200 text-center py-1">
          <div className="text-xs text-slate-500">{formattedTime}</div>
        </div>
      )}
    </div>
  );
};
