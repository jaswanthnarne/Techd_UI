import React from 'react';
import  Loader  from './Loader';

const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className={`min-w-full divide-y divide-gray-300 ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
};

const TableBody = ({ children, loading = false, colSpan = 1 }) => {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="px-6 py-12 text-center">
            <div className="flex justify-center">
              <Loader />
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
};

const TableRow = ({ children, className = '' }) => {
  return <tr className={className}>{children}</tr>;
};

const TableCell = ({ children, className = '', header = false }) => {
  const Component = header ? 'th' : 'td';
  const baseClasses = header 
    ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
    : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
  
  return (
    <Component className={`${baseClasses} ${className}`}>
      {children}
    </Component>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;