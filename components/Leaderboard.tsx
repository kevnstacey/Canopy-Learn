
import React from 'react';
import { User, TraineeProgress } from '../types';

interface LeaderboardProps {
    users: User[];
    progress: TraineeProgress[];
    currentUserId?: string;
    limit?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, progress, currentUserId, limit = 5 }) => {
    // Merge user data with progress and sort by points
    const rankings = progress
        .map(p => {
            const user = users.find(u => u.user_id === p.userId);
            return {
                ...p,
                name: user?.name || 'Unknown User',
                avatar: user?.profilePictureUrl || 'https://i.pravatar.cc/150',
                isMe: p.userId === currentUserId
            };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, limit);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-hh-red text-white flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span>🏆</span> Leaderboard
                </h3>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Top Learners</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {rankings.map((user, index) => (
                    <div 
                        key={user.userId} 
                        className={`flex items-center gap-3 p-3 ${user.isMe ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
                    >
                        <div className={`w-6 text-center font-bold ${index < 3 ? 'text-yellow-500 text-lg' : 'text-slate-400 text-sm'}`}>
                            {index + 1}
                        </div>
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600" />
                        <div className="flex-grow">
                            <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                {user.name}
                                {user.isMe && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded font-bold">YOU</span>}
                            </div>
                            <div className="text-xs text-slate-500">{user.badges.length} Badges</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-hh-red text-sm">{user.points.toLocaleString()} pts</div>
                            {user.streakDays > 0 && <div className="text-[10px] text-orange-500 font-semibold">🔥 {user.streakDays} day streak</div>}
                        </div>
                    </div>
                ))}
                {rankings.length === 0 && <div className="p-4 text-center text-slate-500">No activity yet.</div>}
            </div>
        </div>
    );
};

export default Leaderboard;
