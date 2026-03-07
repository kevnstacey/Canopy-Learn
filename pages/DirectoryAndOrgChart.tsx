import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { User } from '../types';

interface OrgChartNodeProps {
  user: User;
  children: User[];
  allUsers: User[];
}

const OrgChartNode: React.FC<OrgChartNodeProps> = ({ user, children, allUsers }) => {
  return (
    <li className="relative">
      <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <img src={user.profilePictureUrl} alt={user.name} className="w-16 h-16 rounded-full mb-2" />
        <p className="font-bold text-center">{user.name}</p>
        <p className="text-xs text-slate-500 text-center">{user.managerType || user.role}</p>
      </div>
      {children.length > 0 && (
        <ul className="flex justify-center gap-4 pt-8 before:content-[''] before:absolute before:left-1/2 before:top-full before:h-8 before:border-l-2 before:border-slate-300 dark:before:border-slate-600 before:-translate-y-full before:-translate-x-px">
          {children.map(child => (
            <OrgChartNode key={child.id} user={child} children={allUsers.filter(u => u.managerId === child.id)} allUsers={allUsers} />
          ))}
        </ul>
      )}
    </li>
  );
};

const DirectoryAndOrgChart: React.FC<{ users: User[] }> = ({ users }) => {
    const [view, setView] = useState<'Directory' | 'Org Chart'>('Directory');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => 
        users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [users, searchTerm]);

    const rootUser = useMemo(() => users.find(u => u.managerId === null), [users]);

    return (
        <Card title="Staff Directory & Org Chart">
             <div className="flex justify-between items-center mb-4">
                <div className="flex rounded-md shadow-sm">
                    <button onClick={() => setView('Directory')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${view === 'Directory' ? 'bg-hh-red text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Directory</button>
                    <button onClick={() => setView('Org Chart')} className={`-ml-px px-4 py-2 text-sm font-medium rounded-r-md ${view === 'Org Chart' ? 'bg-hh-red text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Org Chart</button>
                </div>
                 {view === 'Directory' && <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" />}
            </div>

            {view === 'Directory' ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                         <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                        <img src={user.profilePictureUrl} alt={user.name} className="w-10 h-10 rounded-full"/>
                                        <div>
                                            <div className="text-sm font-medium">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.role}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.departments.join(', ')}</td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto p-8 bg-dots">
                   {rootUser ? (
                       <ul className="flex justify-center">
                           <OrgChartNode user={rootUser} children={users.filter(u => u.managerId === rootUser.id)} allUsers={users} />
                       </ul>
                   ) : <p>No executive user found to root the chart.</p>}
                   <style>{`.bg-dots{ background-image: radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0); background-size: 20px 20px; } .dark .bg-dots{ background-image: radial-gradient(circle at 1px 1px, #475569 1px, transparent 0); }`}</style>
                </div>
            )}
        </Card>
    );
};

export default DirectoryAndOrgChart;