import React from 'react';

const Announcements = () => {
  const announcements = [
    { title: 'New Protocol for Patient Handovers', time: '1d ago', author: 'Dr. Evans' },
    { title: 'Scheduled Maintenance for EHR System', time: '3d ago', author: 'IT Department' },
  ];

  return (
    <div className="space-y-4">
      {announcements.map((ann, index) => (
        <div key={index}>
          <h4 className="text-sm font-medium text-dark-200 truncate">{ann.title}</h4>
          <p className="text-xs text-dark-400">
            {ann.author} • {ann.time}
          </p>
        </div>
      ))}
      <a href="#" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
        View all announcements
      </a>
    </div>
  );
};

export default Announcements;