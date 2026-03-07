import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

const UpdatesPortal: React.FC = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Company Updates</h2>
            </div>
            <PlaceholderPage 
                title="Company News & Updates" 
                description="This centralized hub will feature important company announcements, policy changes, and news feeds." 
            />
        </div>
    );
};

export default UpdatesPortal;