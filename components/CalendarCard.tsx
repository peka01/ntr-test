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
  const dayOfWeek = trainingDate.toLocaleDateString('sv-SE', { weekday: 'short' });
  const day = trainingDate.getDate();
  const month = trainingDate.toLocaleDateString('sv-SE', { month: 'short' });
  
  // Format time if provided
  const formattedTime = time ? time.substring(0, 5) : '';

  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
      {/* Header with day of week */}
      <div className="bg-emerald-500 text-white text-center py-2 px-3 rounded-t-lg">
        <span className="font-semibold text-sm">{dayOfWeek}</span>
      </div>
      
      {/* Day number */}
      <div className="text-center py-3">
        <div className="text-3xl font-bold text-slate-800">{day}</div>
      </div>
      
      {/* Month */}
      <div className="text-center pb-2">
        <div className="text-sm text-slate-500">{month}</div>
      </div>
      
      {/* Time */}
      {formattedTime && (
        <>
          <div className="border-t border-slate-200"></div>
          <div className="text-center py-2">
            <div className="text-sm text-slate-500">{formattedTime}</div>
          </div>
        </>
      )}
    </div>
  );
};
