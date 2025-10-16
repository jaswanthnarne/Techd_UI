import React from 'react';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

const StudentLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSidebar currentPath={window.location.pathname} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader title={title} subtitle={subtitle} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;