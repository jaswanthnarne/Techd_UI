// import React from 'react';
// import Sidebar from './Sidebar';
// import Header from './Header';

// const Layout = ({ children, title, subtitle }) => {
//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar currentPath={window.location.pathname} />

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Header title={title} subtitle={subtitle} />

//         <main className="flex-1 overflow-y-auto p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPath={window.location.pathname} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header title={title} subtitle={subtitle} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 mt-16 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
