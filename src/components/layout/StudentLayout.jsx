// import React from "react";
// import StudentSidebar from "./StudentSidebar";
// import StudentHeader from "./StudentHeader";

// const StudentLayout = ({ children, title, subtitle }) => {
//   return (
//     <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 overflow-hidden">
//       <StudentSidebar />

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <StudentHeader title={title} subtitle={subtitle} />

//         <main className="flex-1 overflow-y-auto p-8 bg-transparent">
//           <div className="max-w-7xl mx-auto space-y-8">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default StudentLayout;

import React from "react";
import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";

const StudentLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 overflow-hidden">
      <StudentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <StudentHeader title={title} subtitle={subtitle} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-transparent mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
